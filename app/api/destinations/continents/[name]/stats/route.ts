import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * Get aggregated stats for a specific continent
 */
export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const supabase = await createRouteHandlerClient();
    const continentName = decodeURIComponent(params.name);

    // Get all destinations in this continent
    const { data: destinationsData, error: destinationsError } = await supabase
      .from('destinations')
      .select('*')
      .eq('continent', continentName);

    if (destinationsError) {
      console.error('Error fetching continent destinations:', destinationsError);
      return NextResponse.json({ error: 'Failed to load continent statistics' }, { status: 500 });
    }

    // Get a list of unique countries in this continent
    const countries = [...new Set(destinationsData.map((dest) => dest.country))];

    // Get any existing continent metadata
    const { data: continentData, error: continentError } = await supabase
      .from('continent_metadata') // Assuming you have a table for continent metadata
      .select('description, recommended_currencies, high_season, time_zone_offset')
      .eq('name', continentName)
      .limit(1)
      .single();

    if (continentError && continentError.code !== 'PGRST116') {
      console.error('Error fetching continent metadata:', continentError);
    }

    // Calculate aggregated metrics
    const stats = {
      destinations_count: destinationsData.length,
      countries_count: countries.length,
      avg_cost_per_day: calculateAverage(destinationsData, 'avg_cost_per_day'),
      // Add any continent metadata if available
      ...(continentData || {}),
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error in continent stats endpoint:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to calculate average for a numeric property
 */
function calculateAverage(data: any[], property: string): number | null {
  if (!data || data.length === 0) return null;

  const validValues = data
    .map((item) => item[property])
    .filter((val): val is number => typeof val === 'number' && !isNaN(val));

  if (validValues.length === 0) return null;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / validValues.length).toFixed(2));
}
