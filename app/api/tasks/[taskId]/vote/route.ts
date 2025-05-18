/**
 * Task Voting API Route
 *
 * Handle requests for voting on tasks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getTask, voteTask } from '@/lib/api/tasks';
import { getUserFromSession } from '@/utils/auth';

/**
 * POST handler for voting on a task
 */
export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params;

    // Get the vote data from the request body
    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Valid vote type (up/down) is required' }, { status: 400 });
    }

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const user = await getUserFromSession(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the task to check if it exists
    const existingTask = await getTask(taskId);

    if (!existingTask.success) {
      return NextResponse.json({ error: existingTask.error }, { status: 404 });
    }

    // Vote on the task
    const result = await voteTask(taskId, user.id, voteType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in task voting handler:', error);
    return NextResponse.json({ error: 'Failed to vote on task' }, { status: 500 });
  }
}
