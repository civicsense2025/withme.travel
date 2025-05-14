// import { Tables } from '@/utils/constants/database'; // Not used in this file
import type { Database } from '@/utils/constants/database';
import type { Tables } from './database.types';
type Profile = Tables<'profiles'>;

/**
 * Content type that can be commented on
 */
export type CommentableContentType =
  | Database['public']['Enums']['content_type']
  | 'group_idea'
  | 'image'
  | 'note';

/**
 * Base comment interface
 */
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null; // For nested comments/replies
  is_edited: boolean;
  is_deleted: boolean;
  reactions_count: number;
  replies_count: number;

  // Polymorphic references
  content_type: CommentableContentType;
  content_id: string; // The ID of the content being commented on

  // Optional fields for special features
  attachment_url?: string | null;
  attachment_type?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Comment with user profile information
 */
export interface CommentWithUser extends Comment {
  user: Pick<Profile, 'id' | 'name' | 'avatar_url'>;
  reactions?: CommentReactionWithUser[];
}

/**
 * Comment reaction
 */
export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

/**
 * Comment reaction with user profile information
 */
export interface CommentReactionWithUser extends CommentReaction {
  user: Pick<Profile, 'id' | 'name' | 'avatar_url'>;
}

/**
 * Comment create input data
 */
export interface CommentCreateInput {
  content: string;
  content_type: CommentableContentType;
  content_id: string;
  parent_id?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Comment update input data
 */
export interface CommentUpdateInput {
  content?: string;
  is_deleted?: boolean;
  attachment_url?: string | null;
  attachment_type?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Comment reaction input data
 */
export interface CommentReactionInput {
  comment_id: string;
  emoji: string;
}

/**
 * Paginated comments response
 */
export interface PaginatedCommentsResponse {
  comments: CommentWithUser[];
  total: number;
  has_more: boolean;
  next_cursor?: string;
}
