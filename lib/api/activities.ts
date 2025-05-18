/**
 * Activities API
 *
 * Provides CRUD operations and custom actions for activities (e.g., trip activities, group activities).
 * Used for managing activity suggestions, details, and collaborative planning.
 *
 * @module lib/api/activities
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Activity } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all activities for a trip or group.
 * @param parentId - The parent entity's unique identifier (trip or group)
 * @param parentType - The type of parent entity (e.g., 'trip', 'group')
 * @returns Result containing an array of activities
 */
export async function listActivities(
  parentId: string,
  parentType: string
): Promise<Result<Activity[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .select('*')
      .eq(`${parentType}_id`, parentId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch activities');
  }
}

/**
 * Get a specific activity.
 * @param activityId - The activity's unique identifier
 * @returns Result containing the activity details
 */
export async function getActivity(activityId: string): Promise<Result<Activity>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch activity');
  }
}

/**
 * Create a new activity for a parent entity.
 * @param parentId - The parent entity's unique identifier (trip or group)
 * @param parentType - The type of parent entity (e.g., 'trip', 'group')
 * @param data - The activity data
 * @returns Result containing the created activity
 */
export async function createActivity(
  parentId: string,
  parentType: string,
  data: Partial<Activity>
): Promise<Result<Activity>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure parent ID is set
    const activityData = {
      ...data,
      [`${parentType}_id`]: parentId,
    };

    const { data: newActivity, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .insert(activityData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newActivity };
  } catch (error) {
    return handleError(error, 'Failed to create activity');
  }
}

/**
 * Update an existing activity.
 * @param activityId - The activity's unique identifier
 * @param data - Partial activity data to update
 * @returns Result containing the updated activity
 */
export async function updateActivity(
  activityId: string,
  data: Partial<Activity>
): Promise<Result<Activity>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedActivity, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .update(data)
      .eq('id', activityId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedActivity };
  } catch (error) {
    return handleError(error, 'Failed to update activity');
  }
}

/**
 * Delete an activity.
 * @param activityId - The activity's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteActivity(activityId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.GROUP_ACTIVITIES).delete().eq('id', activityId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete activity');
  }
}

/**
 * Search activities by query parameters.
 * @param query - The search query
 * @param params - Additional filter parameters
 * @returns Result containing matching activities
 */
export async function searchActivities(
  query: string,
  params: { category?: string; location?: string }
): Promise<Result<Activity[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    let request = supabase.from(TABLES.GROUP_ACTIVITIES).select('*').ilike('name', `%${query}%`);

    // Apply additional filters if provided
    if (params.category) {
      request = request.eq('category', params.category);
    }

    if (params.location) {
      request = request.ilike('location', `%${params.location}%`);
    }

    const { data, error } = await request;

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to search activities');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Suggest a new activity for a trip or group.
 * @param parentId - The parent entity's unique identifier
 * @param parentType - The type of parent entity (e.g., 'trip', 'group')
 * @param suggestion - The activity suggestion data
 * @returns Result containing the created suggestion
 */
export async function suggestActivity(
  parentId: string,
  parentType: string,
  suggestion: Partial<Activity>
): Promise<Result<Activity>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Add suggestion metadata
    const activityData = {
      ...suggestion,
      [`${parentType}_id`]: parentId,
      is_suggestion: true,
      status: 'suggested',
    };

    const { data: newSuggestion, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .insert(activityData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newSuggestion };
  } catch (error) {
    return handleError(error, 'Failed to suggest activity');
  }
}

/**
 * Vote on a suggested activity.
 *
 * TODO: Implement voting mechanism for suggested activities
 * - Add user vote tracking in a separate table
 * - Include vote count aggregation
 * - Handle vote updates and removals
 * - Add threshold-based auto-approval functionality
 */
export async function voteOnActivity(
  activityId: string,
  userId: string,
  vote: 'up' | 'down'
): Promise<Result<{ activityId: string; vote: string }>> {
  // TODO: Implement activity voting system
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Get activity recommendations based on trip context.
 *
 * TODO: Implement AI-powered activity recommendations
 * - Analyze trip destination, dates, and user preferences
 * - Integrate with external APIs for real-time availability
 * - Add popularity and rating metrics to recommendations
 * - Implement personalized sorting based on group interests
 */
export async function getRecommendedActivities(
  tripId: string,
  options?: { limit?: number; category?: string }
): Promise<Result<Activity[]>> {
  // TODO: Implement recommendation engine for activities
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Categorize activities using AI.
 *
 * TODO: Implement AI categorization of activities
 * - Analyze activity description and details
 * - Suggest appropriate categories based on content
 * - Add confidence scores to category suggestions
 * - Allow for manual overrides with learning
 */
export async function categorizeActivity(
  activity: Partial<Activity>
): Promise<Result<{ categories: string[]; confidence: number[] }>> {
  // TODO: Implement AI categorization
  return { success: false, error: 'Not implemented yet' };
}
