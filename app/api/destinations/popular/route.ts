import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * GET endpoint to retrieve popular destinations
 *
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} Response with popular destinations
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const interests = searchParams.get('interests');
    const homeLocation = searchParams.get('homeLocation');
    
    const supabase = await createRouteHandlerClient();
    
    // Base query to get popular destinations
    let query = supabase
      .from(TABLES.DESTINATIONS)
      .select('id, name, slug, description, city, country, region, continent, emoji, image_url')
      .eq('is_active', true)
      .order('popularity_score', { ascending: false });
    
    // Apply interest filtering if provided
    if (interests) {
      const interestArray = interests.split(',').map(i => i.trim());
      if (interestArray.length > 0) {
        // Use the interests to find destinations with matching tags
        query = query.contains('tags', interestArray);
      }
    }
    
    // Apply region filtering based on home location if provided
    if (homeLocation) {
      // Find destinations in different regions than the home location
      // This is a simplified example - a real implementation might use
      // location proximity or more sophisticated matching
      query = query.neq('city', homeLocation);
    }
    
    // Limit results
    query = query.limit(12);
    
    const { data: destinations, error } = await query;
    
    if (error) {
      console.error('Error fetching popular destinations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transform data to include byline
    const formattedDestinations = destinations.map(dest => ({
      id: dest.id,
      name: dest.city || dest.name,
      slug: dest.slug,
      emoji: dest.emoji || '🌍',
      byline: dest.country || dest.region || dest.continent,
      image_url: dest.image_url,
      description: dest.description,
      // Generate sample highlights based on the destination
      highlights: generateHighlights(dest.name)
    }));
    
    return NextResponse.json({ 
      destinations: formattedDestinations 
    });
  } catch (error) {
    console.error('Error in popular destinations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular destinations' }, 
      { status: 500 }
    );
  }
}

/**
 * Generates random highlights for a destination
 * In a real app, these would come from the database
 */
function generateHighlights(destinationName: string): string[] {
  const allHighlights = [
    `Local cuisine and food experiences`,
    `Historical landmarks and museums`,
    `Outdoor activities and nature`,
    `Cultural experiences and festivals`,
    `Nightlife and entertainment`,
    `Shopping districts and markets`,
    `Architecture and urban design`,
    `Beaches and water activities`,
    `Parks and green spaces`,
    `Local art and music scene`,
    `Day trips to nearby attractions`,
    `Unique local traditions`
  ];
  
  // Select 3-5 random highlights
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...allHighlights].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
