/**
 * Todo feature type definitions
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Priority levels for todo items
 */
export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Categories for todo items
 */
export type TodoCategory = 'personal' | 'work' | 'travel' | 'shopping' | 'other';

/**
 * Represents a single to-do item
 */
export interface TodoItem {
  /** Unique identifier for the item */
  id: string;
  /** The text content of the todo item */
  text: string;
  /** Whether the item has been completed */
  completed: boolean;
  /** Optional priority level */
  priority?: TodoPriority;
  /** Optional due date */
  dueDate?: Date;
  /** Optional category */
  category?: TodoCategory;
} 