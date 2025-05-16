/**
 * Tasks feature type definitions
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Item status types using database enums
 */
export type ItemStatus = 'suggested' | 'confirmed' | 'rejected';

/**
 * Extended status type that includes UI-specific statuses
 */
export type ExtendedItemStatus = ItemStatus | 'active' | 'cancelled';

/**
 * Priority levels for task items
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * Basic profile information
 */
export interface ProfileBasic {
  /** Unique identifier */
  id: string;
  /** User's display name */
  name: string | null;
  /** URL to user's avatar image */
  avatar_url: string | null;
  /** User's username */
  username: string | null;
}

/**
 * Structure for task voting information
 */
export interface TaskVotes {
  /** Number of upvotes */
  up: number;
  /** Number of downvotes */
  down: number;
  /** Users who upvoted */
  upVoters: ProfileBasic[];
  /** Users who downvoted */
  downVoters: ProfileBasic[];
  /** Current user's vote (if any) */
  userVote: 'up' | 'down' | null;
}

/**
 * Represents a single task item
 */
export interface TaskItem {
  /** Unique identifier */
  id: string;
  /** Task title */
  title: string;
  /** Optional detailed description */
  description?: string;
  /** Current status */
  status: ExtendedItemStatus;
  /** Optional due date */
  dueDate?: string | null;
  /** Optional priority level */
  priority?: TaskPriority | null;
  /** Voting information */
  votes: TaskVotes;
  /** User assigned to the task (if any) */
  assignee?: ProfileBasic | null;
  /** Optional categorization tags */
  tags?: string[];
} 