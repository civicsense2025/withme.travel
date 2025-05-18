/**
 * Task Tags API Route
 * 
 * Handle requests for managing tags on tasks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getTask } from '@/lib/api/tasks';
import { addTagToEntity, removeTagFromEntity } from '@/lib/api/tags';
import { getUserFromSession } from '@/utils/auth';

/**
 * POST handler for adding a tag to a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // Get the tag data from the request body
    const body = await request.json();
    const { tagName } = body;
    
    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
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
    
    // Verify that the user has permission (owner or assignee)
    const task = existingTask.data;
    const isOwner = task.owner_id === user.id;
    const isAssignee = task.assignee_id === user.id;
    
    if (!isOwner && !isAssignee) {
      return NextResponse.json(
        { error: 'You do not have permission to tag this task' },
        { status: 403 }
      );
    }

    // Add the tag to the task
    const result = await addTagToEntity('task', taskId, tagName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return the updated task
    const updatedTask = await getTask(taskId);
    
    if (!updatedTask.success) {
      return NextResponse.json(
        { error: 'Tag added but failed to fetch updated task' },
        { status: 207 } // Partial success
      );
    }

    return NextResponse.json(updatedTask.data);
  } catch (error) {
    console.error('Error in task tag POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to task' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a tag from a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { searchParams } = new URL(request.url);
    const tagName = searchParams.get('tagName');
    
    if (!tagName) {
      return NextResponse.json(
        { error: 'Tag name is required' },
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
    
    // Verify that the user has permission (owner or assignee)
    const task = existingTask.data;
    const isOwner = task.owner_id === user.id;
    const isAssignee = task.assignee_id === user.id;
    
    if (!isOwner && !isAssignee) {
      return NextResponse.json(
        { error: 'You do not have permission to remove tags from this task' },
        { status: 403 }
      );
    }

    // Remove the tag from the task
    const result = await removeTagFromEntity('task', taskId, tagName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return the updated task
    const updatedTask = await getTask(taskId);
    
    if (!updatedTask.success) {
      return NextResponse.json(
        { error: 'Tag removed but failed to fetch updated task' },
        { status: 207 } // Partial success
      );
    }

    return NextResponse.json(updatedTask.data);
  } catch (error) {
    console.error('Error in task tag DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from task' },
      { status: 500 }
    );
  }
} 