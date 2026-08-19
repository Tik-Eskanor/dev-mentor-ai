import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  insertUser,
  insertSession,
  findSession,
  removeSession,
  hashPassword,
  generateToken,
  sanitizeUser,
  StoredUser,
} from './db';

export async function handleRegister(body: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}) {
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role?.trim() || 'Full Stack Engineer';

  if (!name || name.length < 2) {
    throw new Error('Name must be at least 2 characters long.');
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const id = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const roleAvatars: Record<string, string> = {
    'Principal Architect': '🏛️',
    'Senior Security Engineer': '🛡️',
    'Performance Engineer': '⚡',
    'Full Stack Engineer': '💻',
    'Frontend Developer': '🎨',
    'Backend Engineer': '⚙️',
    'Student / Learner': '🎓',
  };

  const avatar = roleAvatars[role] || '🚀';

  const newUser: StoredUser = {
    id,
    name,
    email,
    role,
    avatar,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  await insertUser(newUser);

  const token = generateToken();
  await insertSession(token, id);

  return {
    user: sanitizeUser(newUser),
    token,
    message: 'Registration successful!',
  };
}

export async function handleLogin(body: {
  email?: string;
  password?: string;
}) {
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    throw new Error('Please provide both email and password.');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }

  const testHash = hashPassword(password, user.salt);
  if (testHash !== user.passwordHash) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }

  const token = generateToken();
  await insertSession(token, user.id);

  return {
    user: sanitizeUser(user),
    token,
    message: 'Login successful!',
  };
}

export async function handleGetMe(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing bearer token.');
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    throw new Error('Unauthorized: Empty token.');
  }

  const session = await findSession(token);
  if (!session) {
    throw new Error('Unauthorized: Session expired. Please sign in again.');
  }

  const user = await findUserById(session.userId);
  if (!user) {
    throw new Error('User not found.');
  }

  return {
    user: sanitizeUser(user),
  };
}

export async function handleLogout(authHeader?: string) {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (token) {
      await removeSession(token);
    }
  }
  return { success: true, message: 'Logged out successfully.' };
}
