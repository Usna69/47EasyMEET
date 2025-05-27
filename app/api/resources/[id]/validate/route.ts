import { NextRequest, NextResponse } from 'next/server';

// Route is no longer in use - feature has been removed
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  return NextResponse.json({ error: 'This API endpoint has been deprecated' }, { status: 410 });
}
