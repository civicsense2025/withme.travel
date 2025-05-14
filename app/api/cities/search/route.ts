import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

// Define the table name for cities
const CITIES_TABLE = 'cities'; // Use the actual cities table

export async function GET(request: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const limit = Number(url.searchParams.get('limit')) || 15;
  const countryLimit = Number(url.searchParams.get('countryLimit')) || 50; // Higher limit for country searches

  if (q.length < 2) {
    return NextResponse.json({
      cities: [],
    });
  }

  try {
    // Check if this is potentially a country search (exact match)
    const { data: countryMatch, error: countryError } = await supabase
      .from(CITIES_TABLE)
      .select('country')
      .ilike('country', q)
      .limit(1);

    const isCountrySearch = countryMatch && countryMatch.length > 0;
    const searchLimit = isCountrySearch ? countryLimit : limit;

    // Search cities by name, city_ascii, or country with fuzzy matching
    const { data: cities, error } = await supabase
      .from(CITIES_TABLE)
      .select(
        `
        id, 
        name, 
        country, 
        state_province, 
        continent, 
        latitude, 
        longitude, 
        city_ascii, 
        iso2, 
        iso3, 
        admin_name, 
        capital
      `
      )
      .or(`name.ilike.%${q}%,city_ascii.ilike.%${q}%,country.ilike.%${q}%`)
      .limit(searchLimit);

    if (error) {
      console.error('Error searching cities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check which cities are destinations (if we have destinations table)
    let destinationCities = new Set<string>();
    try {
      const { data: destinations } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('city')
        .or(`city.ilike.%${q}%`);

      if (destinations && destinations.length > 0) {
        destinationCities = new Set(destinations.map((d) => d.city?.toLowerCase()).filter(Boolean));
      }
    } catch (destError) {
      console.error('Error checking destinations:', destError);
      // Continue without destination data
    }

    // Mark cities that are also destinations
    const results = cities.map((city) => ({
      ...city,
      is_destination: destinationCities.has(city.name?.toLowerCase() || ''),
      is_country_search: isCountrySearch,
    }));

    return NextResponse.json({
      cities: results,
      is_country_search: isCountrySearch,
      country_name: isCountrySearch && countryMatch?.[0]?.country,
    });
  } catch (error) {
    console.error('Unexpected error in cities search:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
