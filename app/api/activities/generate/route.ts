import { NextResponse } from 'next/server';
import { extractKeywords, generateActivityIdeas } from '@/utils/activity-generator';
import { createRouteHandlerClient } from '@/utils/supabase/server';

interface TemplateData {
  items: any[];
}

export async function POST(req: Request) {
  try {
    const { destinationId, tripId } = await req.json();

    if (!destinationId) {
      return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
    }

    // Get destination data
    const supabase = await createRouteHandlerClient();
    const { data: destination, error: destinationError } = await supabase
      .from('destinations')
      .select('name, description')
      .eq('id', destinationId)
      .single();

    if (destinationError || !destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // Try to get template data if available
    const { data: tripTemplate, error: templateError } = await supabase
      .from('itinerary_templates')
      .select('items')
      .eq('destination_id', destinationId)
      .single();

    // Extract keywords from destination description
    const keywords = extractKeywords(destination.description || '');

    // Safely access template items
    let templateItems: any[] = [];
    if (tripTemplate && !templateError && 'items' in tripTemplate) {
      templateItems = (tripTemplate.items as any[]) || [];
    }

    // Generate activity ideas based on keywords and template (if available)
    const activities = generateActivityIdeas(
      destination.name || '',
      keywords,
      templateItems,
      10 // Generate 10 activity ideas
    );

    return NextResponse.json({
      activities,
      destination: {
        id: destinationId,
        name: destination.name,
      },
      keywords,
      count: activities.length,
    });
  } catch (error) {
    console.error('Error generating activities:', error);
    return NextResponse.json({ error: 'Failed to generate activities' }, { status: 500 });
  }
}
