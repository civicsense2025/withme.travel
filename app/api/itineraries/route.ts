import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define constants for tables/fields not in the imported constants
const ITINERARY_FIELDS = {
  ITINERARY_TEMPLATES: {
    IS_PUBLISHED: 'is_published',
    CREATED_AT: 'created_at',
    CREATED_BY: 'created_by',
  },
  PROFILES: {
    ID: 'id',
  },
  COMMON: {
    CREATED_AT: 'created_at',
  },
};

/**
 * Check if a user is an admin
 */
async function isAdminUser(supabase: any, userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('[API] Error checking admin status:', error);
      return false;
    }

    return !!data.is_admin;
  } catch (error) {
    console.error('[API] Error checking admin status:', error);
    return false;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('[API] GET /api/itineraries - Starting request');
  console.log(`[API] Request URL: ${request.url}`);
  console.log(`[API] Request headers: ${JSON.stringify(Object.fromEntries(request.headers))}`);

  try {
    console.log('[API] Creating Supabase route handler client');
    let supabase;
    try {
      supabase = await createRouteHandlerClient();
      console.log('[API] Supabase client created successfully');
    } catch (clientError) {
      console.error('[API] Failed to create Supabase client:', clientError);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: clientError instanceof Error ? clientError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Get user for authorization
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('[API] Fetching itinerary templates...');
    console.log(`[API] User authenticated: ${!!user}`);

    // DEBUG: Print the table name being queried
    console.log(`[API] Querying table: itinerary_templates`);

    // Initialize the query to select templates with destinations
    let query = supabase
      .from('itinerary_templates')
      .select(`*, destinations(*)`)
      .order('created_at', { ascending: false });

    // Apply filters based on authentication status and admin status
    let data;
    let templatesError;

    if (user) {
      // Check if the user is an admin
      const isAdmin = await isAdminUser(supabase, user.id);
      console.log(`[API] User ${user.id} is admin: ${isAdmin}`);

      if (isAdmin) {
        // Admin users can see all templates
        console.log('[API] Admin user - fetching all templates');
        const result = await query;
        data = result.data;
        templatesError = result.error;
      } else {
        // Regular authenticated users: show published templates + their drafts
        console.log(
          `[API] Regular user ${user.id} - fetching published templates and user's drafts`
        );
        const result = await query.or(`is_published.eq.true,created_by.eq.${user.id}`);
        data = result.data;
        templatesError = result.error;
      }
    } else {
      // For unauthenticated users: only show published templates
      console.log('[API] Unauthenticated request, fetching only published templates');
      const result = await query.eq('is_published', true);
      data = result.data;
      templatesError = result.error;
    }

    // Use let for templatesData so we can modify it later
    let templatesData = data;

    if (templatesError) {
      console.error('[API] Error fetching itineraries:', templatesError);
      return NextResponse.json({ error: templatesError.message }, { status: 500 });
    }

    console.log(`[API] Found ${templatesData?.length || 0} itinerary templates`);

    // Debug ALL templates to understand the differences
    if (templatesData && templatesData.length > 0) {
      console.log(
        `[API] First template - Title: ${templatesData[0].title}, ID: ${templatesData[0].id}, Published: ${templatesData[0].is_published}`
      );

      // Log a summary of all templates
      console.log('[API] Template summary:');
      templatesData.forEach((template, index) => {
        console.log(
          `[API] - #${index + 1}: ID: ${template.id}, Title: ${template.title}, Published: ${template.is_published}, Created by: ${template.created_by}`
        );
      });

      if (user) {
        // Log the breakdown between published and user's drafts
        const publishedTemplates = templatesData.filter((t) => t.is_published);
        const userDrafts = templatesData.filter((t) => !t.is_published && t.created_by === user.id);
        const otherDrafts = templatesData.filter(
          (t) => !t.is_published && t.created_by !== user.id
        );
        console.log(
          `[API] Template breakdown: ${publishedTemplates.length} published, ${userDrafts.length} user drafts, ${otherDrafts.length} other drafts`
        );
      }
    }

    // Get profiles for template creators in a separate query
    if (templatesData && templatesData.length > 0) {
      const creatorIds = Array.from(new Set(templatesData.map((t) => t.created_by)));
      console.log(
        `[API] Found ${creatorIds.length} unique creator IDs: ${JSON.stringify(creatorIds)}`
      );

      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', creatorIds);

        if (!profilesError && profilesData) {
          console.log(`[API] Retrieved ${profilesData.length} user profiles`);
          console.log(`[API] Profile IDs: ${profilesData.map((p) => p.id).join(', ')}`);

          // Create a map for quick profile lookup
          const profilesMap = new Map(profilesData.map((p) => [p.id, p]));

          // Merge profiles with templates
          templatesData = templatesData.map((template) => ({
            ...template,
            profile: profilesMap.get(template.created_by) || null,
          }));
        } else {
          console.error('[API] Error fetching profiles:', profilesError);
        }
      }
    }

    return NextResponse.json({ data: templatesData });
  } catch (error) {
    console.error('[API] Error in itineraries endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  console.log('[API] POST /api/itineraries - Starting request');

  // Get user for authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('[API] POST /api/itineraries - Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const itineraryData = await request.json();
    console.log('[API] Creating new itinerary template:', itineraryData.title);

    // Validate required fields
    if (
      !itineraryData.title ||
      !itineraryData.destination_id ||
      !itineraryData.duration_days ||
      !Array.isArray(itineraryData.sections)
    ) {
      console.log('[API] Missing required fields in itinerary creation request');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a slug if not provided
    const slug = itineraryData.slug || generateSlug(itineraryData.title);

    // 1. Insert the itinerary template
    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
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
      console.error('[API] Error creating itinerary template:', templateError);
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }

    console.log(`[API] Created template with ID: ${template.id}`);

    // 2. Insert sections
    const sectionPromises = itineraryData.sections.map(
      async (section: any, sectionIndex: number) => {
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
      }
    );

    // Wait for all section and item insertions to complete
    const sections = await Promise.all(sectionPromises);
    console.log(`[API] Created ${sections.length} sections for template ${template.id}`);

    return NextResponse.json({
      data: {
        ...template,
        sections,
      },
    });
  } catch (error: any) {
    console.error('[API] Error processing itinerary creation:', error);
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
