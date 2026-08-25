import { NextResponse } from 'next/server';
import { isUsingNeon, initDatabase } from '../../../src/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({
      status: 'ok',
      uptime: process.uptime(),
      db: isUsingNeon() ? 'neon_postgresql' : 'local_storage',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ok',
      uptime: process.uptime(),
      db: 'local_storage',
      error: error?.message || 'DB initialization notice',
    });
  }
}

