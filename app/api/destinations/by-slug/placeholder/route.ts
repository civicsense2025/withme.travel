import { NextRequest, NextResponse } from 'next/server';

/**
 * GET endpoint for a placeholder destination
 * This provides a fallback for invalid or missing destinations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Always return a valid placeholder destination
  return NextResponse.json({
    destination: {
      id: 'placeholder',
      name: 'Placeholder Destination',
      city: 'Example City',
      country: 'Example Country',
      continent: 'Example Continent',
      description: 'This is a placeholder for a destination that could not be found.',
      image_url: '/images/placeholder-destination.jpg',
      best_season: 'Any time',
      cuisine_rating: 3,
      cultural_attractions: 3,
      nightlife_rating: 3,
      outdoor_activities: 3,
      beach_quality: 3,
      safety_rating: 3,
      family_friendly: true,
      digital_nomad_friendly: 3,
      local_language: 'English',
      avg_cost_per_day: 100,
      walkability: 3,
      wifi_connectivity: 3,
      public_transportation: 3,
      eco_friendly_options: 3,
      time_zone: 'UTC',
      highlights: 'This is a placeholder destination with example highlights.',
      accessibility: 3,
      lgbtq_friendliness: 3,
      instagram_worthy_spots: 3,
      shopping_rating: 3,
      off_peak_appeal: 3,
      tourism_website: 'https://example.com',
    },
  });
}
