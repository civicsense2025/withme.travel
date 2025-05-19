/**
 * Tags API
 *
 * Provides CRUD operations and custom actions for trip and note tags.
 * Used for organizing and categorizing trip content and notes.
 *
 * @module lib/api/tags
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Tag } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all tags for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of tags
 */
export async function listTripTags(tripId: string): Promise<Result<Tag[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TAGS)
      .select('*')
      .eq('entity_id', tripId)
      .eq('entity_type', 'trip');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip tags');
  }
}

/**
 * Add a tag to a trip.
 * @param tripId - The trip's unique identifier
 * @param tag - The tag data
 * @returns Result containing the created tag
 */
export async function addTripTag(tripId: string, tag: Partial<Tag>): Promise<Result<Tag>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure tripId and entity_type are set
    const tagData = {
      ...tag,
      entity_id: tripId,
      entity_type: 'trip',
    };

    const { data: newTag, error } = await supabase
      .from(TABLES.TAGS)
      .insert(tagData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newTag };
  } catch (error) {
    return handleError(error, 'Failed to add trip tag');
  }
}

/**
 * Update a trip tag.
 * @param tripId - The trip's unique identifier
 * @param tagId - The tag's unique identifier
 * @param tag - The updated tag data
 * @returns Result containing the updated tag
 */
export async function updateTripTag(
  tripId: string,
  tagId: string,
  tag: Partial<Tag>
): Promise<Result<Tag>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedTag, error } = await supabase
      .from(TABLES.TAGS)
      .update(tag)
      .eq('id', tagId)
      .eq('entity_id', tripId)
      .eq('entity_type', 'trip')
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedTag };
  } catch (error) {
    return handleError(error, 'Failed to update trip tag');
  }
}

/**
 * Delete a trip tag.
 * @param tripId - The trip's unique identifier
 * @param tagId - The tag's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteTripTag(tripId: string, tagId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.TAGS)
      .delete()
      .eq('id', tagId)
      .eq('entity_id', tripId)
      .eq('entity_type', 'trip');

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete trip tag');
  }
}

/**
 * List all entity tags.
 * @param entityId - The entity's unique identifier
 * @param entityType - The type of entity (e.g., 'trip', 'note')
 * @returns Result containing an array of tags
 */
export async function listEntityTags(entityId: string, entityType: string): Promise<Result<Tag[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TAGS)
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch entity tags');
  }
}

/**
 * Add a tag to an entity.
 * @param entityId - The entity's unique identifier
 * @param entityType - The type of entity (e.g., 'trip', 'note')
 * @param tag - The tag data
 * @returns Result containing the created tag
 */
export async function addEntityTag(
  entityId: string,
  entityType: string,
  tag: Partial<Tag>
): Promise<Result<Tag>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure entityId and entityType are set
    const tagData = {
      ...tag,
      entity_id: entityId,
      entity_type: entityType,
    };

    const { data: newTag, error } = await supabase
      .from(TABLES.TAGS)
      .insert(tagData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newTag };
  } catch (error) {
    return handleError(error, 'Failed to add entity tag');
  }
}

/**
 * Delete an entity tag.
 * @param entityId - The entity's unique identifier
 * @param entityType - The type of entity (e.g., 'trip', 'note')
 * @param tagId - The tag's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteEntityTag(
  entityId: string,
  entityType: string,
  tagId: string
): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.TAGS)
      .delete()
      .eq('id', tagId)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete entity tag');
  }
}

/**
 * Type guard to check if an object is a Tag
 */
export function isTag(obj: any): obj is Tag {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}
