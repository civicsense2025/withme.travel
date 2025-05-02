import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ error: 'This API endpoint is not implemented yet' }, { status: 501 });
}
