import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/api/tasks';

export async function GET(_req: NextRequest, { params }: { params: { groupId: string; taskId: string } }) {
  const { taskId } = params;
  const result = await getTask(taskId);
  return NextResponse.json(result, { status: result.success ? 200 : 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { groupId: string; taskId: string } }) {
  const { taskId } = params;
  const body = await req.json();
  const result = await updateTask(taskId, body);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: { groupId: string; taskId: string } }) {
  const { taskId } = params;
  const result = await deleteTask(taskId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
} 