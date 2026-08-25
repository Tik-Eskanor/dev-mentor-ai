import { Pool, neonConfig } from '@neondatabase/serverless';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import ws from 'ws';
import type { User } from '../types/index';

// Configure Neon driver for serverless/Node environments cleanly
if (typeof window === 'undefined') {
  if (ws) {
    neonConfig.webSocketConstructor = ws;
  }
  if (typeof fetch !== 'undefined') {
    neonConfig.fetchFunction = fetch;
  }
  neonConfig.poolQueryViaFetch = true;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface StoredSession {
  userId: string;
  createdAt: number;
}

// Use /tmp directory when running in serverless / Vercel environment
const DATA_DIR = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? path.join('/tmp', '.data')
  : path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Local fallback stores
const fallbackUsers = new Map<string, StoredUser>();
const fallbackSessions = new Map<string, StoredSession>();

let pool: Pool | null = null;
let isNeonConnected = false;
let initPromise: Promise<void> | null = null;

function getConnectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
}

export function isUsingNeon(): boolean {
  return isNeonConnected;
}

// Fallback file persistence helpers
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore
  }
}

function loadLocalFallback() {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed: StoredUser[] = JSON.parse(data);
      parsed.forEach((u) => fallbackUsers.set(u.email.toLowerCase(), u));
    }
  } catch (err) {
    console.warn('Local users fallback load warning:', err);
  }

  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const parsed: Record<string, StoredSession> = JSON.parse(data);
      Object.entries(parsed).forEach(([t, s]) => fallbackSessions.set(t, s));
    }
  } catch (err) {
    console.warn('Local sessions fallback load warning:', err);
  }
}

function saveLocalUsers() {
  try {
    ensureDataDir();
    const list = Array.from(fallbackUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Local users save error:', err);
  }
}

function saveLocalSessions() {
  try {
    ensureDataDir();
    const obj: Record<string, StoredSession> = {};
    fallbackSessions.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Local sessions save error:', err);
  }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const SEED_USERS = [
  {
    id: 'user-demo-1',
    name: 'Alex Vance',
    email: 'alex@techtor.ai',
    role: 'Principal Architect',
    avatar: '🏛️',
    password: 'password123',
  },
  {
    id: 'user-demo-2',
    name: 'Sarah Connor',
    email: 'sarah@security.io',
    role: 'Senior Security Engineer',
    avatar: '🛡️',
    password: 'password123',
  },
  {
    id: 'user-demo-3',
    name: 'Marcus Brody',
    email: 'marcus@techtor.ai',
    role: 'Full Stack Engineer',
    avatar: '⚡',
    password: 'password123',
  },
];

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    loadLocalFallback();

    const connectionString = getConnectionString();
    if (connectionString) {
      try {
        console.log('[Techtor DB] Attempting connection to Neon Database...');
        pool = new Pool({ connectionString });
        
        // Prevent background pool errors from triggering uncaughtException
        pool.on('error', (err) => {
          console.warn('[Techtor DB] Neon database connection notice:', err?.message || String(err));
          isNeonConnected = false;
        });

        // Test query with quick response verification
        const testRes = await pool.query('SELECT NOW() as current_time');
        console.log('[Techtor DB] Neon Database connected at:', testRes.rows[0]?.current_time);

        // Run migrations
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Seed initial accounts in Neon if empty
        for (const acc of SEED_USERS) {
          const emailLower = acc.email.toLowerCase();
          const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR id = $2', [emailLower, acc.id]);
          if (existing.rows.length === 0) {
            const salt = crypto.randomBytes(16).toString('hex');
            const passwordHash = hashPassword(acc.password, salt);
            await pool.query(
              `INSERT INTO users (id, name, email, role, avatar, password_hash, salt, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
               ON CONFLICT (id) DO NOTHING`,
              [acc.id, acc.name, emailLower, acc.role, acc.avatar, passwordHash, salt]
            );
          }
        }

        isNeonConnected = true;
        console.log('[Techtor DB] Neon PostgreSQL tables and seed accounts verified successfully.');
        return;
      } catch (err: any) {
        console.error('[Techtor DB] Neon connection failed:', err);
        isNeonConnected = false;
        pool = null;
        initPromise = null; // allow retry if connection was transient
        throw new Error(`Neon Database Connection Failed: ${err.message || String(err)}`);
      }
    } else {
      console.log('[Techtor DB] No DATABASE_URL detected.');
    }

    // Seed local fallback if DATABASE_URL is not provided
    let added = false;
    for (const acc of SEED_USERS) {
      const emailLower = acc.email.toLowerCase();
      if (!fallbackUsers.has(emailLower)) {
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = hashPassword(acc.password, salt);
        fallbackUsers.set(emailLower, {
          id: acc.id,
          name: acc.name,
          email: emailLower,
          role: acc.role,
          avatar: acc.avatar,
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
        });
        added = true;
      }
    }
    if (added) {
      saveLocalUsers();
    }
  })();

  return initPromise;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const emailLower = email.toLowerCase().trim();
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      console.warn('[Techtor DB] findUserByEmail init error:', err?.message);
    }

    if (pool && isNeonConnected) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [emailLower]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            avatar: row.avatar,
            passwordHash: row.password_hash,
            salt: row.salt,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          };
        }
        return null;
      } catch (err: any) {
        console.error('[Techtor DB] findUserByEmail Neon error:', err);
        throw new Error(`Database error querying user from Neon: ${err.message || String(err)}`);
      }
    }
  }

  return fallbackUsers.get(emailLower) || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      console.warn('[Techtor DB] findUserById init error:', err?.message);
    }

    if (pool && isNeonConnected) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            avatar: row.avatar,
            passwordHash: row.password_hash,
            salt: row.salt,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          };
        }
        return null;
      } catch (err: any) {
        console.error('[Techtor DB] findUserById Neon error:', err);
        throw new Error(`Database error querying user from Neon: ${err.message || String(err)}`);
      }
    }
  }

  const user = Array.from(fallbackUsers.values()).find((u) => u.id === id);
  return user || null;
}

export async function insertUser(user: StoredUser): Promise<void> {
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      throw new Error(`Failed to save account to Neon Database: ${err.message}. Please verify DATABASE_URL in Vercel settings.`);
    }

    if (!pool || !isNeonConnected) {
      throw new Error('Neon database is not connected. Please check your DATABASE_URL environment variable on Vercel.');
    }

    try {
      await pool.query(
        `INSERT INTO users (id, name, email, role, avatar, password_hash, salt, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, user.name, user.email.toLowerCase(), user.role, user.avatar, user.passwordHash, user.salt, user.createdAt]
      );
      return;
    } catch (err: any) {
      console.error('[Techtor DB] insertUser Neon error:', err);
      if (err.code === '23505') {
        throw new Error('An account with this email already exists in the Neon database.');
      }
      throw new Error(`Neon Database Error: ${err.message || String(err)}`);
    }
  }

  // If hosting on Vercel and DATABASE_URL is missing, inform the developer!
  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL environment variable is missing on Vercel! Please add your Neon connection string in Vercel Project Settings -> Environment Variables.');
  }

  fallbackUsers.set(user.email.toLowerCase(), user);
  saveLocalUsers();
}

export async function insertSession(token: string, userId: string): Promise<void> {
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      throw new Error(`Failed to save session to Neon Database: ${err.message}`);
    }

    if (pool && isNeonConnected) {
      try {
        await pool.query(
          `INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, NOW())
           ON CONFLICT (token) DO UPDATE SET user_id = $2, created_at = NOW()`,
          [token, userId]
        );
        return;
      } catch (err: any) {
        console.error('[Techtor DB] insertSession Neon error:', err);
        throw new Error(`Neon Session Error: ${err.message || String(err)}`);
      }
    }
  }

  fallbackSessions.set(token, { userId, createdAt: Date.now() });
  saveLocalSessions();
}

export async function findSession(token: string): Promise<{ userId: string } | null> {
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      console.warn('[Techtor DB] findSession init error:', err?.message);
    }

    if (pool && isNeonConnected) {
      try {
        const res = await pool.query('SELECT user_id FROM sessions WHERE token = $1', [token]);
        if (res.rows.length > 0) {
          return { userId: res.rows[0].user_id };
        }
        return null;
      } catch (err: any) {
        console.error('[Techtor DB] findSession Neon error:', err);
        throw new Error(`Database error checking session in Neon: ${err.message || String(err)}`);
      }
    }
  }

  const sess = fallbackSessions.get(token);
  return sess ? { userId: sess.userId } : null;
}

export async function removeSession(token: string): Promise<void> {
  const connectionString = getConnectionString();

  if (connectionString) {
    try {
      await initDatabase();
    } catch (err: any) {
      console.warn('[Techtor DB] removeSession init error:', err?.message);
    }

    if (pool && isNeonConnected) {
      try {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
        return;
      } catch (err: any) {
        console.error('[Techtor DB] removeSession Neon error:', err);
      }
    }
  }

  fallbackSessions.delete(token);
  saveLocalSessions();
}

export function sanitizeUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}
