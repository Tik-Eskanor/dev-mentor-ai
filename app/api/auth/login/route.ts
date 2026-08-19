import { NextResponse } from 'next/server';
import { handleLogin } from '../../../../src/server/authHandlers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleLogin(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid credentials' }, { status: 401 });
  }
}
