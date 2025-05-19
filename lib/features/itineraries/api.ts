/**
 * Itineraries API
 *
 * Server-side API functions for itinerary management
 *
 * @module lib/features/itineraries/api
 */

import { createServerComponentClient, createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ItineraryItem, ItineraryTemplate, TemplateSection, TemplateItem } from './types';

// ============================================================================
// ITINERARY ITEMS API
// ============================================================================

/**
 * Get all itinerary items for a trip
 */
export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  const supabase = await createServerComponentClient();
  
  const { data, error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .select('*')
    .eq('trip_id', tripId)
    .order('day')
    .order('order');
    
  if (error) {
    console.error('Error fetching itinerary items:', error);
    throw new Error(`Failed to fetch itinerary items: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get a specific itinerary item by ID
 */
export async function getItineraryItem(itemId: string): Promise<ItineraryItem | null> {
  const supabase = await createServerComponentClient();
  
  const { data, error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .select('*')
    .eq('id', itemId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching itinerary item:', error);
    throw new Error(`Failed to fetch itinerary item: ${error.message}`);
  }
  
  return data;
}

/**
 * Create a new itinerary item
 */
export async function createItineraryItem(item: Omit<ItineraryItem, 'id' | 'created_at'>): Promise<ItineraryItem> {
  const supabase = await createRouteHandlerClient();
  
  const { data, error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .insert(item)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating itinerary item:', error);
    throw new Error(`Failed to create itinerary item: ${error.message}`);
  }
  
  return data;
}

/**
 * Update an existing itinerary item
 */
export async function updateItineraryItem(
  itemId: string, 
  updates: Partial<Omit<ItineraryItem, 'id' | 'created_at'>>
): Promise<ItineraryItem> {
  const supabase = await createRouteHandlerClient();
  
  const { data, error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating itinerary item:', error);
    throw new Error(`Failed to update itinerary item: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete an itinerary item
 */
export async function deleteItineraryItem(itemId: string): Promise<void> {
  const supabase = await createRouteHandlerClient();
  
  const { error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .delete()
    .eq('id', itemId);
    
  if (error) {
    console.error('Error deleting itinerary item:', error);
    throw new Error(`Failed to delete itinerary item: ${error.message}`);
  }
}

/**
 * Update the order of itinerary items
 */
export async function updateItineraryItemOrder(
  tripId: string,
  items: { id: string; order: number; day?: number }[]
): Promise<void> {
  const supabase = await createRouteHandlerClient();
  
  // Perform updates as a transaction
  const updates = items.map(item => ({
    id: item.id,
    order: item.order,
    day: item.day,
  }));
  
  const { error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .upsert(updates, { onConflict: 'id' });
    
  if (error) {
    console.error('Error updating itinerary item order:', error);
    throw new Error(`Failed to update itinerary order: ${error.message}`);
  }
}

// ============================================================================
// TEMPLATES API
// ============================================================================

/**
 * Get all published templates
 */
export async function getTemplates(
  limit: number = 20,
  offset: number = 0,
  isPublished: boolean = true
): Promise<ItineraryTemplate[]> {
  const supabase = await createServerComponentClient();
  
  const query = supabase
    .from(TABLES.TEMPLATES)
    .select('*');
    
  if (isPublished !== undefined) {
    query.eq('is_published', isPublished);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) {
    console.error('Error fetching templates:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get a specific template by ID with its sections and items
 */
export async function getTemplateById(
  templateId: string
): Promise<{ template: ItineraryTemplate; sections: TemplateSection[] } | null> {
  const supabase = await createServerComponentClient();
  
  // Fetch the template
  const { data: template, error: templateError } = await supabase
    .from(TABLES.TEMPLATES)
    .select('*')
    .eq('id', templateId)
    .single();
    
  if (templateError) {
    if (templateError.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching template:', templateError);
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }
  
  // Fetch the sections
  const { data: sections, error: sectionsError } = await supabase
    .from(TABLES.TEMPLATE_SECTIONS)
    .select('*')
    .eq('template_id', templateId)
    .order('day_number')
    .order('position');
    
  if (sectionsError) {
    console.error('Error fetching template sections:', sectionsError);
    throw new Error(`Failed to fetch template sections: ${sectionsError.message}`);
  }
  
  // If there are sections, fetch the items for each section
  if (sections && sections.length > 0) {
    const sectionIds = sections.map(section => section.id);
    
    const { data: items, error: itemsError } = await supabase
      .from(TABLES.TEMPLATE_ITEMS)
      .select('*')
      .in('section_id', sectionIds)
      .order('position');
      
    if (itemsError) {
      console.error('Error fetching template items:', itemsError);
      throw new Error(`Failed to fetch template items: ${itemsError.message}`);
    }
    
    // Group items by section
    const sectionsWithItems = sections.map((section: TemplateSection) => ({
      ...section,
      items: items?.filter(item => item.section_id === section.id) || [],
    }));
    
    return { template, sections: sectionsWithItems };
  }
  
  return { template, sections: sections || [] };
}

/**
 * Create a new template
 */
export async function createTemplate(
  template: Omit<ItineraryTemplate, 'id' | 'created_at' | 'view_count' | 'use_count' | 'updated_at' | 'slug'>
): Promise<ItineraryTemplate> {
  const supabase = await createRouteHandlerClient();
  
  // Generate a slug from the title
  const slug = template.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const templateData = {
    ...template,
    slug,
    view_count: 0,
    use_count: 0,
  };
  
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .insert(templateData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating template:', error);
    throw new Error(`Failed to create template: ${error.message}`);
  }
  
  return data;
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<Omit<ItineraryTemplate, 'id' | 'created_at' | 'updated_at'>>
): Promise<ItineraryTemplate> {
  const supabase = await createRouteHandlerClient();
  
  // If title is being updated, update the slug too
  if (updates.title) {
    updates.slug = updates.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  const { data, error } = await supabase
    .from(TABLES.TEMPLATES)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', templateId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating template:', error);
    throw new Error(`Failed to update template: ${error.message}`);
  }
  
  return data;
}

/**
 * Delete a template with all its sections and items
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const supabase = await createRouteHandlerClient();
  
  const { error } = await supabase
    .from(TABLES.TEMPLATES)
    .delete()
    .eq('id', templateId);
    
  if (error) {
    console.error('Error deleting template:', error);
    throw new Error(`Failed to delete template: ${error.message}`);
  }
}

/**
 * Apply a template to a trip
 */
export async function applyTemplateToTrip(
  templateId: string,
  tripId: string,
  userId: string
): Promise<ItineraryItem[]> {
  // Get the template with sections and items
  const templateData = await getTemplateById(templateId);
  
  if (!templateData) {
    throw new Error('Template not found');
  }
  
  const { template, sections } = templateData;
  
  // Prepare the itinerary items to insert
  const itineraryItems: Omit<ItineraryItem, 'id' | 'created_at'>[] = [];
  
  // Convert template sections and items to itinerary items
  sections.forEach((section: TemplateSection) => {
    section.items?.forEach((item: TemplateItem, index: number) => {
      itineraryItems.push({
        trip_id: tripId,
        title: item.title,
        description: item.description,
        location: item.location,
        start_time: item.start_time,
        end_time: item.end_time,
        day: section.day_number,
        order: index,
        category: item.category,
        created_by: userId,
        status: 'suggested',
      });
    });
  });
  
  const supabase = await createRouteHandlerClient();
  
  // Insert all items
  const { data, error } = await supabase
    .from(TABLES.ITINERARY_ITEMS)
    .insert(itineraryItems)
    .select();
    
  if (error) {
    console.error('Error applying template:', error);
    throw new Error(`Failed to apply template: ${error.message}`);
  }
  
  // Update template use count
  await supabase
    .from(TABLES.TEMPLATES)
    .update({ 
      use_count: template.use_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId);
  
  return data || [];
}