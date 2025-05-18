/**
 * Task Assignment API Route
 * 
 * Handle requests for assigning tasks to users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getTask, updateTask } from '@/lib/api/tasks';
import { getUserFromSession } from '@/lib/auth/session';

/**
 * POST handler for assigning a task to a user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // Get the assignment data from the request body
    const body = await request.json();
    const { assigneeId } = body;
    
    if (!assigneeId) {
      return NextResponse.json(
        { error: 'Assignee ID is required' },
        { status: 400 }
      );
    }
    
    // Get the current user
    const supabase = await createRouteHandlerClient();
    const user = await getUserFromSession(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the task to check permissions
    const existingTask = await getTask(taskId);
    
    if (!existingTask.success) {
      return NextResponse.json(
        { error: existingTask.error },
        { status: 404 }
      );
    }
    
    // Verify that the user has permission to assign the task
    const task = existingTask.data;
    const isOwner = task.owner_id === user.id;
    const isTripTask = Boolean(task.trip_id);
    
    // For trip tasks, only the owner can assign
    // For personal tasks, you can only assign your own tasks
    if (!isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to assign this task' },
        { status: 403 }
      );
    }

    // Update the task with the new assignee
    const result = await updateTask(taskId, { assignee_id: assigneeId });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in task assignment handler:', error);
    return NextResponse.json(
      { error: 'Failed to assign task' },
      { status: 500 }
    );
  }
} 