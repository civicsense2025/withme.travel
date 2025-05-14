import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * Get aggregated stats for a specific country
 */
export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const supabase = await createRouteHandlerClient();
    const countryName = decodeURIComponent(params.name);

    // Get sample destination to extract common properties
    const { data: sampleData, error: sampleError } = await supabase
      .from('destinations')
      .select('local_language, visa_required, lgbtq_friendliness, accessibility')
      .eq('country', countryName)
      .limit(1)
      .single();

    if (sampleError && sampleError.code !== 'PGRST116') {
      console.error('Error fetching sample destination data:', sampleError);
    }

    // Get aggregated stats
    const { data: statsData, error: statsError } = await supabase
      .from('destinations')
      .select('*')
      .eq('country', countryName);

    if (statsError) {
      console.error('Error fetching country stats:', statsError);
      return NextResponse.json({ error: 'Failed to load country statistics' }, { status: 500 });
    }

    // Calculate aggregated metrics
    const stats = {
      destinations_count: statsData.length,
      avg_safety_rating: calculateAverage(statsData, 'safety_rating'),
      avg_cost_per_day: calculateAverage(statsData, 'avg_cost_per_day'),
      // Add sample data properties if available
      ...(sampleData || {}),
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error in country stats endpoint:', error);
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
