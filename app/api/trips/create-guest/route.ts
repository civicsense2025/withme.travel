import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ITINERARY_CATEGORIES, TRIP_ROLES } from '@/utils/constants/status';
import chalk from 'chalk';
import { randomBytes } from 'crypto';

// Define table names directly as string constants
const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  USERS: 'users',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_SECTIONS: 'itinerary_sections',
  CITIES: 'cities',
};

const LOG_PREFIX = '[Guest Trip Create API]';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log(chalk.blue(`${LOG_PREFIX} Processing request...`));

  const supabase = await createRouteHandlerClient();
  console.log(chalk.dim(`${LOG_PREFIX} Created route handler client`));

  // Admin client using service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      chalk.red(
        `${LOG_PREFIX} Supabase URL or Service Role Key missing from environment variables.`
      )
    );
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  console.log(chalk.dim(`${LOG_PREFIX} Created admin client`));

  try {
    // Parse request body
    const requestData = await request.json();
    const { destination } = requestData;

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    console.log(chalk.dim(`${LOG_PREFIX} Looking up city: ${destination}`));

    // Find or create city in the cities table (not destinations)
    const { data: cities, error: cityError } = await supabaseAdmin
      .from(TABLES.CITIES)
      .select('id, name, country')
      .ilike('name', `%${destination}%`)
      .limit(1);

    if (cityError) {
      console.error(chalk.red(`${LOG_PREFIX} Error finding city:`), cityError);
      return NextResponse.json({ error: 'Failed to find city' }, { status: 500 });
    }

    let cityId;
    let cityName = destination;
    let countryName = '';

    if (cities && cities.length > 0) {
      // Use existing city
      cityId = cities[0].id;
      cityName = cities[0].name;
      countryName = cities[0].country || '';
      console.log(chalk.green(`${LOG_PREFIX} Found city: ${cityName} (${cityId})`));
    } else {
      // Create a new city entry
      console.log(chalk.yellow(`${LOG_PREFIX} City not found, creating new entry...`));
      const { data: newCity, error: createCityError } = await supabaseAdmin
        .from(TABLES.CITIES)
        .insert([{ name: destination }])
        .select()
        .single();

      if (createCityError || !newCity) {
        console.error(chalk.red(`${LOG_PREFIX} Error creating city:`), createCityError);
        return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
      }

      cityId = newCity.id;
      console.log(chalk.green(`${LOG_PREFIX} Created new city with ID: ${cityId}`));
    }

    // Create a guest user ID if not authenticated
    let userId;
    let isGuest = false;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Authenticated user
      userId = user.id;
      console.log(chalk.green(`${LOG_PREFIX} Using authenticated user: ${userId}`));
    } else {
      // Generate a unique guest ID
      isGuest = true;
      userId = `guest_${randomBytes(16).toString('hex')}`;
      console.log(chalk.yellow(`${LOG_PREFIX} Created guest user ID: ${userId}`));
    }

    // Set default trip dates and duration
    const today = new Date();
    const daysToAdd = 7; // Default trip length
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToAdd - 1);

    const formattedStartDate = today.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // 1. Create the trip
    console.log(chalk.dim(`${LOG_PREFIX} Creating trip...`));
    const tripTitle = `Trip to ${cityName}${countryName ? `, ${countryName}` : ''}`;
    
    const tripData = {
      name: tripTitle,
      description: `Explore ${cityName}${countryName ? ` in ${countryName}` : ''}`,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      created_by: userId,
      city_id: cityId, // Use city_id instead of destination_id
      duration_days: daysToAdd,
      privacy_setting: 'private',
      is_guest_trip: isGuest,
    };

    const { data: newTrip, error: tripError } = await supabaseAdmin
      .from(TABLES.TRIPS)
      .insert([tripData])
      .select()
      .single();

    if (tripError || !newTrip) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip:`), tripError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    const newTripId = newTrip.id;
    console.log(chalk.green(`${LOG_PREFIX} Trip created with ID: ${newTripId}`));

    // 2. Add user as admin member
    console.log(chalk.dim(`${LOG_PREFIX} Adding user as admin...`));
    const memberData = {
      trip_id: newTripId,
      user_id: userId,
      role: TRIP_ROLES.ADMIN,
      joined_at: new Date().toISOString(),
      is_guest: isGuest,
    };

    const { error: memberError } = await supabaseAdmin
      .from(TABLES.TRIP_MEMBERS)
      .insert([memberData]);

    if (memberError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error adding admin member:`), memberError);
      // Continue anyway - this is not fatal
    }

    // 3. Create itinerary sections for each day
    console.log(chalk.dim(`${LOG_PREFIX} Creating itinerary sections...`));
    const sections = [];

    for (let i = 1; i <= daysToAdd; i++) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + i - 1);
      
      sections.push({
        trip_id: newTripId,
        day_number: i,
        position: i,
        date: dayDate.toISOString().split('T')[0],
      });
    }

    if (sections.length > 0) {
      const { error: sectionsError } = await supabaseAdmin
        .from(TABLES.ITINERARY_SECTIONS)
        .insert(sections);

      if (sectionsError) {
        console.error(
          chalk.yellow(`${LOG_PREFIX} Error creating itinerary sections:`),
          sectionsError
        );
        // Continue anyway - this is not fatal
      }
    }

    // 4. Create default accommodation and transportation items
    console.log(
      chalk.dim(`${LOG_PREFIX} Creating default items...`)
    );
    const defaultItems = [
      {
        trip_id: newTripId,
        title: `Accommodation in ${cityName}`,
        day_number: 1, // First day
        position: 0,
        category: ITINERARY_CATEGORIES.ACCOMMODATIONS,
        description: 'Where will you be staying?',
      },
      {
        trip_id: newTripId,
        title: `Transportation to ${cityName}`,
        day_number: 1, // First day
        position: 1,
        category: ITINERARY_CATEGORIES.TRANSPORTATION,
        description: 'How will you get there?',
      },
      {
        trip_id: newTripId,
        title: `Explore ${cityName}`,
        day_number: 2, // Second day
        position: 0,
        category: ITINERARY_CATEGORIES.ICONIC_LANDMARKS,
        description: `Check out the popular sights in ${cityName}`,
      },
      {
        trip_id: newTripId,
        title: `Dinner in ${cityName}`,
        day_number: 2, // Second day
        position: 1,
        category: ITINERARY_CATEGORIES.FOOD_AND_DRINK,
        description: 'Try local cuisine',
      },
    ];

    const { error: itemsError } = await supabaseAdmin
      .from(TABLES.ITINERARY_ITEMS)
      .insert(defaultItems);

    if (itemsError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error creating default items:`), itemsError);
      // Continue anyway - this is not fatal
    } else {
      console.log(chalk.green(`${LOG_PREFIX} Created default itinerary items`));
    }

    // Store trip info in a cookie for guest users
    if (isGuest) {
      // We'll implement guest tracking if needed
      console.log(chalk.yellow(`${LOG_PREFIX} Guest trip created, tracking info might be needed`));
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Trip created successfully',
      tripId: newTripId,
      isGuest,
    });
  } catch (error: any) {
    console.error(chalk.red(`${LOG_PREFIX} Unhandled error:`), error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 