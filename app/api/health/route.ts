import { NextResponse } from 'next/server';
import { isUsingNeon, initDatabase } from '../../../src/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
  } catch {
    // ignore
  }
  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    db: isUsingNeon() ? 'neon_postgresql' : 'local_storage',
  });
}
