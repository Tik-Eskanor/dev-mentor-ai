import { NextResponse } from 'next/server';
import { isUsingNeon, initDatabase } from '../../../../src/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDatabase();
  } catch {
    // ignore
  }
  return NextResponse.json({
    neonConnected: isUsingNeon(),
    database: isUsingNeon() ? 'Neon Serverless PostgreSQL' : 'Local Persistent Storage',
  });
}
