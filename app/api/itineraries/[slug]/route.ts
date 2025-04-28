import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS } from '@/utils/constants';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, expires: new Date(0) });
        },
      },
    }
  );
  
  try {
    console.log(`[Template API] Fetching template with slug: "${slug}"`);
    
    // Fetch the itinerary template
    const { data: template, error: templateError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .select(`
        *,
        ${DB_TABLES.DESTINATIONS}(*),
        creator:${DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY}(id, name, avatar_url)
      `)
      .eq(DB_FIELDS.ITINERARY_TEMPLATES.SLUG, slug)
      .single();
    
    if (templateError) {
      if (templateError.code === 'PGRST116') {
        console.warn(`[Template API] Template not found for slug: "${slug}"`);
        return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
      }
      console.error('[Template API] Error fetching itinerary template:', {
        error: templateError,
        slug,
        code: templateError.code,
        details: templateError.details
      });
      return NextResponse.json({ 
        error: `Failed to fetch template: ${templateError.message}` 
      }, { status: 500 });
    }
    
    if (!template) {
      console.warn(`[Template API] No template found for slug: "${slug}" (no error but empty result)`);
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    
    console.log(`[Template API] Found template with ID: "${template.id}"`);
    
    // Fetch template sections with activities in a single query
    const { data: sections, error: sectionsError } = await supabase
      .from(DB_TABLES.TEMPLATE_SECTIONS)
      .select(`
        *,
        ${DB_TABLES.TEMPLATE_ACTIVITIES}(*)
      `)
      .eq(DB_FIELDS.TEMPLATE_SECTIONS.TEMPLATE_ID, template.id)
      .order(DB_FIELDS.TEMPLATE_SECTIONS.POSITION, { ascending: true })
      .order(DB_FIELDS.TEMPLATE_SECTIONS.DAY_NUMBER, { ascending: true });
    
    if (sectionsError) {
      console.error('[Template API] Error fetching template sections:', {
        error: sectionsError,
        templateId: template.id,
        code: sectionsError.code,
        details: sectionsError.details
      });
      return NextResponse.json({ 
        error: `Failed to fetch template sections: ${sectionsError.message}` 
      }, { status: 500 });
    }
    
    // Process sections and activities
    const processedSections = sections?.map(section => {
      // Ensure activities are properly typed and ordered
      const activities = section.template_activities || [];
      return {
        ...section,
        activities: activities.sort((a, b) => (a.position || 0) - (b.position || 0))
      };
    }) || [];

    console.log(`[Template API] Successfully fetched ${processedSections.length} sections for template "${template.id}"`);
    
    // Increment view count
    const { error: viewError } = await supabase
      .from(DB_TABLES.ITINERARY_TEMPLATES)
      .update({ view_count: (template.view_count || 0) + 1 })
      .eq('id', template.id);

    if (viewError) {
      console.warn('[Template API] Failed to increment view count:', {
        error: viewError,
        templateId: template.id
      });
      // Non-critical error, don't return error response
    }
    
    return NextResponse.json({
      data: {
        ...template,
        sections: processedSections
      }
    });
    
  } catch (error) {
    console.error('[Template API] Unexpected error processing template request:', {
      error,
      slug,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve itinerary due to an unexpected error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (!userData?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const slug = params.slug

    // Update the itinerary template
    const { data, error } = await supabase.from("itinerary_templates").update(body).eq("slug", slug).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string
  );

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin or the creator
  const { data: template } = await supabase
    .from("itinerary_templates")
    .select("created_by")
    .eq("slug", params.slug)
    .single()

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  const { data: userData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

  if (template.created_by !== user.id && !userData?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Delete the itinerary template
  const { error } = await supabase.from("itinerary_templates").delete().eq("slug", params.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
