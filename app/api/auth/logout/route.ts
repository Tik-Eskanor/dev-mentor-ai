import { NextResponse } from 'next/server';
import { handleLogout } from '../../../../src/server/authHandlers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const result = await handleLogout(authHeader);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ success: true });
  }
}
