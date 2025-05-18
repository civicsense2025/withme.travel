/**
 * Tasks API
 *
 * Provides CRUD operations and assignment for personal and group tasks.
 * All functions use TABLES constants and the Result pattern.
 *
 * @module lib/api/tasks
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import type { Task, TaskVote, Tag, TaskTag } from '@/utils/constants/database.types';
import type { Result } from './_shared';
import { taskSchema, tagSchema, taskVoteSchema, taskTagSchema } from './_shared';
import { handleError } from './_shared';

// ============================================================================
// TASK CRUD & ASSIGNMENT FUNCTIONS
// ============================================================================

/**
 * List all personal tasks for a user
 */
export async function listTasks(userId: string): Promise<Result<Task[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Use the task_details view for rich info
    const { data, error } = await supabase
      .from('task_details')
      .select('*')
      .eq('owner_id', userId)
      .order('due_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, data: [] };
    // Validate each task
    const tasks = data.filter((t: any) => taskSchema.safeParse(t).success);
    return { success: true, data: tasks };
  } catch (error) {
    return handleError(error, 'Failed to list tasks');
  }
}

/**
 * List all group tasks for a trip
 */
export async function listGroupTasks(tripId: string): Promise<Result<Task[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('task_details')
      .select('*')
      .eq('trip_id', tripId)
      .order('due_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, data: [] };
    const tasks = data.filter((t: any) => taskSchema.safeParse(t).success);
    return { success: true, data: tasks };
  } catch (error) {
    return handleError(error, 'Failed to list group tasks');
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Result<Task>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('task_details')
      .select('*')
      .eq('id', taskId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Task not found' };
    const parsed = taskSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Invalid task data' };
    return { success: true, data: parsed.data };
  } catch (error) {
    return handleError(error, 'Failed to get task');
  }
}

/**
 * Create a new task (with optional tags)
 */
export async function createTask(data: Partial<Task> & { tags?: string[] }): Promise<Result<Task>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Use the Postgres function for tags if tags are provided
    if (data.tags && data.tags.length > 0) {
      const { data: result, error } = await supabase.rpc('create_task_with_tags', {
        p_title: data.title,
        p_description: data.description,
        p_status: data.status,
        p_due_date: data.due_date,
        p_priority: data.priority,
        p_owner_id: data.owner_id,
        p_assignee_id: data.assignee_id,
        p_trip_id: data.trip_id,
        p_position: data.position ?? 0,
        p_tags: data.tags,
      });
      if (error) return { success: false, error: error.message };
      // Fetch the created task from the view
      return getTask(result as string);
    } else {
      // Insert directly
      const { data: inserted, error } = await supabase
        .from(TABLES.TASKS)
        .insert({
          title: data.title,
          description: data.description,
          status: data.status,
          due_date: data.due_date,
          priority: data.priority,
          owner_id: data.owner_id,
          assignee_id: data.assignee_id,
          trip_id: data.trip_id,
          position: data.position ?? 0,
        })
        .select('*')
        .single();
      if (error) return { success: false, error: error.message };
      return getTask(inserted.id);
    }
  } catch (error) {
    return handleError(error, 'Failed to create task');
  }
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, data: Partial<Task>): Promise<Result<Task>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.TASKS).update(data).eq('id', taskId);
    if (error) return { success: false, error: error.message };
    return getTask(taskId);
  } catch (error) {
    return handleError(error, 'Failed to update task');
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.TASKS).delete().eq('id', taskId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete task');
  }
}

/**
 * Assign a task to a user
 */
export async function assignTask(taskId: string, assigneeId: string): Promise<Result<Task>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.TASKS)
      .update({ assignee_id: assigneeId })
      .eq('id', taskId);
    if (error) return { success: false, error: error.message };
    return getTask(taskId);
  } catch (error) {
    return handleError(error, 'Failed to assign task');
  }
}

/**
 * List tasks assigned to a user
 */
export async function listAssignedTasks(userId: string): Promise<Result<Task[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('task_details')
      .select('*')
      .eq('assignee_id', userId)
      .order('due_date', { ascending: true });
    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, data: [] };
    const tasks = data.filter((t: any) => taskSchema.safeParse(t).success);
    return { success: true, data: tasks };
  } catch (error) {
    return handleError(error, 'Failed to list assigned tasks');
  }
}

/**
 * Vote on a task (up/down)
 */
export async function voteTask(
  taskId: string,
  userId: string,
  voteType: 'up' | 'down'
): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Upsert vote (user can only vote once per task)
    const { error } = await supabase.from(TABLES.TASK_VOTES).upsert(
      {
        task_id: taskId,
        user_id: userId,
        vote_type: voteType,
      },
      { onConflict: 'task_id,user_id' }
    );
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to vote on task');
  }
}

/**
 * Add a tag to a task
 */
export async function addTagToTask(taskId: string, tagName: string): Promise<Result<Tag>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Insert tag if it doesn't exist
    const { data: tag, error: tagError } = await supabase
      .from(TABLES.TAGS)
      .upsert({ name: tagName }, { onConflict: 'name' })
      .select('*')
      .single();
    if (tagError) return { success: false, error: tagError.message };
    // Link tag to task
    const { error: linkError } = await supabase
      .from(TABLES.TASK_TAGS)
      .upsert({ task_id: taskId, tag_id: tag.id }, { onConflict: 'task_id,tag_id' });
    if (linkError) return { success: false, error: linkError.message };
    return { success: true, data: tag };
  } catch (error) {
    return handleError(error, 'Failed to add tag to task');
  }
}

/**
 * Remove a tag from a task
 */
export async function removeTagFromTask(taskId: string, tagName: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Get tag id
    const { data: tag, error: tagError } = await supabase
      .from(TABLES.TAGS)
      .select('id')
      .eq('name', tagName)
      .single();
    if (tagError) return { success: false, error: tagError.message };
    // Remove link
    const { error: unlinkError } = await supabase
      .from(TABLES.TASK_TAGS)
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tag.id);
    if (unlinkError) return { success: false, error: unlinkError.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to remove tag from task');
  }
}

// (Add more as needed)
