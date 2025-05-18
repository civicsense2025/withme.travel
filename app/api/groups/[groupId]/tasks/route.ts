import { NextRequest, NextResponse } from 'next/server';
import { listGroupTasks, createTask } from '@/lib/api/tasks';

export async function GET(_req: NextRequest, { params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const result = await listGroupTasks(groupId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const body = await req.json();
  // Attach trip_id/groupId
  const result = await createTask({ ...body, trip_id: groupId });
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}
