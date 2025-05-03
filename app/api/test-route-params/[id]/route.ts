import { NextResponse } from 'next/server';

// Test route to verify route parameter handling
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  return NextResponse.json({
    id: id,
    message: 'Route parameter working correctly',
    timestamp: new Date().toISOString(),
  });
}
