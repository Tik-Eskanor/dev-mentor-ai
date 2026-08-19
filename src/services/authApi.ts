import { User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE') || text.includes('<html') || text.includes('The page')) {
      throw new Error(
        `API endpoint returned an HTML error page (HTTP ${response.status}). If hosting on Vercel, please check that DATABASE_URL is added to Vercel Environment Variables.`
      );
    }
    throw new Error(`Unexpected server response (HTTP ${response.status}): ${text.slice(0, 80)}`);
  }
  return response.json();
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    return data;
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    throw new Error(err.message || 'Network error connecting to authentication server.');
  }
}

export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Invalid credentials.');
    }

    return data;
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    throw new Error(err.message || 'Network error connecting to authentication server.');
  }
}

export async function apiGetMe(token: string): Promise<{ user: User }> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error || 'Session expired.');
    }

    return data;
  } catch (err: any) {
    throw err;
  }
}

export async function apiLogout(token?: string | null): Promise<void> {
  if (!token) return;
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore
  }
}
