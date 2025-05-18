/**
 * Tasks feature module
 * 
 * Provides components and utilities for creating and managing tasks
 * Organized using atomic design principles
 */

// Export all atoms
export * from './atoms';

// Export all molecules
export * from './molecules';

// Export the main organisms
export { TaskList } from './TaskList';
export type { TaskListProps, Task } from './TaskList';

export { TaskForm } from './TaskForm';
export type { TaskFormProps, TaskFormValues } from './TaskForm';

// Use TaskItem from the molecules export

// Export data types
export type {
  TaskItem as TaskItemData,
  TaskPriority,
  ItemStatus,
  ExtendedItemStatus,
  ProfileBasic,
  TaskVotes
} from './types';

/**
 * Tasks Components
 * 
 * Export file for task-related components following atomic design
 */

// Molecules
export { TaskItem } from './TaskItem';
export type { TaskItemProps } from './TaskItem';

// Organisms
export { TaskManager } from './TaskManager';
export type { TaskManagerProps } from './TaskManager';

