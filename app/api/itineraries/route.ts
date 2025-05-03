import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

// Define constants for tables/fields not in the imported constants
const ITINERARY_TABLES = {
  ITINERARY_TEMPLATES: 'itinerary_templates',
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  DESTINATIONS: 'destinations',
  PROFILES: 'profiles',
};

const FIELDS = {
  ITINERARY_TEMPLATES: {
    IS_PUBLISHED: 'is_published',
    CREATED_AT: 'created_at',
    CREATED_BY: 'created_by',
  },
  PROFILES: {
    ID: 'id',
  },
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createRouteHandlerClient();

  try {
    // Get user for authorization (but don't require it for public templates)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('Fetching itineraries...');

    // Get published itineraries - fixed query to use proper join
    const { data, error } = await supabase
      .from(ITINERARY_TABLES.ITINERARY_TEMPLATES)
      .select(
        `
        *,
        ${ITINERARY_TABLES.DESTINATIONS}(*),
        profiles:${ITINERARY_TABLES.PROFILES}!${FIELDS.ITINERARY_TEMPLATES.CREATED_BY}(id, name, avatar_url)
      `
      )
      .eq(FIELDS.ITINERARY_TEMPLATES.IS_PUBLISHED, true)
      .order(FIELDS.ITINERARY_TEMPLATES.CREATED_AT, { ascending: false });

    if (error) {
      console.error('Error fetching itineraries:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} itineraries`);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createRouteHandlerClient();

  // Get user for authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const itineraryData = await request.json();

    // Validate required fields
    if (
      !itineraryData.title ||
      !itineraryData.destination_id ||
      !itineraryData.duration_days ||
      !Array.isArray(itineraryData.sections)
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a slug if not provided
    const slug = itineraryData.slug || generateSlug(itineraryData.title);

    // 1. Insert the itinerary template
    const { data: template, error: templateError } = await supabase
      .from(ITINERARY_TABLES.ITINERARY_TEMPLATES)
      .insert({
        title: itineraryData.title,
        slug: slug,
        description: itineraryData.description,
        destination_id: itineraryData.destination_id,
        duration_days: itineraryData.duration_days,
        created_by: user.id,
        is_published: itineraryData.is_published || false,
        tags: itineraryData.tags || [],
        metadata: itineraryData.metadata || {},
        category: itineraryData.category || 'Other',
      })
      .select()
      .single();

    if (templateError) {
      console.error('Error creating itinerary template:', templateError);
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }

    // 2. Insert sections
    const sectionPromises = itineraryData.sections.map(
      async (section: any, sectionIndex: number) => {
        // Validate section data
        if (!section.title || typeof section.day_number !== 'number') {
          throw new Error(`Invalid section data at index ${sectionIndex}`);
        }

        const { data: sectionData, error: sectionError } = await supabase
          .from(ITINERARY_TABLES.ITINERARY_TEMPLATE_SECTIONS)
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
            .from(ITINERARY_TABLES.ITINERARY_TEMPLATE_ITEMS)
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
      }
    );

    // Wait for all section and item insertions to complete
    const sections = await Promise.all(sectionPromises);

    return NextResponse.json({
      data: {
        ...template,
        sections,
      },
    });
  } catch (error: any) {
    console.error('Error processing itinerary creation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
