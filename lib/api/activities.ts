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
import { Result, handleError } from '@/lib/api/_shared';
import { TABLES } from '@/utils/constants/database';
import { extractKeywords, generateActivityIdeas } from '@/utils/activity-generator';

// Helper to get server supabase client
const getSupabaseClient = async () => {
  return createRouteHandlerClient();
};

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List activities with optional filtering parameters.
 *
 * @param params - Optional filtering parameters
 * @returns Promise with Result containing Activity[] or error
 */
export async function listActivities(params: any): Promise<Result<Activity[]>> {
  try {
    const supabase = await getSupabaseClient();
    const { data: dbActivities, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .select('*')
      .match(params || {});

    if (error) {
      throw error;
    }

    // Transform database records to Activity interface
    const activities: Activity[] = dbActivities.map((item: any) => ({
      id: item.id,
      entity_id: item.trip_id || item.group_id || '', 
      entity_type: item.trip_id ? 'trip' : 'group',
      action_type: item.activity_type,
      user_id: item.user_id || '',
      name: (item.details && typeof item.details === 'object' && 'name' in item.details)
        ? (item.details as any).name
        : 'Unnamed Activity',
      description: item.details && typeof item.details === 'object' && 'description' in item.details
        ? (item.details as any).description
        : undefined,
      location: item.details && typeof item.details === 'object' && 'location' in item.details
        ? (item.details as any).location
        : undefined,
      duration: item.details && typeof item.details === 'object' && 'duration' in item.details
        ? (item.details as any).duration
        : undefined,
      category: item.details && typeof item.details === 'object' && 'category' in item.details
        ? (item.details as any).category
        : undefined,
      image_url: item.details && typeof item.details === 'object' && 'image_url' in item.details
        ? (item.details as any).image_url
        : undefined,
      created_at: item.created_at || new Date().toISOString(),
      metadata: item.details || {}
    }));

    return { success: true, data: activities };
  } catch (error) {
    return handleError(error, 'Failed to list activities');
  }
}

/**
 * Get a single activity by ID.
 *
 * @param activityId - The ID of the activity to retrieve
 * @returns Promise with Result containing Activity or error
 */
export async function getActivity(activityId: string): Promise<Result<Activity>> {
  try {
    const supabase = await getSupabaseClient();
    const { data: dbActivity, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) {
      throw error;
    }

    // Transform database record to Activity interface
    const activity: Activity = {
      id: dbActivity.id,
      entity_id: dbActivity.trip_id || dbActivity.group_id || '',
      entity_type: dbActivity.trip_id ? 'trip' : 'group',
      action_type: dbActivity.activity_type,
      user_id: dbActivity.user_id || '',
      name: (dbActivity.details && typeof dbActivity.details === 'object' && 'name' in dbActivity.details)
        ? (dbActivity.details as any).name
        : 'Unnamed Activity',
      description: dbActivity.details && typeof dbActivity.details === 'object' && 'description' in dbActivity.details
        ? (dbActivity.details as any).description
        : undefined,
      location: dbActivity.details && typeof dbActivity.details === 'object' && 'location' in dbActivity.details
        ? (dbActivity.details as any).location
        : undefined,
      duration: dbActivity.details && typeof dbActivity.details === 'object' && 'duration' in dbActivity.details
        ? (dbActivity.details as any).duration
        : undefined,
      category: dbActivity.details && typeof dbActivity.details === 'object' && 'category' in dbActivity.details
        ? (dbActivity.details as any).category
        : undefined,
      image_url: dbActivity.details && typeof dbActivity.details === 'object' && 'image_url' in dbActivity.details
        ? (dbActivity.details as any).image_url
        : undefined,
      created_at: dbActivity.created_at || new Date().toISOString(),
      metadata: dbActivity.details || {}
    };

    return { success: true, data: activity };
  } catch (error) {
    return handleError(error, `Failed to get activity ${activityId}`);
  }
}

/**
 * Create a new activity.
 *
 * @param data - The activity data to create
 * @returns Promise with Result containing the created Activity or error
 */
export async function createActivity(data: any): Promise<Result<Activity>> {
  try {
    const supabase = await getSupabaseClient();
    // Transform Activity interface to database record format
    const dbActivityData = {
      activity_type: data.action_type || 'custom',
      trip_id: data.entity_type === 'trip' ? data.entity_id : null,
      group_id: data.entity_type === 'group' ? data.entity_id : null,
      user_id: data.user_id || null,
      details: {
        name: data.name,
        description: data.description,
        location: data.location,
        duration: data.duration,
        category: data.category,
        image_url: data.image_url,
        ...data.metadata
      }
    };

    const { data: dbActivity, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .insert(dbActivityData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Transform database record to Activity interface
    const activity: Activity = {
      id: dbActivity.id,
      entity_id: dbActivity.trip_id || dbActivity.group_id || '',
      entity_type: dbActivity.trip_id ? 'trip' : 'group',
      action_type: dbActivity.activity_type,
      user_id: dbActivity.user_id || '',
      name: (dbActivity.details && typeof dbActivity.details === 'object' && 'name' in dbActivity.details)
        ? (dbActivity.details as any).name
        : 'Unnamed Activity',
      description: dbActivity.details && typeof dbActivity.details === 'object' && 'description' in dbActivity.details
        ? (dbActivity.details as any).description
        : undefined,
      location: dbActivity.details && typeof dbActivity.details === 'object' && 'location' in dbActivity.details
        ? (dbActivity.details as any).location
        : undefined,
      duration: dbActivity.details && typeof dbActivity.details === 'object' && 'duration' in dbActivity.details
        ? (dbActivity.details as any).duration
        : undefined,
      category: dbActivity.details && typeof dbActivity.details === 'object' && 'category' in dbActivity.details
        ? (dbActivity.details as any).category
        : undefined,
      image_url: dbActivity.details && typeof dbActivity.details === 'object' && 'image_url' in dbActivity.details
        ? (dbActivity.details as any).image_url
        : undefined,
      created_at: dbActivity.created_at || new Date().toISOString(),
      metadata: dbActivity.details || {}
    };

    return { success: true, data: activity };
  } catch (error) {
    return handleError(error, 'Failed to create activity');
  }
}

/**
 * Update an existing activity.
 *
 * @param activityId - The ID of the activity to update
 * @param data - The updated activity data
 * @returns Promise with Result containing the updated Activity or error
 */
export async function updateActivity(activityId: string, data: any): Promise<Result<Activity>> {
  try {
    const supabase = await getSupabaseClient();
    // Transform Activity interface to database record format for update
    const dbActivityData = {
      details: {
        name: data.name,
        description: data.description,
        location: data.location,
        duration: data.duration,
        category: data.category,
        image_url: data.image_url,
        ...data.metadata
      }
    };

    const { data: dbActivity, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .update(dbActivityData)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Transform database record to Activity interface
    const activity: Activity = {
      id: dbActivity.id,
      entity_id: dbActivity.trip_id || dbActivity.group_id || '',
      entity_type: dbActivity.trip_id ? 'trip' : 'group',
      action_type: dbActivity.activity_type,
      user_id: dbActivity.user_id || '',
      name: (dbActivity.details && typeof dbActivity.details === 'object' && 'name' in dbActivity.details)
        ? (dbActivity.details as any).name
        : 'Unnamed Activity',
      description: dbActivity.details && typeof dbActivity.details === 'object' && 'description' in dbActivity.details
        ? (dbActivity.details as any).description
        : undefined,
      location: dbActivity.details && typeof dbActivity.details === 'object' && 'location' in dbActivity.details
        ? (dbActivity.details as any).location
        : undefined,
      duration: dbActivity.details && typeof dbActivity.details === 'object' && 'duration' in dbActivity.details
        ? (dbActivity.details as any).duration
        : undefined,
      category: dbActivity.details && typeof dbActivity.details === 'object' && 'category' in dbActivity.details
        ? (dbActivity.details as any).category
        : undefined,
      image_url: dbActivity.details && typeof dbActivity.details === 'object' && 'image_url' in dbActivity.details
        ? (dbActivity.details as any).image_url
        : undefined,
      created_at: dbActivity.created_at || new Date().toISOString(),
      metadata: dbActivity.details || {}
    };

    return { success: true, data: activity };
  } catch (error) {
    return handleError(error, `Failed to update activity ${activityId}`);
  }
}

/**
 * Delete an activity.
 * @param activityId - The activity's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteActivity(activityId: string): Promise<Result<null>> {
  // TODO: Implement delete activity logic
  try {
    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
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
    // Map each item to Activity type, providing defaults for missing fields
    const activities = (data ?? [])
      .filter(item => typeof item === 'object' && item !== null)
      .map((item: any) => {
        const details = (typeof item.details === 'object' && item.details !== null && !Array.isArray(item.details)) ? item.details : {};
        return {
          id: item.id ?? '',
          entity_id: typeof item.trip_id === 'string' ? item.trip_id : (typeof item.group_id === 'string' ? item.group_id : ''),
          entity_type: typeof item.trip_id === 'string' ? 'trip' : (typeof item.group_id === 'string' ? 'group' : ''),
          action_type: typeof item.activity_type === 'string' ? item.activity_type : '',
          user_id: typeof item.user_id === 'string' ? item.user_id : '',
          name: typeof item.name === 'string' ? item.name : '',
          description: typeof item.description === 'string' ? item.description : '',
          location: typeof item.location === 'string' ? item.location : '',
          duration: typeof item.duration === 'number' ? item.duration : null,
          category: typeof item.category === 'string' ? item.category : '',
          image_url: typeof item.image_url === 'string' ? item.image_url : '',
          created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
          metadata: typeof item.metadata === 'object' && item.metadata !== null ? item.metadata : {},
        };
      });
    return { success: true, data: activities };
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
    const supabase = await getSupabaseClient();

    // Add suggestion metadata
    const activityData = {
      ...suggestion,
      [`${parentType}_id`]: parentId,
      is_suggestion: true,
      status: 'suggested',
      activity_type: suggestion.category || 'other', // Ensure required field
    };

    const { data: newSuggestion, error } = await supabase
      .from(TABLES.GROUP_ACTIVITIES)
      .insert(activityData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    // Map newSuggestion to Activity type, providing defaults for missing fields
    const detailsObj = (typeof newSuggestion.details === 'object' && newSuggestion.details !== null && !Array.isArray(newSuggestion.details)) ? newSuggestion.details : {};
    const activity = {
      id: newSuggestion.id ?? '',
      entity_id: typeof newSuggestion.trip_id === 'string' ? newSuggestion.trip_id : (typeof newSuggestion.group_id === 'string' ? newSuggestion.group_id : ''),
      entity_type: typeof newSuggestion.trip_id === 'string' ? 'trip' : (typeof newSuggestion.group_id === 'string' ? 'group' : ''),
      action_type: typeof newSuggestion.activity_type === 'string' ? newSuggestion.activity_type : '',
      user_id: typeof newSuggestion.user_id === 'string' ? newSuggestion.user_id : '',
      name: typeof detailsObj.name === 'string' ? detailsObj.name : '',
      description: Object.prototype.hasOwnProperty.call(detailsObj, 'description') && typeof detailsObj.description === 'string' ? detailsObj.description : '',
      location: Object.prototype.hasOwnProperty.call(detailsObj, 'location') && typeof detailsObj.location === 'string' ? detailsObj.location : '',
      duration: Object.prototype.hasOwnProperty.call(detailsObj, 'duration') && typeof detailsObj.duration === 'number' ? detailsObj.duration : 0,
      category: Object.prototype.hasOwnProperty.call(detailsObj, 'category') && typeof detailsObj.category === 'string' ? detailsObj.category : '',
      image_url: Object.prototype.hasOwnProperty.call(detailsObj, 'image_url') && typeof detailsObj.image_url === 'string' ? detailsObj.image_url : '',
      created_at: typeof newSuggestion.created_at === 'string' ? newSuggestion.created_at : '',
      metadata: detailsObj,
    };
    return { success: true, data: activity };
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

/**
 * Generate activity ideas for a destination (centralized business logic).
 * @param destinationId - The destination's unique identifier
 * @param tripId - (Optional) The trip's unique identifier
 * @param count - Number of activity ideas to generate (default: 10)
 * @returns Result containing generated activity ideas and context
 */
export async function generateActivityIdeasForDestination(
  destinationId: string,
  tripId?: string,
  count: number = 10
): Promise<Result<{
  activities: any[];
  destination: { id: string; name: string };
  keywords: string[];
  count: number;
}>> {
  try {
    if (!destinationId) {
      return { success: false, error: 'Destination ID is required' };
    }
    const supabase = await getSupabaseClient();
    // Fetch destination
    const { data: destination, error: destinationError } = await supabase
      .from('destinations')
      .select('name, description')
      .eq('id', destinationId)
      .single();
    if (destinationError || !destination) {
      return { success: false, error: 'Destination not found' };
    }
    // Fetch template items (if available)
    const { data: tripTemplate, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('items')
      .eq('destination_id', destinationId)
      .single();
    // Extract keywords
    const keywords = extractKeywords(destination.description || '');
    // Safely access template items
    let templateItems: any[] = [];
    if (tripTemplate && !templateError && 'items' in tripTemplate) {
      templateItems = (tripTemplate.items as any[]) || [];
    }
    // Generate activity ideas
    const activities = generateActivityIdeas(
      destination.name ?? '',
      keywords,
      templateItems,
      count
    );
    return { success: true, data: {
      activities,
      destination: { id: destinationId, name: destination.name ?? '' },
      keywords,
      count: activities.length,
    }};
  } catch (error) {
    return handleError(error, 'Failed to generate activities');
  }
}

/**
 * Type guard to check if an object is an Activity
 */
export function isActivity(obj: any): obj is Activity {
  return obj && typeof obj.id === 'string' && typeof obj.entity_id === 'string';
}

// Add index signature for extensibility
export interface Activity {
  id: string;
  entity_id: string;
  entity_type: string;
  action_type: string;
  user_id: string;
  name: string;
  description?: string;
  location?: string;
  duration?: number;
  category?: string;
  image_url?: string;
  created_at: string;
  metadata?: any;
  [key: string]: any;
}
