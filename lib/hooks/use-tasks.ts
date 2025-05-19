/**
 * useTasks Hook
 *
 * Manages tasks state, CRUD operations, and task-related functionality.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  listTasks,
  listGroupTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  voteTask,
  addTagToTask,
  removeTagFromTask,
  toggleTaskComplete,
  type Task,
  type CreateTaskParams,
  type UpdateTaskParams,
} from '@/lib/client/tasks';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useTasks
 */
export interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTask: (data: CreateTaskParams) => Promise<Result<Task>>;
  updateTaskDetails: (taskId: string, data: UpdateTaskParams) => Promise<Result<Task>>;
  removeTask: (taskId: string) => Promise<Result<null>>;
  assignTaskTo: (taskId: string, assigneeId: string) => Promise<Result<Task>>;
  toggleComplete: (taskId: string, isCompleted: boolean) => Promise<Result<Task>>;
  vote: (taskId: string, voteType: 'up' | 'down') => Promise<Result<Task>>;
  addTag: (taskId: string, tagName: string) => Promise<Result<Task>>;
  removeTag: (taskId: string, tagName: string) => Promise<Result<Task>>;
  getTaskById: (taskId: string) => Promise<Result<Task>>;
}

type UseTasksParams = {
  /** Group/trip ID if filtering by a specific group */
  groupId?: string;
  /** Whether to fetch only assigned tasks */
  assignedOnly?: boolean;
  /** Whether to fetch tasks on mount */
  fetchOnMount?: boolean;
};

/**
 * useTasks - React hook for managing tasks
 */
export function useTasks({
  groupId,
  assignedOnly = false,
  fetchOnMount = true,
}: UseTasksParams = {}): UseTasksResult {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const refresh = useCallback(async () => {
    if (!groupId && !assignedOnly) {
      // No need to fetch if there's no context
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let result: Result<Task[]>;
      
      if (groupId) {
        result = await listGroupTasks(groupId);
      } else {
        result = await listTasks(undefined, assignedOnly);
      }
      
      if (result.success) {
        setTasks(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Failed to load tasks',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading tasks';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, assignedOnly, toast]);

  // Add a new task
  const addTask = useCallback(async (data: CreateTaskParams): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await createTask(data);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => [result.data, ...prev]);
      toast({ title: 'Task added successfully' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to add task',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Update a task
  const updateTaskDetails = useCallback(
    async (taskId: string, data: UpdateTaskParams): Promise<Result<Task>> => {
      setIsLoading(true);
      const result = await updateTask(taskId, data);
      setIsLoading(false);
      
      if (result.success) {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
        toast({ title: 'Task updated successfully' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to update task',
          description: result.error,
          variant: 'destructive',
        });
      }
      
      return result;
    },
    [toast]
  );

  // Delete a task
  const removeTask = useCallback(async (taskId: string): Promise<Result<null>> => {
    setIsLoading(true);
    const result = await deleteTask(taskId);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({ title: 'Task deleted successfully' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to delete task',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Assign task to user
  const assignTaskTo = useCallback(async (taskId: string, assigneeId: string): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await assignTask(taskId, assigneeId);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
      toast({ title: 'Task assigned successfully' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to assign task',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Toggle task completion status
  const toggleComplete = useCallback(async (taskId: string, isCompleted: boolean): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await toggleTaskComplete(taskId, isCompleted);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
      toast({ 
        title: isCompleted ? 'Task marked as complete' : 'Task marked as incomplete' 
      });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to update task status',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Vote on a task
  const vote = useCallback(async (taskId: string, voteType: 'up' | 'down'): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await voteTask(taskId, voteType);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
      toast({ title: 'Vote recorded' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to vote on task',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Add a tag to a task
  const addTag = useCallback(async (taskId: string, tagName: string): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await addTagToTask(taskId, tagName);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
      toast({ title: 'Tag added to task' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to add tag',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Remove a tag from a task
  const removeTag = useCallback(async (taskId: string, tagName: string): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await removeTagFromTask(taskId, tagName);
    setIsLoading(false);
    
    if (result.success) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? result.data : task)));
      toast({ title: 'Tag removed from task' });
    } else {
      setError(result.error);
      toast({
        title: 'Failed to remove tag',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Get a single task by ID
  const getTaskById = useCallback(async (taskId: string): Promise<Result<Task>> => {
    setIsLoading(true);
    const result = await getTask(taskId);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error);
      toast({
        title: 'Failed to get task',
        description: result.error,
        variant: 'destructive',
      });
    }
    
    return result;
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (fetchOnMount) {
      refresh();
    }
  }, [fetchOnMount, refresh]);

  return {
    tasks,
    isLoading,
    error,
    refresh,
    addTask,
    updateTaskDetails,
    removeTask,
    assignTaskTo,
    toggleComplete,
    vote,
    addTag,
    removeTag,
    getTaskById,
  };
} 