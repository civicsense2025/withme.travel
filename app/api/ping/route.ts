import { NextResponse } from 'next/server';

/**
 * Simple API endpoint for checking network connectivity
 * Used by the NetworkContext for connection status detection
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

/**
 * Support HEAD requests for lightweight connectivity checks
 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
