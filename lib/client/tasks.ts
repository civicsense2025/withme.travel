/**
 * Tasks API Client Wrapper
 *
 * Provides client-side access to the tasks API with proper typing and error handling.
 * Follows the standard Result pattern and interacts with backend endpoints.
 *
 * @module lib/client/tasks
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Task data structure
 */
export interface Task {
  /** Task ID */
  id: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Due date (ISO string) */
  dueDate?: string;
  /** Whether the task is completed */
  isCompleted?: boolean;
  /** Task priority (1-5, 5 being highest) */
  priority?: number;
  /** Task status */
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  /** Task position for ordering */
  position?: number;
  /** Task owner ID */
  ownerId: string;
  /** Task assignee ID */
  assigneeId?: string;
  /** Trip/Group ID if it's a group task */
  tripId?: string;
  /** Task owner information */
  owner?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** Assignee information */
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** Task tags */
  tags?: Array<{ id: string; name: string }>;
  /** Task vote counts */
  votes?: {
    upCount: number;
    downCount: number;
    userVote?: 'up' | 'down';
  };
  /** Created at timestamp */
  createdAt: string;
  /** Updated at timestamp */
  updatedAt: string;
}

/**
 * Task creation parameters
 */
export interface CreateTaskParams {
  /** Task title */
  title: string;
  /** Optional task description */
  description?: string;
  /** ISO date string for the due date */
  dueDate?: string;
  /** Task priority (1-5, 5 being highest) */
  priority?: number;
  /** Task status */
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  /** Task position for ordering */
  position?: number;
  /** Trip/Group ID if it's a group task */
  tripId?: string;
  /** Assignee ID */
  assigneeId?: string;
  /** Optional tags to add to the task */
  tags?: string[];
}

/**
 * Task update parameters
 */
export interface UpdateTaskParams {
  /** Task title */
  title?: string;
  /** Task description */
  description?: string;
  /** ISO date string for the due date */
  dueDate?: string;
  /** Whether the task is completed */
  isCompleted?: boolean;
  /** Task priority (1-5, 5 being highest) */
  priority?: number;
  /** Task status */
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  /** Task position for ordering */
  position?: number;
  /** Assignee ID */
  assigneeId?: string;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List all personal tasks for a user
 */
export async function listTasks(userId?: string, assignedOnly = false): Promise<Result<Task[]>> {
  const searchParams = new URLSearchParams();
  if (userId) searchParams.append('userId', userId);
  if (assignedOnly) searchParams.append('assignedOnly', 'true');

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  return tryCatch(
    fetch(`${API_ROUTES.TASKS.LIST}${queryString}`, {
      method: 'GET',
      next: { revalidate: 0 },
    }).then((response) => handleApiResponse<Task[]>(response))
  );
}

/**
 * List all group tasks for a trip/group
 */
export async function listGroupTasks(tripId: string): Promise<Result<Task[]>> {
  return tryCatch(
    fetch(API_ROUTES.GROUPS.TASKS.LIST(tripId), {
      method: 'GET',
      next: { revalidate: 0 },
    }).then((response) => handleApiResponse<Task[]>(response))
  );
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Result<Task>> {
  return tryCatch(
    fetch(API_ROUTES.TASKS.DETAIL(taskId), {
      method: 'GET',
      next: { revalidate: 0 },
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskParams): Promise<Result<Task>> {
  // Format data to match API expectations
  const apiData = {
    title: data.title,
    description: data.description,
    due_date: data.dueDate,
    priority: data.priority,
    status: data.status || 'pending',
    position: data.position,
    trip_id: data.tripId,
    assignee_id: data.assigneeId,
    tags: data.tags,
  };

  return tryCatch(
    fetch(API_ROUTES.TASKS.LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, data: UpdateTaskParams): Promise<Result<Task>> {
  // Format data to match API expectations
  const apiData = {
    title: data.title,
    description: data.description,
    due_date: data.dueDate,
    status: data.isCompleted ? 'completed' : data.status,
    priority: data.priority,
    position: data.position,
    assignee_id: data.assigneeId,
  };

  return tryCatch(
    fetch(API_ROUTES.TASKS.DETAIL(taskId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<Result<null>> {
  return tryCatch(
    fetch(API_ROUTES.TASKS.DETAIL(taskId), {
      method: 'DELETE',
    }).then((response) => handleApiResponse<null>(response))
  );
}

/**
 * Assign a task to a user
 */
export async function assignTask(taskId: string, assigneeId: string): Promise<Result<Task>> {
  return tryCatch(
    fetch(API_ROUTES.TASKS.ASSIGN(taskId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assigneeId }),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Toggle task completion status
 */
export async function toggleTaskComplete(
  taskId: string,
  isCompleted: boolean
): Promise<Result<Task>> {
  const status = isCompleted ? 'completed' : 'pending';

  return tryCatch(
    fetch(API_ROUTES.TASKS.DETAIL(taskId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Vote on a task (up/down)
 */
export async function voteTask(taskId: string, voteType: 'up' | 'down'): Promise<Result<Task>> {
  return tryCatch(
    fetch(API_ROUTES.TASKS.VOTE(taskId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Add a tag to a task
 */
export async function addTagToTask(taskId: string, tagName: string): Promise<Result<Task>> {
  return tryCatch(
    fetch(API_ROUTES.TASKS.TAGS(taskId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagName }),
    }).then((response) => handleApiResponse<Task>(response))
  );
}

/**
 * Remove a tag from a task
 */
export async function removeTagFromTask(taskId: string, tagName: string): Promise<Result<Task>> {
  const searchParams = new URLSearchParams();
  searchParams.append('tagName', tagName);

  return tryCatch(
    fetch(`${API_ROUTES.TASKS.TAGS(taskId)}?${searchParams.toString()}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<Task>(response))
  );
}
