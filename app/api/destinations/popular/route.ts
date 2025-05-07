import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase
    .from(TABLES.DESTINATIONS)
    .select(`
      id, 
      name, 
      city, 
      country, 
      continent, 
      description, 
      emoji, 
      image_url, 
      byline, 
      highlights, 
      slug, 
      popularity,
      cuisine_rating,
      nightlife_rating,
      cultural_attractions,
      outdoor_activities,
      beach_quality,
      safety_rating,
      best_season,
      avg_cost_per_day,
      image_metadata
    `)
    .order('popularity', { ascending: false })
    .limit(18);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ destinations: data });
} 