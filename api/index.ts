import express from 'express';
import dotenv from 'dotenv';
import { initDatabase, isUsingNeon } from '../src/server/db';
import {
  handleCodeReview,
  handlePairChat,
  handleRefactor,
  handleLearningPath,
  handleExecuteCode,
  handleAutoFix,
} from '../src/server/apiHandlers';
import {
  handleRegister,
  handleLogin,
  handleGetMe,
  handleLogout,
} from '../src/server/authHandlers';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    try {
      await initDatabase();
    } catch (err) {
      console.error('Database initialization error:', err);
    }
    dbInitialized = true;
  }
}

app.use(async (_req, _res, next) => {
  await ensureDb();
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: isUsingNeon() ? 'neon_postgresql' : 'local_storage',
  });
});

// Auth Status
app.get('/api/auth/status', (_req, res) => {
  res.json({
    neonConnected: isUsingNeon(),
    database: isUsingNeon() ? 'Neon Serverless PostgreSQL' : 'Local Persistent Storage',
  });
});

// Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await handleRegister(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await handleLogin(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const result = await handleGetMe(req.headers.authorization);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const result = await handleLogout(req.headers.authorization);
    res.json(result);
  } catch (err: any) {
    res.json({ success: true });
  }
});

// Mentor API Endpoints
app.post('/api/mentor/review', async (req, res) => {
  try {
    const result = await handleCodeReview(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/review:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/mentor/chat', async (req, res) => {
  try {
    const result = await handlePairChat(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/chat:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/mentor/refactor', async (req, res) => {
  try {
    const result = await handleRefactor(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/refactor:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/mentor/learning-path', async (req, res) => {
  try {
    const result = await handleLearningPath(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/learning-path:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/mentor/execute', async (req, res) => {
  try {
    const result = await handleExecuteCode(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/execute:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/mentor/autofix', async (req, res) => {
  try {
    const result = await handleAutoFix(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/mentor/autofix:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Global Express Error Handler for Vercel Serverless Functions
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Vercel API error:', err);
  res.status(500).json({ error: err?.message || 'Serverless Function Execution Error' });
});

export default app;
