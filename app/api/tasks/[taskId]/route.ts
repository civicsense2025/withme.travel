/**
 * Individual Task API Route
 * 
 * Handle requests for operations on a specific task.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import {
  getTask,
  updateTask,
  deleteTask
} from '@/lib/api/tasks';
import { getUserFromSession } from '@/lib/auth/session';

/**
 * GET handler for retrieving a single task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const user = await getUserFromSession(supabase);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the task
    const result = await getTask(taskId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in task GET handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a task
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // Get the task data from the request body
    const body = await request.json();
    
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
    
    // Verify that the user has permission (owner or assignee)
    const task = existingTask.data;
    const isOwner = task.owner_id === user.id;
    const isAssignee = task.assignee_id === user.id;
    
    if (!isOwner && !isAssignee) {
      return NextResponse.json(
        { error: 'You do not have permission to update this task' },
        { status: 403 }
      );
    }

    // Update the task
    const result = await updateTask(taskId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in task PATCH handler:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
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
    
    // Only task owner can delete
    const task = existingTask.data;
    if (task.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this task' },
        { status: 403 }
      );
    }

    // Delete the task
    const result = await deleteTask(taskId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in task DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 