import { NextRequest, NextResponse } from 'next/server';
import { listTasks, createTask } from '@/lib/api/tasks';

// TODO: Replace with real user session extraction
function getUserId(req: NextRequest): string | null {
  // Placeholder: extract userId from session/cookie/auth
  return req.headers.get('x-user-id') || null;
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  const result = await listTasks(userId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json();
  // Attach userId as owner
  const result = await createTask({ ...body, owner_id: userId });
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
} 