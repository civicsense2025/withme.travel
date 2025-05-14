import { createRouteHandlerClient } from '@/utils/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';
import { TRIP_ROLES } from '@/utils/constants/status';
import { SupabaseClient } from '@supabase/supabase-js';

type AllowedRoleKey = keyof typeof TRIP_ROLES;

// Define local constants for database tables and fields
const TABLES = {
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  ITINERARY_SECTIONS: 'itinerary_sections',
} as const;

const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  TRIP_MEMBERS: {
    ROLE: 'role',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
  },
  ITINERARY_ITEMS: {
    DAY_NUMBER: 'day_number',
    TRIP_ID: 'trip_id',
    SECTION_ID: 'section_id',
  },
  ITINERARY_TEMPLATE_ITEMS: {
    TEMPLATE_ID: 'template_id',
    DAY: 'day',
    ITEM_ORDER: 'item_order',
  },
};

// Define interfaces with proper type safety
interface TemplateItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  duration_minutes: number | null;
  start_time: string | null;
  end_time: string | null;
  position: number | null;
  item_order: number | null;
  category: string | null;
  day: number | null;
}

interface TemplateSection {
  id: string;
  day_number: number;
  title: string;
  itinerary_template_items: TemplateItem[];
}

interface DayNumberItem {
  day_number: number;
}

// Define more precise interface for template data
interface TemplateDataWithSections {
  id: string;
  title?: string;
  duration_days?: number;
  version?: string;
  [TABLES.ITINERARY_TEMPLATE_SECTIONS]?: Array<{
    id?: string;
    day_number?: number;
    title?: string;
    [TABLES.ITINERARY_TEMPLATE_ITEMS]?: Array<{
      id?: string;
      title?: string;
      description?: string | null;
      location?: string | null;
      duration_minutes?: number | null;
      start_time?: string | null;
      end_time?: string | null;
      position?: number | null;
      item_order?: number | null;
      category?: string | null;
      day?: number | null;
    }>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Re-use or import checkTripAccess function
async function checkTripAccess(
  supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>,
  tripId: string,
  userId: string,
  allowedRoles: AllowedRoleKey[]
): Promise<{ allowed: boolean; error?: string; status?: number }> {
  const { data: member, error } = await supabase
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { allowed: false, error: error.message, status: 500 };
  if (!member) return { allowed: false, error: 'Not a member', status: 403 };

  // Get the actual role values (e.g. 'admin', 'editor', etc.)
  const allowedRoleValues = allowedRoles.map((role) => TRIP_ROLES[role]);

  // Check if the user's role is in the list of allowed roles
  if (!member.role || !allowedRoleValues.includes(member.role)) {
    return { allowed: false, error: 'Insufficient permissions', status: 403 };
  }

  return { allowed: true };
}

// POST /api/trips/[tripId]/apply-template/[templateId] - Apply an itinerary template to a trip
export async function POST(
  request: NextRequest,
  { params }: { params: { tripId: string; templateId: string } }
): Promise<NextResponse> {
  const { tripId, templateId } = params;
  const supabase = await createRouteHandlerClient();

  if (!tripId || !templateId) {
    return NextResponse.json({ error: 'Trip ID and Template ID are required' }, { status: 400 });
  }

  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to edit the trip
    const access = await checkTripAccess(supabase, tripId, user.id, [
      'ADMIN',
      'EDITOR',
      'CONTRIBUTOR',
    ]);
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Check for existing items in the trip and find the maximum day number
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
    let dayOffset = 1;

    if (existingItems && existingItems.length > 0) {
      const firstItem = existingItems[0];
      if (firstItem && typeof firstItem.day_number === 'number') {
        dayOffset = firstItem.day_number + 1;
      }
    }

    console.log(`[DEBUG] Using day offset: ${dayOffset} for template application`);

    // 2. Fetch the template details (sections and activities)
    const { data: templateData, error: templateError } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .select(
        `
        id,
        title,
        duration_days,
        version,
        ${TABLES.ITINERARY_TEMPLATE_SECTIONS} (
          *,
          ${TABLES.ITINERARY_TEMPLATE_ITEMS} (*)
        )
      `
      )
      .eq('id', templateId)
      .single();

    if (templateError) {
      console.error('Error fetching itinerary template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template details.' }, { status: 500 });
    }

    if (!templateData) {
      return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
    }

    // Safely extract template sections with proper error handling
    let templateSections: TemplateSection[] = [];
    try {
      // Cast to our defined type for safety
      const typedTemplateData = templateData as TemplateDataWithSections;

      // Make sure field access is by string key to avoid 'never' type issues
      const templateSectionKey = TABLES.ITINERARY_TEMPLATE_SECTIONS;
      const templateItemsKey = TABLES.ITINERARY_TEMPLATE_ITEMS;

      if (
        typedTemplateData &&
        typeof typedTemplateData === 'object' &&
        templateSectionKey in typedTemplateData &&
        Array.isArray(typedTemplateData[templateSectionKey]) &&
        typedTemplateData[templateSectionKey]?.length > 0
      ) {
        const sections = typedTemplateData[templateSectionKey] || [];

        // Create properly typed sections
        templateSections = sections.map((section): TemplateSection => {
          // Safe extraction of section properties with defaults
          const id = section?.id || `section-${Math.random().toString(36).substring(2, 9)}`;
          const dayNumber = typeof section?.day_number === 'number' ? section.day_number : 1;
          const title = section?.title || `Day ${dayNumber}`;

          // Safe extraction of items with defaults
          const items = Array.isArray(section?.[templateItemsKey])
            ? section[templateItemsKey]?.map(
                (item): TemplateItem => ({
                  id: item?.id || '',
                  title: item?.title || 'Untitled Item',
                  description: item?.description || null,
                  location: item?.location || null,
                  duration_minutes:
                    typeof item?.duration_minutes === 'number' ? item.duration_minutes : null,
                  start_time: item?.start_time || null,
                  end_time: item?.end_time || null,
                  position: typeof item?.position === 'number' ? item.position : null,
                  item_order: typeof item?.item_order === 'number' ? item.item_order : null,
                  category: item?.category || null,
                  day: typeof item?.day === 'number' ? item.day : null,
                })
              ) || []
            : [];

          return {
            id,
            day_number: dayNumber,
            title,
            itinerary_template_items: items,
          };
        });
      } else {
        console.log('[DEBUG] No sections found, fetching items directly');
        const { data: templateItems, error: templateItemsError } = await supabase
          .from(TABLES.ITINERARY_TEMPLATE_ITEMS)
          .select('*')
          .eq('template_id', templateId)
          .order('day', { ascending: true })
          .order('item_order', { ascending: true });

        if (templateItemsError) {
          console.error('Error fetching template items:', templateItemsError);
          return NextResponse.json({ error: 'Failed to fetch template items.' }, { status: 500 });
        }

        if (templateItems && templateItems.length > 0) {
          // Group items by day with proper typing
          const itemsByDay: Record<string, TemplateItem[]> = {};

          // Define better type for template items from direct query
          type TemplateItemRaw = Partial<TemplateItem> & { day?: number | null };

          for (const item of templateItems as TemplateItemRaw[]) {
            const day = item.day?.toString() || '1';
            if (!itemsByDay[day]) {
              itemsByDay[day] = [];
            }

            // Use a proper conversion to TemplateItem with safe defaults
            itemsByDay[day].push({
              id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
              title: item.title || 'Untitled Item',
              description: item.description || null,
              location: item.location || null,
              duration_minutes:
                typeof item.duration_minutes === 'number' ? item.duration_minutes : null,
              start_time: item.start_time || null,
              end_time: item.end_time || null,
              position: typeof item.position === 'number' ? item.position : null,
              item_order: typeof item.item_order === 'number' ? item.item_order : null,
              category: item.category || null,
              day: typeof item.day === 'number' ? item.day : null,
            });
          }

          // Create synthetic sections from the items
          templateSections = Object.keys(itemsByDay).map((day) => ({
            id: `synthetic-section-day-${day}`,
            day_number: parseInt(day, 10),
            title: `Day ${day}`,
            itinerary_template_items: itemsByDay[day],
          }));
        }
      }
    } catch (error) {
      console.error('Error extracting template sections:', error);
      return NextResponse.json({ error: 'Failed to extract template sections.' }, { status: 500 });
    }

    // 3. Prepare new itinerary items based on template items with adjusted days
    interface NewItineraryItem {
      trip_id: string;
      created_by: string | null;
      title: string;
      description?: string | null;
      location?: string | null;
      duration_minutes?: number | null;
      start_time?: string | null;
      end_time?: string | null;
      day_number: number;
      position: number;
      category?: string | null;
      status: string;
    }

    const itemsToInsert: NewItineraryItem[] = [];
    const sectionsToCreate = new Set<number>(); // Track unique day numbers to create sections for

    templateSections.forEach((section: TemplateSection) => {
      const originalDayNumber = section.day_number || 1;
      const newDayNumber = dayOffset + originalDayNumber - 1; // Adjust day number with offset

      // Add this day number to our sections to create
      sectionsToCreate.add(newDayNumber);

      const items = section.itinerary_template_items || [];
      items.forEach((item: TemplateItem) => {
        itemsToInsert.push({
          trip_id: tripId,
          created_by: null, // Set to null to avoid foreign key issues
          title: item.title || 'Untitled Item',
          description: item.description || null,
          location: item.location || null,
          duration_minutes: item.duration_minutes || null,
          start_time: item.start_time || null,
          end_time: item.end_time || null,
          day_number: newDayNumber,
          position: item.position || item.item_order || 0,
          category: item.category || null,
          status: 'suggested',
        });
      });
    });

    if (itemsToInsert.length === 0) {
      return NextResponse.json({ message: 'Template has no items to apply.' }, { status: 200 });
    }

    // Add detailed logging for the user ID
    console.log(
      `[DEBUG] Preparing to insert ${itemsToInsert.length} items for trip ${tripId}. Using user ID: ${user?.id}`
    );

    // Ensure user ID is valid before proceeding
    if (!user?.id) {
      console.error('[ERROR] User ID is missing or invalid before inserting items.');
      return NextResponse.json({ error: 'Invalid user session state.' }, { status: 500 });
    }

    console.log(
      `[DEBUG] Inserting ${itemsToInsert.length} template items with day offset ${dayOffset} (using null for created_by)`
    );

    // 4. Insert new items
    const { data: newItems, error: insertError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
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
      .from(TABLES.ITINERARY_SECTIONS)
      .select('position')
      .eq('trip_id', tripId)
      .order('position', { ascending: false })
      .limit(1);

    const maxPosition = maxPosData && maxPosData.length > 0 ? maxPosData[0]?.position || 0 : 0;

    // Prepare sections to create
    const sectionsToInsert = Array.from(sectionsToCreate).map((dayNumber, index) => ({
      trip_id: tripId,
      day_number: dayNumber,
      title: `Day ${dayNumber}`,
      position: maxPosition + index + 1,
    }));

    if (sectionsToInsert.length > 0) {
      // Create the sections
      const { error: sectionError } = await supabase
        .from(TABLES.ITINERARY_SECTIONS)
        .upsert(sectionsToInsert, { onConflict: 'trip_id,day_number' });

      if (sectionError) {
        console.warn('Error creating sections:', sectionError);
        // Non-critical, continue
      }
    }

    // 5. Return success with summary
    return NextResponse.json({
      success: true,
      message: `Applied template with ${itemsToInsert.length} items across ${sectionsToCreate.size} day(s)`,
      days: Array.from(sectionsToCreate),
      itemCount: itemsToInsert.length,
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
