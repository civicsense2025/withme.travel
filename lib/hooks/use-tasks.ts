'use client';

/**
 * Task Management Hook
 *
 * Custom React hook for managing tasks with loading states and error handling.
 * Provides CRUD operations, assignment, tagging, and voting functionality.
 *
 * @module hooks/use-tasks
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import {
  listTasks,
  listGroupTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  toggleTaskComplete,
  voteTask,
  addTagToTask,
  removeTagFromTask,
  type Task,
  type CreateTaskParams,
  type UpdateTaskParams,
} from '@/lib/client/tasks';
import type { Result } from '@/lib/client/result';
import { isSuccess, createFailure } from '@/lib/client/result';

// ============================================================================
// TYPES
// ============================================================================

export interface UseTasksOptions {
  /** User ID for personal tasks */
  userId?: string;
  /** Group ID for group tasks */
  groupId?: string;
  /** Whether to fetch tasks for assigned user only */
  assignedOnly?: boolean;
  /** Whether to fetch tasks on mount */
  fetchOnMount?: boolean;
}

export interface UseTasksResult {
  /** List of tasks */
  tasks: Task[] | null;
  /** Whether tasks are loading */
  isLoading: boolean;
  /** Error if tasks failed to load */
  error: Error | null;
  /** Refresh tasks */
  refresh: () => Promise<void>;
  /** Create a new task */
  createTask: (data: CreateTaskParams) => Promise<Result<Task>>;
  /** Update an existing task */
  updateTask: (taskId: string, data: UpdateTaskParams) => Promise<Result<Task>>;
  /** Delete a task */
  deleteTask: (taskId: string) => Promise<Result<null>>;
  /** Toggle task completion status */
  toggleTaskComplete: (taskId: string, isCompleted: boolean) => Promise<Result<Task>>;
  /** Assign a task to a user */
  assignTask: (taskId: string, userId?: string) => Promise<Result<Task>>;
  /** Vote on a task */
  voteTask: (taskId: string, voteType: 'up' | 'down') => Promise<Result<Task>>;
  /** Add a tag to a task */
  addTagToTask: (taskId: string, tagName: string) => Promise<Result<Task>>;
  /** Remove a tag from a task */
  removeTagFromTask: (taskId: string, tagName: string) => Promise<Result<Task>>;
  /** Whether tasks are creating */
  isCreating: boolean;
  /** Whether tasks are updating (keyed by task ID) */
  isUpdating: Record<string, boolean>;
  /** Whether tasks are deleting (keyed by task ID) */
  isDeleting: Record<string, boolean>;
  /** Whether tasks are toggling completion status (keyed by task ID) */
  isTogglingComplete: Record<string, boolean>;
  /** Whether tasks are assigning (keyed by task ID) */
  isAssigning: Record<string, boolean>;
  /** Whether tasks are voting (keyed by task ID) */
  isVoting: Record<string, boolean>;
  /** Whether tasks are adding tags (keyed by task ID) */
  isAddingTag: Record<string, boolean>;
  /** Whether tasks are removing tags (keyed by task ID and tag name) */
  isRemovingTag: Record<string, Record<string, boolean>>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing tasks with loading states and error handling
 */
export function useTasks({
  userId,
  groupId,
  assignedOnly = false,
  fetchOnMount = true,
}: UseTasksOptions = {}): UseTasksResult {
  // State management
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Operation loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isTogglingComplete, setIsTogglingComplete] = useState<Record<string, boolean>>({});
  const [isAssigning, setIsAssigning] = useState<Record<string, boolean>>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  const [isAddingTag, setIsAddingTag] = useState<Record<string, boolean>>({});
  const [isRemovingTag, setIsRemovingTag] = useState<Record<string, Record<string, boolean>>>({});

  const { toast } = useToast();

  // Helper to update task in state
  const updateTaskInState = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) => {
      if (!prevTasks) return [updatedTask];
      return prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
    });
  }, []);

  // Helper to remove task from state
  const removeTaskFromState = useCallback((taskId: string) => {
    setTasks((prevTasks) => {
      if (!prevTasks) return [];
      return prevTasks.filter((task) => task.id !== taskId);
    });
  }, []);

  // Fetch tasks based on groupId or userId
  const fetchTasks = useCallback(async () => {
    // Reset error state
    setError(null);
    setIsLoading(true);

    try {
      let result;

      if (groupId) {
        // Fetch group tasks
        result = await listGroupTasks(groupId);
      } else {
        // Fetch personal tasks
        result = await listTasks(userId, assignedOnly);
      }

      if (isSuccess(result)) {
        setTasks(result.data);
      } else {
        // Create an Error object from the error string
        setError(new Error(result.error));
        toast({
          title: 'Failed to load tasks',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      toast({
        title: 'Failed to load tasks',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, userId, assignedOnly, toast]);

  // Create a new task
  const handleCreateTask = useCallback(
    async (data: CreateTaskParams) => {
      setIsCreating(true);

      try {
        const result = await createTask({
          ...data,
          tripId: groupId,
        });

        if (isSuccess(result)) {
          // Add new task to local state
          setTasks((prevTasks) => {
            const newTasks = prevTasks ? [...prevTasks] : [];
            newTasks.push(result.data);
            return newTasks;
          });

          toast({
            title: 'Task created',
            description: 'The task was created successfully.',
          });
        } else {
          toast({
            title: 'Failed to create task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to create task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsCreating(false);
      }
    },
    [groupId, toast]
  );

  // Update an existing task
  const handleUpdateTask = useCallback(
    async (taskId: string, data: UpdateTaskParams) => {
      // Set loading state for this task
      setIsUpdating((prev) => ({ ...prev, [taskId]: true }));

      try {
        const result = await updateTask(taskId, data);

        if (isSuccess(result)) {
          updateTaskInState(result.data);

          toast({
            title: 'Task updated',
            description: 'The task was updated successfully.',
          });
        } else {
          toast({
            title: 'Failed to update task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to update task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsUpdating((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, updateTaskInState]
  );

  // Delete a task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setIsDeleting((prev) => ({ ...prev, [taskId]: true }));

      try {
        const result = await deleteTask(taskId);

        if (isSuccess(result)) {
          removeTaskFromState(taskId);

          toast({
            title: 'Task deleted',
            description: 'The task was deleted successfully.',
          });
        } else {
          toast({
            title: 'Failed to delete task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to delete task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsDeleting((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, removeTaskFromState]
  );

  // Toggle task completion
  const handleToggleComplete = useCallback(
    async (taskId: string, isCompleted: boolean) => {
      setIsTogglingComplete((prev) => ({ ...prev, [taskId]: true }));

      try {
        const result = await toggleTaskComplete(taskId, isCompleted);

        if (isSuccess(result)) {
          updateTaskInState(result.data);
        } else {
          toast({
            title: 'Failed to update task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to update task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsTogglingComplete((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, updateTaskInState]
  );

  // Assign a task
  const handleAssignTask = useCallback(
    async (taskId: string, assigneeId?: string) => {
      setIsAssigning((prev) => ({ ...prev, [taskId]: true }));

      try {
        let result;

        if (assigneeId) {
          result = await assignTask(taskId, assigneeId);
        } else {
          // Update with null assignee to unassign
          result = await updateTask(taskId, { assigneeId: undefined });
        }

        if (isSuccess(result)) {
          updateTaskInState(result.data);

          toast({
            title: assigneeId ? 'Task assigned' : 'Task unassigned',
            description: assigneeId
              ? 'The task was assigned successfully.'
              : 'The task was unassigned successfully.',
          });
        } else {
          toast({
            title: 'Failed to assign task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to assign task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsAssigning((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, updateTaskInState]
  );

  // Vote on a task
  const handleVoteTask = useCallback(
    async (taskId: string, voteType: 'up' | 'down') => {
      setIsVoting((prev) => ({ ...prev, [taskId]: true }));

      try {
        const result = await voteTask(taskId, voteType);

        if (isSuccess(result)) {
          updateTaskInState(result.data);
        } else {
          toast({
            title: 'Failed to vote on task',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to vote on task',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsVoting((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, updateTaskInState]
  );

  // Add a tag to a task
  const handleAddTagToTask = useCallback(
    async (taskId: string, tagName: string) => {
      setIsAddingTag((prev) => ({ ...prev, [taskId]: true }));

      try {
        const result = await addTagToTask(taskId, tagName);

        if (isSuccess(result)) {
          updateTaskInState(result.data);
        } else {
          toast({
            title: 'Failed to add tag',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to add tag',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsAddingTag((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [toast, updateTaskInState]
  );

  // Remove a tag from a task
  const handleRemoveTagFromTask = useCallback(
    async (taskId: string, tagName: string) => {
      // Set loading state for this task and tag
      setIsRemovingTag((prev) => ({
        ...prev,
        [taskId]: {
          ...(prev[taskId] || {}),
          [tagName]: true,
        },
      }));

      try {
        const result = await removeTagFromTask(taskId, tagName);

        if (isSuccess(result)) {
          updateTaskInState(result.data);
        } else {
          toast({
            title: 'Failed to remove tag',
            description: result.error,
            variant: 'destructive',
          });
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({
          title: 'Failed to remove tag',
          description: message,
          variant: 'destructive',
        });

        return createFailure(message);
      } finally {
        setIsRemovingTag((prev) => ({
          ...prev,
          [taskId]: {
            ...(prev[taskId] || {}),
            [tagName]: false,
          },
        }));
      }
    },
    [toast, updateTaskInState]
  );

  // Fetch tasks on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchTasks();
    }
  }, [fetchOnMount, fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refresh: fetchTasks,
    createTask: handleCreateTask as (data: CreateTaskParams) => Promise<Result<Task>>,
    updateTask: handleUpdateTask as (taskId: string, data: UpdateTaskParams) => Promise<Result<Task>>,
    deleteTask: handleDeleteTask as (taskId: string) => Promise<Result<null>>,
    toggleTaskComplete: handleToggleComplete as (taskId: string, isCompleted: boolean) => Promise<Result<Task>>,
    assignTask: handleAssignTask as (taskId: string, assigneeId?: string) => Promise<Result<Task>>,
    voteTask: handleVoteTask as (taskId: string, voteType: 'up' | 'down') => Promise<Result<Task>>,
    addTagToTask: handleAddTagToTask as (taskId: string, tagName: string) => Promise<Result<Task>>,
    removeTagFromTask: handleRemoveTagFromTask as (taskId: string, tagName: string) => Promise<Result<Task>>,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingComplete,
    isAssigning,
    isVoting,
    isAddingTag,
    isRemovingTag,
  };
}
