import { NextResponse } from 'next/server';
import { handlePairChat } from '../../../../src/server/apiHandlers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handlePairChat(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}
