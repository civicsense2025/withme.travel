/**
 * Tasks API Route
 *
 * Handle requests for task operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { listTasks, createTask, listAssignedTasks } from '@/lib/api/tasks';
import { getUserFromSession } from '@/lib/auth/session';

/**
 * GET handler for listing tasks
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assignedOnly = searchParams.get('assignedOnly') === 'true';

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const user = await getUserFromSession(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get tasks based on parameters
    let result;

    if (assignedOnly) {
      // Get tasks assigned to the user
      result = await listAssignedTasks(userId || user.id);
    } else if (userId) {
      // Get tasks for a specific user
      result = await listTasks(userId);
    } else {
      // Get all tasks for the current user
      result = await listTasks(user.id);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in tasks GET handler:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

/**
 * POST handler for creating a task
 */
export async function POST(request: NextRequest) {
  try {
    // Get the task data from the request body
    const body = await request.json();

    // Get the current user
    const supabase = await createRouteHandlerClient();
    const user = await getUserFromSession(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Make sure the creator ID is set
    const taskData = {
      ...body,
      owner_id: body.owner_id || user.id,
    };

    // Create the task
    const result = await createTask(taskData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error in tasks POST handler:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
