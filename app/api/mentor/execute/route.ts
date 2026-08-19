import { NextResponse } from 'next/server';
import { handleExecuteCode } from '../../../../src/server/apiHandlers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleExecuteCode(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Execution failed' }, { status: 500 });
  }
}
