import { NextResponse } from 'next/server';
import { handleGetMe } from '../../../../src/server/authHandlers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const result = await handleGetMe(authHeader);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
