import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import { ItineraryTemplateMetadata } from '@/types/itinerary';

interface RouteParams {
  params: {
    slug: string;
  };
}

// --- Types ---
interface MetadataResponse {
  metadata: Record<string, unknown>;
  message?: string;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

/**
 * GET /api/itineraries/[slug]/metadata
 * Fetch metadata for an itinerary template
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Itinerary template slug is required' }, { status: 400 });
  }

  try {
    const supabase = await createRouteHandlerClient();

    // First get the template ID from the slug
    const { data: template, error: templateError } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .select('id, metadata')
      .eq('slug', slug)
      .single();

    if (templateError) {
      console.error('Error fetching itinerary template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    return NextResponse.json({ metadata: template?.metadata || {} });
  } catch (error) {
    console.error('Exception fetching itinerary template metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

/**
 * PATCH /api/itineraries/[slug]/metadata
 * Update metadata for an itinerary template
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Itinerary template slug is required' }, { status: 400 });
  }

  try {
    const supabase = await createRouteHandlerClient();

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const metadata = body.metadata as Partial<ItineraryTemplateMetadata>;

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json({ error: 'Invalid metadata format' }, { status: 400 });
    }

    // Get the template data using the slug
    const { data: templateData, error: templateError } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .select('id, created_by, metadata')
      .eq('slug', slug)
      .single();

    if (templateError) {
      console.error('Error fetching itinerary template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    // Check if user is the creator of the template or an admin
    const isCreator = templateData.created_by === session.user.id;

    // TODO: Add admin check logic if needed
    const isAdmin = false;

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this template' },
        { status: 403 }
      );
    }

    // Merge existing metadata with new metadata
    const currentMetadata =
      typeof templateData.metadata === 'object' && templateData.metadata !== null
        ? templateData.metadata
        : {};
    const safeMetadata = typeof metadata === 'object' && metadata !== null ? metadata : {};
    const updatedMetadata = { ...currentMetadata, ...safeMetadata };

    // Update the metadata using the template ID
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_TEMPLATES)
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateData.id)
      .select('metadata');

    if (error) {
      console.error('Error updating itinerary template metadata:', error);
      return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
    }

    return NextResponse.json({
      metadata: data[0]?.metadata || updatedMetadata,
      message: 'Metadata updated successfully',
    });
  } catch (error) {
    console.error('Exception updating itinerary template metadata:', error);
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 });
  }
}
