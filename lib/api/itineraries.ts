/**
 * Itineraries API
 *
 * Provides CRUD operations and custom actions for itineraries (collections of itinerary items).
 * Used for managing trip itineraries, templates, and collaborative planning.
 *
 * @module lib/api/itineraries
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result } from './_shared';

// Helper to generate slugs from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Check if a user is an admin
async function isAdminUser(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) return false;
    return !!data?.is_admin;
  } catch {
    return false;
  }
}

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all itineraries or templates.
 * @param options - Query options: isPublished, limit, offset
 * @returns Result containing an array of itineraries
 */
export async function listItineraries(
  options: { isPublished?: boolean; limit?: number; offset?: number } = {}
): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Initialize the query
    let query = supabase
      .from('itinerary_templates')
      .select(`*, destinations(*)`)
      .order('created_at', { ascending: false });

    // Apply limit/offset if provided
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.offset(options.offset);

    // Apply filters based on authentication status and admin status
    let result;

    if (user) {
      // Check if the user is an admin
      const isAdmin = await isAdminUser(supabase, user.id);

      if (isAdmin) {
        // Admin users can see all templates
        result = await query;
      } else {
        // Regular authenticated users: show published templates + their drafts
        result = await query.or(`is_published.eq.true,created_by.eq.${user.id}`);
      }
    } else {
      // For unauthenticated users: only show published templates
      result = await query.eq('is_published', true);
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    let templatesData = result.data || [];

    // Get profiles for template creators
    if (templatesData.length > 0) {
      const creatorIds = Array.from(new Set(templatesData.map((t) => t.created_by)));

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', creatorIds);

        if (!profilesError && profilesData) {
          // Create a map for quick profile lookup
          const profilesMap = new Map(profilesData.map((p) => [p.id, p]));

          // Merge profiles with templates
          templatesData = templatesData.map((template) => ({
            ...template,
            profile: profilesMap.get(template.created_by) || null,
          }));
        }
      }
    }

    return { success: true, data: templatesData };
  } catch (error) {
    return handleError(error, 'Failed to fetch itineraries');
  }
}

/**
 * Get a single itinerary by ID.
 * @param itineraryId - The itinerary's unique identifier
 * @returns Result containing the itinerary
 */
export async function getItinerary(itineraryId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('itinerary_templates')
      .select(
        `
        *,
        destinations(*),
        creator:profiles(id, name, avatar_url)
      `
      )
      .eq('id', itineraryId)
      .single();

    if (error) return { success: false, error: error.message };

    // Get the sections and items
    const { data: sections, error: sectionsError } = await supabase
      .from('itinerary_template_sections')
      .select(
        `
        *,
        template_activities(*)
      `
      )
      .eq('template_id', itineraryId)
      .order('position', { ascending: true })
      .order('day_number', { ascending: true });

    if (sectionsError) return { success: false, error: sectionsError.message };

    // Process sections to sort activities
    const processedSections =
      sections?.map((section) => ({
        ...section,
        activities: (section.template_activities || []).sort(
          (a, b) => (a.position || 0) - (b.position || 0)
        ),
      })) || [];

    // Update view count
    await supabase
      .from('itinerary_templates')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', itineraryId);

    return {
      success: true,
      data: {
        ...data,
        sections: processedSections,
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch itinerary');
  }
}

/**
 * Create a new itinerary.
 * @param data - The itinerary data
 * @returns Result containing the created itinerary
 */
export async function createItinerary(data: any): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user for authorization
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate required fields
    if (
      !data.title ||
      !data.destination_id ||
      !data.duration_days ||
      !Array.isArray(data.sections)
    ) {
      return { success: false, error: 'Missing required fields' };
    }

    // Generate a slug if not provided
    const slug = data.slug || generateSlug(data.title);

    // 1. Insert the itinerary template
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .insert({
        title: data.title,
        slug: slug,
        description: data.description,
        destination_id: data.destination_id,
        duration_days: data.duration_days,
        created_by: user.id,
        is_published: data.is_published || false,
        tags: data.tags || [],
        metadata: data.metadata || {},
        category: data.category || 'Other',
      })
      .select()
      .single();

    if (templateError) {
      return { success: false, error: templateError.message };
    }

    // 2. Insert sections and their items
    const sectionPromises = data.sections.map(async (section: any, sectionIndex: number) => {
      // Validate section data
      if (!section.title || typeof section.day_number !== 'number') {
        throw new Error(`Invalid section data at index ${sectionIndex}`);
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from('itinerary_template_sections')
        .insert({
          template_id: template.id,
          day_number: section.day_number,
          title: section.title,
          position: sectionIndex,
        })
        .select()
        .single();

      if (sectionError) {
        throw sectionError;
      }

      // 3. Insert items for this section
      if (Array.isArray(section.items) && section.items.length > 0) {
        const items = section.items.map((item: any, itemIndex: number) => ({
          template_id: template.id,
          section_id: sectionData.id,
          day: section.day_number,
          item_order: itemIndex,
          title: item.title,
          description: item.description || null,
          start_time: item.start_time || null,
          end_time: item.end_time || null,
          location: item.location || null,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('itinerary_template_items')
          .insert(items)
          .select();

        if (itemsError) {
          throw itemsError;
        }

        return {
          ...sectionData,
          items: itemsData,
        };
      }

      return {
        ...sectionData,
        items: [],
      };
    });

    // Wait for all section and item insertions to complete
    const sections = await Promise.all(sectionPromises);

    return {
      success: true,
      data: {
        ...template,
        sections,
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to create itinerary');
  }
}

/**
 * Update an existing itinerary.
 * @param itineraryId - The itinerary's unique identifier
 * @param data - Partial itinerary data to update
 * @returns Result containing the updated itinerary
 */
export async function updateItinerary(itineraryId: string, data: any): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user for authorization
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user owns the itinerary or is admin
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('created_by')
      .eq('id', itineraryId)
      .single();

    if (templateError) {
      return { success: false, error: templateError.message };
    }

    // Check authorization
    const isAdmin = await isAdminUser(supabase, user.id);
    if (template.created_by !== user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized to update this itinerary' };
    }

    // Update the itinerary
    const { data: updatedTemplate, error } = await supabase
      .from('itinerary_templates')
      .update(data)
      .eq('id', itineraryId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: updatedTemplate };
  } catch (error) {
    return handleError(error, 'Failed to update itinerary');
  }
}

/**
 * Delete an itinerary by ID.
 * @param itineraryId - The itinerary's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteItinerary(itineraryId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user for authorization
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user owns the itinerary or is admin
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('created_by')
      .eq('id', itineraryId)
      .single();

    if (templateError) {
      return { success: false, error: templateError.message };
    }

    // Check authorization
    const isAdmin = await isAdminUser(supabase, user.id);
    if (template.created_by !== user.id && !isAdmin) {
      return { success: false, error: 'Unauthorized to delete this itinerary' };
    }

    // First delete associated items and sections to avoid foreign key constraints
    const { error: itemsError } = await supabase
      .from('itinerary_template_items')
      .delete()
      .eq('template_id', itineraryId);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    const { error: sectionsError } = await supabase
      .from('itinerary_template_sections')
      .delete()
      .eq('template_id', itineraryId);

    if (sectionsError) {
      return { success: false, error: sectionsError.message };
    }

    // Now delete the template itself
    const { error } = await supabase.from('itinerary_templates').delete().eq('id', itineraryId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete itinerary');
  }
}

/**
 * Type guard to check if an object is an ItineraryItem
 */
export function isItineraryItem(obj: any): obj is ItineraryItem {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

// (Add more as needed)
