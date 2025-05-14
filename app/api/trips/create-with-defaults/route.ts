import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import { ITINERARY_CATEGORIES, TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/tables';

const LOG_PREFIX = '[Trip Create API]';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log(chalk.blue(`${LOG_PREFIX} Processing request...`));

  const supabase = await createRouteHandlerClient();
  console.log(chalk.dim(`${LOG_PREFIX} Created route handler client`));

  // Admin client using service role key (ensure env vars are set)
  // Check if the environment variables are present
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
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(chalk.yellow(`${LOG_PREFIX} Auth error or no user found:`), authError?.message);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    // Parse request body
    const requestData = await request.json();
    const {
      title,
      description = '',
      start_date,
      end_date,
      destination_id,
      city_id = null,
      destination_name,
      cover_image_url = null,
      travelers_count = 1,
      privacy_setting = 'private',
      tags = [],
    } = requestData;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Trip name is required' }, { status: 400 });
    }

    if (!destination_id && !city_id) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    // Calculate duration days
    let durationDays = 7; // Default to 7 days if no dates provided
    if (start_date && end_date) {
      // Calculate based on provided dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    }

    // 1. Create the trip
    console.log(chalk.dim(`${LOG_PREFIX} Creating trip...`));
    const tripData = {
      name: title,
      description: description || '',
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: user.id,
      primary_city_id: city_id || destination_id,
      cover_image_url: cover_image_url,
      duration_days: durationDays,
      privacy_setting: privacy_setting,
    };

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert(tripData)
      .select('*')
      .single();

    if (tripError || !trip) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip:`), tripError);
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    const newTripId = trip.id;
    console.log(chalk.green(`${LOG_PREFIX} Trip created with ID: ${newTripId}`));

    // Insert into trip_cities for multi-city support
    const mainCityId = city_id || destination_id;
    if (mainCityId) {
      await supabase.from('trip_cities').insert({
        trip_id: newTripId,
        city_id: mainCityId,
        position: 1,
      });
    }

    // 2. Add creator as admin member
    console.log(chalk.dim(`${LOG_PREFIX} Adding creator as admin...`));
    const memberData = {
      trip_id: newTripId,
      user_id: user.id,
      role: TRIP_ROLES.ADMIN, // Use directly from status constants
      joined_at: new Date().toISOString(),
    };

    const { error: memberError } = await supabaseAdmin.from('trip_members').insert([memberData]);

    if (memberError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error adding admin member:`), memberError);
      // Continue anyway - this is not fatal
    }

    // 3. Create itinerary sections for each day
    console.log(chalk.dim(`${LOG_PREFIX} Creating itinerary sections...`));
    const sections = [];

    for (let i = 1; i <= durationDays; i++) {
      sections.push({
        trip_id: newTripId,
        day_number: i,
        position: i,
      });
    }

    if (sections.length > 0) {
      const { error: sectionsError } = await supabaseAdmin
        .from('itinerary_sections')
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
      chalk.dim(`${LOG_PREFIX} Creating default accommodation and transportation items...`)
    );
    const defaultItems = [
      {
        trip_id: newTripId,
        title: 'Add your accommodation',
        day_number: null, // Unscheduled
        position: 0,
        category: ITINERARY_CATEGORIES.ACCOMMODATIONS,
        description: 'Where will you be staying?',
        status: null,
      },
      {
        trip_id: newTripId,
        title: 'Add your transportation',
        day_number: null, // Unscheduled
        position: 1,
        category: ITINERARY_CATEGORIES.TRANSPORTATION,
        description: 'How will you get there?',
        status: null,
      },
    ];

    const { error: itemsError } = await supabaseAdmin.from('itinerary_items').insert(defaultItems);

    if (itemsError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error creating default items:`), itemsError);
      // Continue anyway - this is not fatal
    } else {
      console.log(
        chalk.green(`${LOG_PREFIX} Created default accommodation and transportation items`)
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Trip created successfully with default items',
      trip: {
        id: newTripId,
        title,
      },
    });
  } catch (error: any) {
    console.error(chalk.red(`${LOG_PREFIX} Unhandled error:`), error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
