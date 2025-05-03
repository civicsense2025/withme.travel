import { NextRequest, NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import {
  createSuccessResponse,
  createErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  handleRouteError,
  HTTP_STATUS,
} from '@/utils/api-response';

interface Template {
  id: string;
  view_count: number;
  slug: string;
  created_by: string;
  // Other template properties
}

interface Activity {
  position: number | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const supabase = await createRouteHandlerClient();

    console.log(`[Template API] Fetching template with slug: "${slug}"`);

    const { data: template, error: templateError } = await supabase
      .from('itinerary_templates')
      .select(
        `
        *,
        destinations(*),
        creator:profiles(id, name, avatar_url)
      `
      )
      .eq('slug', slug)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        console.warn(`[Template API] Template not found for slug: "${slug}"`);
        return createNotFoundResponse('Itinerary template', slug);
      }

      console.error('[Template API] Error fetching itinerary template:', {
        error: templateError,
        slug,
      });

      return createErrorResponse(
        `Failed to fetch template: ${templateError.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        templateError
      );
    }

    if (!template) {
      console.warn(
        `[Template API] No template found for slug: "${slug}" (no error but empty result)`
      );
      return createNotFoundResponse('Itinerary template', slug);
    }

    console.log(`[Template API] Found template with ID: "${template.id}"`);

    const { data: sections, error: sectionsError } = await supabase
      .from('itinerary_template_sections')
      .select(
        `
        *,
        template_activities(*)
      `
      )
      .eq('template_id', template.id)
      .order('position', { ascending: true })
      .order('day_number', { ascending: true });

    if (sectionsError) {
      console.error('[Template API] Error fetching template sections:', {
        error: sectionsError,
        templateId: template.id,
      });

      return createErrorResponse(
        `Failed to fetch template sections: ${sectionsError.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        sectionsError
      );
    }

    const processedSections =
      sections?.map((section) => ({
        ...section,
        activities: (section.template_activities || []).sort(
          (a: Activity, b: Activity) => (a.position || 0) - (b.position || 0)
        ),
      })) || [];

    console.log(
      `[Template API] Successfully fetched ${processedSections.length} sections for template ${template.id}`
    );

    const { error: viewError } = await supabase
      .from('itinerary_templates')
      .update({ view_count: (template.view_count || 0) + 1 })
      .eq('id', template.id);

    if (viewError) {
      console.warn('[Template API] Failed to increment view count:', {
        error: viewError,
        templateId: template.id,
      });
    }

    return createSuccessResponse({
      ...template,
      sections: processedSections,
    });
  } catch (error) {
    console.error('[Template API] Unexpected error processing template request:', error);
    return handleRouteError(error, 'Failed to retrieve itinerary due to an unexpected error');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const supabase = await createRouteHandlerClient();

    // Authenticate the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Handle potential auth error
    if (authError) {
      return createErrorResponse(
        `Authentication failed: ${authError.message}`,
        HTTP_STATUS.UNAUTHORIZED,
        authError
      );
    }

    if (!user) {
      return createUnauthorizedResponse();
    }

    // Check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError) {
      return createErrorResponse(
        'Failed to verify user permissions',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        userError
      );
    }
    
    if (!userData?.is_admin) {
      return createForbiddenResponse('Only administrators can modify itinerary templates');
    }

    // Update the template
    const body = await request.json();
    const { data, error } = await supabase
      .from('itinerary_templates')
      .update(body)
      .eq('slug', slug)
      .select();

    if (error) {
      return createErrorResponse(
        `Failed to update template: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error
      );
    }

    if (!data || data.length === 0) {
      return createNotFoundResponse('Itinerary template', slug);
    }

    return createSuccessResponse(data[0], HTTP_STATUS.OK, 'Template updated successfully');
  } catch (error) {
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid request body', HTTP_STATUS.BAD_REQUEST);
    }
    return handleRouteError(error, 'Failed to update itinerary due to an unexpected error');
  }
}