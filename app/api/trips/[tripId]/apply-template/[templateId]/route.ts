import { createServerSupabaseClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

// Define the role constants
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

// Re-use or import checkTripAccess function
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  tripId: string,
  userId: string,
  allowedRoles: string[]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  // (Implementation is the same as in reorder/route.ts - copy or import)
  const { data: member, error } = await supabase
    .from('trip_members')
    .select(`role`)
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { allowed: false, error: error.message, status: 500 };
  if (!member) return { allowed: false, error: 'Not a member', status: 403 };
  if (!allowedRoles.includes(member.role))
    return { allowed: false, error: 'Insufficient permissions', status: 403 };
  return { allowed: true };
}

// POST /api/trips/[tripId]/apply-template/[templateId] - Apply an itinerary template to a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; templateId: string }> }
) {
  // Extract params properly
  const { tripId, templateId } = await params;

  if (!tripId || !templateId) {
    return NextResponse.json({ error: 'Trip ID and Template ID are required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user has permission to edit the trip
    const access = await checkTripAccess(supabase, tripId, user.id, [
      TRIP_ROLES.ADMIN,
      TRIP_ROLES.EDITOR,
      TRIP_ROLES.CONTRIBUTOR,
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // 1. Check for existing items in the trip and find the maximum day number
    const { data: existingItems, error: existingItemsError } = await supabase
      .from('itinerary_items')
      .select('day_number')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: false })
      .limit(1);

    if (existingItemsError) {
      console.error('Error checking existing items:', existingItemsError);
      return NextResponse.json({ error: 'Failed to check existing items.' }, { status: 500 });
    }

    // Calculate the day offset - if trip has items, start after the last day, otherwise start at day 1
    const dayOffset = existingItems && existingItems.length > 0 
      ? (existingItems[0].day_number || 0) + 1 
      : 1;
    
    console.log(`[DEBUG] Using day offset: ${dayOffset} for template application`);

    // 2. Fetch the template details (sections and activities)
    const { data: templateData, error: templateError } = await supabase
      .from('itinerary_templates')
      .select(`
        id,
        title,
        duration_days,
        version,
        itinerary_template_sections (
          *,
          itinerary_template_items (*)
        )
      `)
      .eq('id', templateId)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching itinerary template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template details.' }, { status: 500 });
    }

    if (!templateData) {
      return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    }

    // If the template sections are empty, try fetching items directly
    let templateSections = templateData.itinerary_template_sections || [];
    if (templateSections.length === 0) {
      console.log('[DEBUG] No sections found, fetching items directly');
      const { data: templateItems, error: templateItemsError } = await supabase
        .from('itinerary_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('day', { ascending: true })
        .order('item_order', { ascending: true });

      if (templateItemsError) {
        console.error('Error fetching template items:', templateItemsError);
        return NextResponse.json({ error: 'Failed to fetch template items.' }, { status: 500 });
      }

      if (templateItems && templateItems.length > 0) {
        // Group items by day
        const itemsByDay = templateItems.reduce((acc: any, item: any) => {
          const day = item.day || 1;
          if (!acc[day]) {
            acc[day] = [];
          }
          acc[day].push(item);
          return acc;
        }, {});

        // Create synthetic sections from the items
        templateSections = Object.keys(itemsByDay).map((day) => ({
          id: `synthetic-section-day-${day}`,
          day_number: parseInt(day, 10),
          title: `Day ${day}`,
          itinerary_template_items: itemsByDay[day]
        }));
      }
    }

    // 3. Prepare new itinerary items based on template items with adjusted days
    const itemsToInsert: any[] = [];
    const sectionsToCreate = new Set<number>(); // Track unique day numbers to create sections for
    
    templateSections.forEach((section: any) => {
      const originalDayNumber = section.day_number || 1;
      const newDayNumber = dayOffset + originalDayNumber - 1; // Adjust day number with offset
      
      // Add this day number to our sections to create
      sectionsToCreate.add(newDayNumber);
      
      const items = section.itinerary_template_items || [];
      items.forEach((item: any) => {
        itemsToInsert.push({
          trip_id: tripId,
          created_by: null, // Set to null to avoid foreign key issues
          title: item.title,
          description: item.description,
          location: item.location,
          duration_minutes: item.duration_minutes,
          start_time: item.start_time,
          end_time: item.end_time,
          day_number: newDayNumber,
          position: item.position || item.item_order || 0,
          category: item.category,
          status: 'suggested',
        });
      });
    });

    if (itemsToInsert.length === 0) {
      return NextResponse.json(
        { message: 'Template has no items to apply.' },
        { status: 200 }
      );
    }

    // Add detailed logging for the user ID
    console.log(`[DEBUG] Preparing to insert ${itemsToInsert.length} items for trip ${tripId}. Using user ID: ${user?.id}`);

    // Ensure user ID is valid before proceeding
    if (!user?.id) {
      console.error('[ERROR] User ID is missing or invalid before inserting items.');
      return NextResponse.json({ error: 'Invalid user session state.' }, { status: 500 });
    }
    
    // Previous profile lookup code was here - instead, we're just using null for created_by
    // Set created_by to null for all items to avoid foreign key constraint issues
    itemsToInsert.forEach(item => {
      item.created_by = null;
    });
    
    console.log(`[DEBUG] Inserting ${itemsToInsert.length} template items with day offset ${dayOffset} (using null for created_by)`);

    // 4. Insert new items
    const { data: newItems, error: insertError } = await supabase
      .from('itinerary_items')
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting template items:', insertError);
      return NextResponse.json({ error: 'Failed to apply template items.' }, { status: 500 });
    }

    // 4.5 Create sections for each day if they don't exist
    console.log(`[DEBUG] Creating ${sectionsToCreate.size} sections for applied template`);
    
    // First get the max position of existing sections to ensure we append new ones
    const { data: maxPosData } = await supabase
      .from('itinerary_sections')
      .select('position')
      .eq('trip_id', tripId)
      .order('position', { ascending: false })
      .limit(1);
    
    const maxPosition = maxPosData && maxPosData.length > 0 ? maxPosData[0].position : 0;
    let nextPosition = maxPosition + 1;
    
    // Create array of section objects
    const sectionsToInsert = Array.from(sectionsToCreate).map(dayNumber => ({
      trip_id: tripId,
      day_number: dayNumber,
      title: `Day ${dayNumber}`,
      position: nextPosition++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    // Insert sections if there are any
    if (sectionsToInsert.length > 0) {
      const { error: sectionError } = await supabase
        .from('itinerary_sections')
        .upsert(sectionsToInsert, { 
          onConflict: 'trip_id,day_number',
          ignoreDuplicates: true 
        });
      
      if (sectionError) {
        console.error('[WARNING] Error creating itinerary sections:', sectionError);
        // Don't fail the entire operation if section creation fails, just log it
      } else {
        console.log(`[DEBUG] Successfully created ${sectionsToInsert.length} itinerary sections`);
      }
    }

    // 5. Update trip duration if needed
    const newTotalDays = dayOffset + (templateData.duration_days || 1) - 1;
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('duration_days')
      .eq('id', tripId)
      .single();

    if (tripData && (!tripData.duration_days || tripData.duration_days < newTotalDays)) {
      await supabase
        .from('trips')
        .update({ duration_days: newTotalDays })
        .eq('id', tripId);
      
      console.log(`[DEBUG] Updated trip duration to ${newTotalDays} days`);
    }

    // 6. Record template usage
    try {
      await supabase.rpc('increment_template_uses', { template_id: templateId });
      console.log(`[DEBUG] Incremented usage count for template ${templateId}`);
    } catch (error) {
      console.error('[DEBUG] Could not increment template uses:', error);
      // Non-critical error, continue
    }

    return NextResponse.json(
      { 
        message: 'Template applied successfully.', 
        count: newItems?.length ?? 0,
        dayOffset: dayOffset,
        newTotalDays: newTotalDays
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unexpected error applying template:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
