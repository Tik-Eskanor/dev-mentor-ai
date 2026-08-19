import { NextResponse } from 'next/server';
import { handleLearningPath } from '../../../../src/server/apiHandlers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleLearningPath(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Learning path failed' }, { status: 500 });
  }
}
