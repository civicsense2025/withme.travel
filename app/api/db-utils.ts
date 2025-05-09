// Server-side database functions that use the Supabase server client
// These should only be used in API routes or server components

import type { CommentableContentType } from '@/types/comments';
import { captureException } from '@sentry/nextjs';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import type { ItineraryItemReaction } from '@/types/database.types';
import type { Comment, CommentWithUser, CommentReaction, CommentReactionWithUser, PaginatedCommentsResponse } from '@/types/comments';
import { createNotification } from '@/app/api/notifications/service';

// ----- NOTE ON TYPE HANDLING -----
// This file uses an untyped Supabase client to work around complex TypeScript issues.
// We manually define the interfaces for all returned data and use explicit type
// conversions to ensure type safety within our application code.
// A more type-safe approach will be implemented in the future as the database
// schema and types stabilize.
// ------------------------------------

// Type definitions
interface ItineraryItemWithVotes {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  user_vote?: 'up' | 'down' | null;
  votes?: number;
}

// Type for expense data
interface ExpenseWithUser {
  id: string;
  trip_id: string;
  amount: number;
  category: string;
  description?: string;
  paid_by_user: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for expense by category
interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
}

// Type for trip member with user data
interface TripMemberWithUser {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for trip with member count
interface TripWithMembers {
  id: string;
  created_by: string | null;
  name: string;
  destination_id: string | null;
  destination_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  members: number;
  created_by_user?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for vote response
interface VoteResponse {
  newVoteCount: number;
}

// Type for comment with user data
interface CommentWithUserData extends Comment {
  user_name: string | null;
  user_avatar_url: string | null;
}

// Type for comment reaction with user data
interface CommentReactionWithUserData extends CommentReaction {
  user_name: string | null;
  user_avatar_url: string | null;
}

// Trip-related functions
export async function getTrips(): Promise<TripWithMembers[]> {
  const supabase = await createRouteHandlerClient();

  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_trips_with_member_count');

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return (data || []) as TripWithMembers[];
}

export async function getTripById(id: string): Promise<TripWithMembers | null> {
  const supabase = await createRouteHandlerClient();

  try {
    // Use SQL query to avoid TypeScript issues
    const { data, error } = await supabase.rpc('get_trip_by_id', { trip_id: id });

    if (error) {
      console.error('Error fetching trip:', error);
      return null;
    }

    // Safe type checking for the response data
    if (!data) {
      return null;
    }

    // Check if the result is an array and has elements
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) {
      return null;
    }

    return dataArray[0] as TripWithMembers;
  } catch (e) {
    console.error('Exception fetching trip:', e);
    return null;
  }
}

export async function getTripMembers(tripId: string): Promise<TripMemberWithUser[]> {
  const supabase = await createRouteHandlerClient();

  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_trip_members', { trip_id: tripId });

  if (error) {
    console.error('Error fetching trip members:', error);
    return [];
  }

  return (data || []) as TripMemberWithUser[];
}

// Itinerary item functions
export async function getItineraryItems(
  tripId: string,
  userId?: string
): Promise<ItineraryItemWithVotes[]> {
  const supabase = await createRouteHandlerClient();

  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_itinerary_items_with_votes', {
    trip_id: tripId,
    user_id: userId || null,
  });

  if (error) {
    console.error('Error fetching itinerary items:', error);
    return [];
  }

  return (data || []) as ItineraryItemWithVotes[];
}

/**
 * Get the trip ID for an itinerary item
 */
async function getItemTripId(itemId: string): Promise<string> {
  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase.rpc('get_item_trip_id', { item_id: itemId });

  if (error) {
    console.error('Error getting item trip ID:', error);
    throw new Error('Failed to get item trip ID');
  }

  // Ensure we return a string
  if (typeof data === 'string') {
    return data;
  }

  // If data is an object with a trip_id property, return that
  if (data && typeof data === 'object' && 'trip_id' in data) {
    return String(data.trip_id);
  }

  throw new Error('Failed to get trip ID: unexpected data format');
}

/**
 * Get the vote count for an itinerary item
 */
async function getItemVoteCount(itemId: string): Promise<number> {
  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase.rpc('get_item_vote_count', { item_id: itemId });

  if (error) {
    console.error('Error getting vote count:', error);
    throw new Error('Failed to get vote count');
  }

  // Ensure we return a number
  if (typeof data === 'number') {
    return data;
  }

  // If data is an object with a count property, return that
  if (data && typeof data === 'object' && 'count' in data) {
    return Number(data.count);
  }

  return 0; // Default to 0 if no valid count is found
}

/**
 * Cast a vote on an itinerary item
 * @param itemId - The ID of the itinerary item
 * @param userId - The ID of the user casting the vote
 * @param voteType - The type of vote (up, down, or null to remove the vote)
 * @returns An object containing the new vote count for the item
 */
export async function castVote(
  itemId: string,
  userId: string,
  voteType: 'up' | 'down' | null
): Promise<VoteResponse> {
  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase.rpc('cast_vote', {
    item_id: itemId,
    user_id: userId,
    vote_type: voteType,
  });

  if (error) {
    console.error('Error casting vote:', error);
    throw new Error('Failed to cast vote');
  }

  // Ensure we return a properly formatted response
  const voteCount = typeof data === 'number' ? data : 0;
  return { newVoteCount: voteCount };
}

/**
 * Get expenses for a trip, grouped by category with computed colors
 */
export async function getExpensesByCategory(tripId: string): Promise<ExpenseCategory[]> {
  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase.rpc('get_expenses_by_category', { trip_id: tripId });

  if (error) {
    console.error('Error fetching expenses by category:', error);
    return [];
  }

  return (data || []) as ExpenseCategory[];
}

/**
 * Get votes for a poll
 * @param pollId - The ID of the poll
 * @returns Array of vote objects
 */
export async function getVotesForPoll(pollId: string): Promise<any[]> {
  const supabase = await createRouteHandlerClient();

  try {
    const { data, error } = await supabase.rpc('get_poll_votes', { poll_id: pollId });

    if (error) {
      console.error('Error fetching poll votes:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Exception fetching poll votes:', e);
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  const supabase = await createRouteHandlerClient();

  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Exception fetching user profile:', e);
    return null;
  }
}

/**
 * Fetches all emoji reactions for a set of itinerary item IDs.
 * @param supabase Supabase client
 * @param itemIds Array of itinerary_item_id
 * @returns Map of itinerary_item_id to array of reactions
 */
export async function getItineraryItemReactions(supabase: any, itemIds: string[]): Promise<Record<string, ItineraryItemReaction[]>> {
  if (!itemIds.length) return {};
  const { data, error } = await supabase
    .from('itinerary_item_reactions')
    .select('*')
    .in('ITINERARY_ITEM_ID', itemIds);
  if (error) {
    console.error('Error fetching reactions:', error);
    return {};
  }
  const map: Record<string, ItineraryItemReaction[]> = {};
  for (const reaction of data as ItineraryItemReaction[]) {
    if (!map[reaction.itinerary_item_id]) map[reaction.itinerary_item_id] = [];
    map[reaction.itinerary_item_id].push(reaction);
  }
  return map;
}

/**
 * Get comments for a specific content item
 * @param contentType Type of content being commented on
 * @param contentId ID of the content being commented on
 * @param limit Maximum number of comments to retrieve
 * @param offset Pagination offset
 * @param parentId Optional parent comment ID for retrieving replies
 * @returns Paginated list of comments with user data
 */
export async function getComments(
  contentType: CommentableContentType,
  contentId: string,
  limit: number = 20,
  offset: number = 0,
  parentId: string | null = null
): Promise<PaginatedCommentsResponse> {
  const supabase = await createRouteHandlerClient();

  try {
    // Use the stored procedure we created
    const { data, error } = await supabase.rpc('get_comments_with_user', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_limit: limit,
      p_offset: offset,
      p_parent_id: parentId
    });

    if (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], total: 0, has_more: false };
    }

    // Count total comments for pagination info
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('CONTENT_TYPE', contentType)
      .eq('CONTENT_ID', contentId)
      .is('IS_DELETED', false)
      .eq('PARENT_ID', parentId);

    if (countError) {
      console.error('Error counting comments:', countError);
      return { 
        comments: mapCommentsWithUserData(data || []), 
        total: 0, 
        has_more: false 
      };
    }

    const total = count || 0;
    
    return {
      comments: mapCommentsWithUserData(data || []),
      total,
      has_more: total > offset + limit,
      next_cursor: total > offset + limit ? String(offset + limit) : undefined
    };
  } catch (e) {
    console.error('Exception fetching comments:', e);
    captureException(e);
    return { comments: [], total: 0, has_more: false };
  }
}

/**
 * Create a new comment
 * @param userId ID of the user creating the comment
 * @param contentType Type of content being commented on
 * @param contentId ID of the content being commented on
 * @param content Comment text content
 * @param parentId Optional parent comment ID for replies
 * @param attachmentUrl Optional URL to attached media
 * @param attachmentType Optional type of attached media
 * @param metadata Optional additional metadata
 * @returns The created comment with user data, or null if creation failed
 */
export async function createComment(
  userId: string,
  contentType: CommentableContentType,
  contentId: string,
  content: string,
  parentId: string | null = null,
  attachmentUrl: string | null = null,
  attachmentType: string | null = null,
  metadata: Record<string, any> | null = null
): Promise<CommentWithUser | null> {
  const supabase = await createRouteHandlerClient();

  try {
    // Insert the new comment
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert({
        ['USER_ID']: userId,
        ['CONTENT_TYPE']: contentType,
        ['CONTENT_ID']: contentId,
        ['CONTENT']: content,
        ['PARENT_ID']: parentId,
        ['ATTACHMENT_URL']: attachmentUrl,
        ['ATTACHMENT_TYPE']: attachmentType,
        ['METADATA']: metadata
      })
      .select('*')
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return null;
    }

    // --- Notification trigger for template comments ---
    if (contentType === 'template') {
      // Get the template owner
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('id, user_id, title')
        .eq('id', contentId)
        .single();
      if (!templateError && template && template.user_id && template.user_id !== userId) {
        await createNotification({
          userId: template.user_id,
          notificationType: 'template_commented',
          title: 'New comment on your template',
          content: `Someone commented on your template: ${template.title ?? 'Untitled'}`,
          metadata: { templateId: template.id },
        });
      }
    }
    // --- End notification trigger ---

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // Return comment with user data
    return {
      ...commentData as Comment,
      user: {
        id: userData.id,
        name: userData.name,
        avatar_url: userData.avatar_url
      }
    };
  } catch (e) {
    console.error('Exception creating comment:', e);
    captureException(e);
    return null;
  }
}

/**
 * Update an existing comment
 * @param commentId ID of the comment to update
 * @param userId ID of the user updating the comment
 * @param content New comment text content
 * @param attachmentUrl Optional new URL to attached media
 * @param attachmentType Optional new type of attached media
 * @param metadata Optional new additional metadata
 * @returns The updated comment with user data, or null if update failed
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
  attachmentUrl: string | null = null,
  attachmentType: string | null = null,
  metadata: Record<string, any> | null = null
): Promise<CommentWithUser | null> {
  const supabase = await createRouteHandlerClient();

  try {
    // Update the comment
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .update({
        ['CONTENT']: content,
        ['ATTACHMENT_URL']: attachmentUrl,
        ['ATTACHMENT_TYPE']: attachmentType,
        ['METADATA']: metadata,
        ['IS_EDITED']: true,
        ['UPDATED_AT']: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('USER_ID', userId)
      .select('*')
      .single();

    if (commentError) {
      console.error('Error updating comment:', commentError);
      return null;
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // Return comment with user data
    return {
      ...commentData as Comment,
      user: {
        id: userData.id,
        name: userData.name,
        avatar_url: userData.avatar_url
      }
    };
  } catch (e) {
    console.error('Exception updating comment:', e);
    captureException(e);
    return null;
  }
}

/**
 * Delete a comment (soft delete)
 * @param commentId ID of the comment to delete
 * @param userId ID of the user deleting the comment
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createRouteHandlerClient();

  try {
    // Soft delete the comment
    const { error } = await supabase
      .from('comments')
      .update({
        ['IS_DELETED']: true,
        ['UPDATED_AT']: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('USER_ID', userId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Exception deleting comment:', e);
    captureException(e);
    return false;
  }
}

/**
 * Get reactions for a specific comment
 * @param commentId ID of the comment to get reactions for
 * @returns Array of reactions with user data
 */
export async function getCommentReactions(
  commentId: string
): Promise<CommentReactionWithUser[]> {
  const supabase = await createRouteHandlerClient();

  try {
    // Get reactions with user profile data
    const { data, error } = await supabase
      .from('comment_reactions')
      .select(`
        *,
        ${'profiles'}:${'USER_ID'} (
          id, name, avatar_url
        )
      `)
      .eq('COMMENT_ID', commentId);

    if (error) {
      console.error('Error fetching comment reactions:', error);
      return [];
    }

    // Map the data to include user profiles
    return (data || []) as CommentReactionWithUser[];
  } catch (e) {
    console.error('Exception fetching comment reactions:', e);
    captureException(e);
    return [];
  }
}

/**
 * Add a reaction to a comment
 * @param commentId ID of the comment to react to
 * @param userId ID of the user adding the reaction
 * @param emoji The emoji to use as a reaction
 * @returns The created reaction with user data, or null if creation failed
 */
export async function addCommentReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<CommentReactionWithUser | null> {
  const supabase = await createRouteHandlerClient();

  try {
    // First, check if the user already reacted with this emoji
    const { data: existingReaction, error: checkError } = await supabase
      .from('comment_reactions')
      .select('id')
      .eq('COMMENT_ID', commentId)
      .eq('USER_ID', userId)
      .eq('EMOJI', emoji)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing reaction:', checkError);
      return null;
    }

    // If the reaction already exists, just return it
    if (existingReaction) {
      // Get full user data for the existing reaction
      const { data: reactionWithUser, error: fetchError } = await supabase
        .from('comment_reactions')
        .select(`
          *,
          ${'profiles'}:${'USER_ID'} (
            id, name, avatar_url
          )
        `)
        .eq('id', existingReaction.id)
        .single();

      if (fetchError || !reactionWithUser) {
        console.error('Error fetching existing reaction:', fetchError);
        return null;
      }

      return reactionWithUser as CommentReactionWithUser;
    }

    // If the reaction doesn't exist, create a new one
    const { data: newReaction, error: insertError } = await supabase
      .from('comment_reactions')
      .insert({
        ['COMMENT_ID']: commentId,
        ['USER_ID']: userId,
        ['EMOJI']: emoji
      })
      .select(`
        *,
        ${'profiles'}:${'USER_ID'} (
          id, name, avatar_url
        )
      `)
      .single();

    if (insertError || !newReaction) {
      console.error('Error creating reaction:', insertError);
      return null;
    }

    // Update the comment's reaction count
    await supabase
      .from('comments')
      .update({
        ['REACTIONS_COUNT']: supabase.rpc('increment', { 
          row_id: commentId,
          table_name: 'comments',
          column_name: 'REACTIONS_COUNT', 
          amount: 1 
        })
      })
      .eq('id', commentId);

    return newReaction as CommentReactionWithUser;
  } catch (e) {
    console.error('Exception creating comment reaction:', e);
    captureException(e);
    return null;
  }
}

/**
 * Remove a reaction from a comment
 * @param commentId ID of the comment to remove reaction from
 * @param userId ID of the user removing the reaction
 * @param emoji The emoji reaction to remove
 * @returns Boolean indicating success or failure
 */
export async function removeCommentReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<boolean> {
  const supabase = await createRouteHandlerClient();

  try {
    // Delete the reaction
    const { error: deleteError, count } = await supabase
      .from('comment_reactions')
      .delete({ count: 'exact' })
      .eq('COMMENT_ID', commentId)
      .eq('USER_ID', userId)
      .eq('EMOJI', emoji);

    if (deleteError) {
      console.error('Error deleting reaction:', deleteError);
      return false;
    }

    // Only decrement the count if we actually deleted something
    if (count && count > 0) {
      // Update the comment's reaction count
      await supabase
        .from('comments')
        .update({
          ['REACTIONS_COUNT']: supabase.rpc('decrement', { 
            row_id: commentId,
            table_name: 'comments',
            column_name: 'REACTIONS_COUNT', 
            amount: 1 
          })
        })
        .eq('id', commentId)
        .gt('REACTIONS_COUNT', 0); // Only decrement if greater than 0
    }

    return true;
  } catch (e) {
    console.error('Exception removing comment reaction:', e);
    captureException(e);
    return false;
  }
}

// Helper function to map database results to CommentWithUser objects
function mapCommentsWithUserData(comments: CommentWithUserData[]): CommentWithUser[] {
  return comments.map(comment => ({
    id: comment.id,
    content: comment.content,
    user_id: comment.user_id,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    parent_id: comment.parent_id,
    content_type: comment.content_type,
    content_id: comment.content_id,
    is_edited: comment.is_edited,
    is_deleted: comment.is_deleted,
    reactions_count: comment.reactions_count,
    replies_count: comment.replies_count,
    attachment_url: comment.attachment_url,
    attachment_type: comment.attachment_type,
    metadata: comment.metadata,
    user: {
      id: comment.user_id,
      name: comment.user_name,
      avatar_url: comment.user_avatar_url
    }
  }));
}

// Helper function to map database results to CommentReactionWithUser objects
function mapReactionsWithUserData(reactions: CommentReactionWithUserData[]): CommentReactionWithUser[] {
  return reactions.map(reaction => ({
    id: reaction.id,
    comment_id: reaction.comment_id,
    user_id: reaction.user_id,
    emoji: reaction.emoji,
    created_at: reaction.created_at,
    user: {
      id: reaction.user_id,
      name: reaction.user_name,
      avatar_url: reaction.user_avatar_url
    }
  }));
}
