/**
 * Tag Types
 * 
 * Type definitions for the tag feature components
 */

/**
 * Core tag data structure
 */
export interface Tag {
  id: string;
  name: string;
  entity_id?: string;
  entity_type?: string;
  color?: string;
  category?: string;
  emoji?: string;
  description?: string;
  slug?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  use_count?: number;
  is_verified?: boolean;
  up_votes?: number;
  down_votes?: number;
}

/**
 * New tag creation data
 */
export interface TagInput {
  name: string;
  category?: string;
  emoji?: string;
  description?: string;
  color?: string;
}

/**
 * Tag voting direction
 */
export type VoteDirection = 'up' | 'down';

/**
 * Tag category options
 */
export type TagCategory = 'general' | 'activity' | 'amenity' | 'atmosphere' | 'cuisine';

/**
 * Base props for all tag components
 */
export interface TagBaseProps {
  className?: string;
} 