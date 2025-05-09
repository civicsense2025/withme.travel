import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch popular itineraries
    const { data: itineraries, error } = await supabase
      .from('itinerary_templates')
      .select(`
        *,
        author:created_by_profile (
          id,
          full_name,
          avatar_url
        ),
        destinations:itinerary_template_destinations (
          destination_id,
          name
        )
      `)
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching popular itineraries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch popular itineraries' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedItineraries = itineraries.map(itinerary => ({
      id: itinerary.id,
      title: itinerary.title,
      description: itinerary.description || '',
      image: itinerary.cover_image_url || '',
      location: itinerary.location || 'Various locations',
      duration: `${itinerary.duration_days} days`,
      tags: itinerary.tags || [],
      slug: itinerary.slug,
      is_published: itinerary.is_published,
      author: itinerary.author,
      destinations: itinerary.destinations || [],
      duration_days: itinerary.duration_days,
      category: itinerary.category || 'Itinerary',
      created_at: itinerary.created_at,
      view_count: itinerary.view_count || 0,
      use_count: itinerary.use_count || 0,
      like_count: itinerary.like_count || 0,
      featured: itinerary.featured || false,
      cover_image_url: itinerary.cover_image_url || '',
      groupsize: itinerary.groupsize || '1-4',
      metadata: itinerary.metadata || {}
    }));

    return NextResponse.json({ itineraries: transformedItineraries });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 