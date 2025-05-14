import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ITINERARY_CATEGORIES, TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/tables';
import chalk from 'chalk';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const LOG_PREFIX = '[Guest Trip Create API]';

// Helper function to generate a valid UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Upserts a real user profile in the 'profiles' table with the correct id (matching auth.users.id)
 */
async function upsertRealUserProfile(supabaseAdmin: any, user: any) {
  if (!user?.id) throw new Error('No user id');
  return supabaseAdmin.from(TABLES.PROFILES).upsert([
    {
      id: user.id,
      name: user.user_metadata?.full_name ?? 'User',
      avatar_url: user.user_metadata?.avatar_url ?? null,
      is_guest: false,
    },
  ]);
}

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
    const { destination, customName } = requestData;

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    console.log(chalk.dim(`${LOG_PREFIX} Looking up city: ${destination}`));

    // Find or create city in the cities table
    const { data: cities, error: cityError } = await supabaseAdmin
      .from('cities')
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
        .from('cities')
        .insert([{ name: destination }])
        .select()
        .single();

      if (createCityError || !newCity) {
        console.error(chalk.red(`${LOG_PREFIX} Error creating city:`), createCityError);
        return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
      }

      cityId = newCity.id;
      cityName = newCity.name || destination;
      console.log(chalk.green(`${LOG_PREFIX} Created new city with ID: ${cityId}`));
    }

    // Handle user identification
    let userId;
    let guestToken = null;
    let isGuest = false;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Authenticated user
      userId = user.id;
      console.log(chalk.green(`${LOG_PREFIX} Using authenticated user: ${userId}`));
    } else {
      // Generate a valid UUID for the created_by field
      userId = generateUUID();

      // Get existing guest token from cookie or generate a new one
      const cookieStore = await cookies();
      guestToken = cookieStore.get('guest_user_id')?.value;

      if (!guestToken) {
        // Generate a unique guest token if not found in cookies
        guestToken = `guest_${randomBytes(16).toString('hex')}`;

        // Set cookie with the guest token (1 year expiry)
        cookieStore.set('guest_user_id', guestToken, {
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          path: '/',
        });
      }

      console.log(
        chalk.yellow(`${LOG_PREFIX} Using guest token: ${guestToken} with UUID: ${userId}`)
      );
      isGuest = true;
    }

    if (isGuest) {
      // Check if guest profile already exists
      const { data: existingProfile } = await supabaseAdmin
        .from(TABLES.PROFILES)
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        const { error: insertProfileError } = await supabaseAdmin
          .from(TABLES.PROFILES)
          .insert([
            {
              id: userId,
              name: 'Guest',
              is_guest: true,
            },
          ]);
        if (insertProfileError) {
          console.error(
            chalk.red(`${LOG_PREFIX} Error inserting guest profile:`),
            insertProfileError
          );
          return NextResponse.json({ error: 'Failed to create guest profile' }, { status: 500 });
        } else {
          console.log(chalk.green(`${LOG_PREFIX} Inserted guest profile row for: ${userId}`));
        }
      } else {
        console.log(chalk.dim(`${LOG_PREFIX} Guest profile already exists: ${userId}`));
      }
    } else {
      // Real user: upsert their profile before creating the trip
      await upsertRealUserProfile(supabaseAdmin, user);
    }

    // Set default trip dates and duration
    const today = new Date();
    const daysToAdd = 7; // Default trip length
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToAdd - 1);

    const formattedStartDate = today.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    // 1. Create the trip using the city_id directly
    console.log(chalk.dim(`${LOG_PREFIX} Creating trip...`));
    // Use customName if provided, otherwise use the standard format
    const tripTitle =
      customName || `New trip to ${cityName}${countryName ? `, ${countryName}` : ''}`;

    // Update the tripData structure - make sure guest_token is not being assigned to a UUID field
    const tripData = {
      name: tripTitle,
      description: `Explore ${cityName}${countryName ? ` in ${countryName}` : ''}`,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      created_by: userId, // This should be a valid UUID
      city_id: cityId, // This should be a valid UUID
      destination_name: cityName, // String field
      duration_days: daysToAdd,
      privacy_setting: 'private',
      // Store guest token in a dedicated TEXT field, not in any UUID field
      ...(isGuest ? { is_guest: true } : {}), // Remove guest_token from the trips table if causing issues
    };

    console.log(
      chalk.blue(`${LOG_PREFIX} Creating trip with data:`),
      JSON.stringify({
        ...tripData,
        created_by: `UUID ${tripData.created_by.substring(0, 8)}...`, // Log partial UUID for privacy
      })
    );

    let { data: newTrip, error: tripError } = await supabaseAdmin
      .from(TABLES.TRIPS)
      .insert([tripData])
      .select()
      .single();

    if (tripError || !newTrip) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip:`), tripError);

      // If there's a UUID format error, let's try a modified approach by analyzing the error
      if (
        tripError?.code === '22P02' &&
        tripError?.message?.includes('invalid input syntax for type uuid')
      ) {
        console.log(
          chalk.yellow(`${LOG_PREFIX} Detected UUID syntax error, attempting modified insertion...`)
        );

        // Check the table structure to understand which field is causing the issue
        // For now, create a simpler version of the tripData without any potentially problematic fields
        const simplifiedTripData = {
          name: tripTitle,
          description: `Explore ${cityName}${countryName ? ` in ${countryName}` : ''}`,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          created_by: userId, // This must be a valid UUID
          destination_name: cityName,
        };

        console.log(
          chalk.dim(
            `${LOG_PREFIX} Retrying with simplified data:`,
            JSON.stringify({
              ...simplifiedTripData,
              created_by: `UUID ${simplifiedTripData.created_by.substring(0, 8)}...`,
            })
          )
        );

        const { data: retryTrip, error: retryError } = await supabaseAdmin
          .from(TABLES.TRIPS)
          .insert([simplifiedTripData])
          .select()
          .single();

        if (retryError) {
          console.error(chalk.red(`${LOG_PREFIX} Retry insertion also failed:`), retryError);
          return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
        }

        console.log(chalk.green(`${LOG_PREFIX} Retry insertion succeeded!`));
        // Update newTrip reference to use the retry results
        newTrip = retryTrip;
      } else {
        return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
      }
    }

    const newTripId = newTrip.id;
    console.log(chalk.green(`${LOG_PREFIX} Trip created with ID: ${newTripId}`));

    // Store guest token in a dedicated way if needed
    if (isGuest && guestToken) {
      console.log(chalk.dim(`${LOG_PREFIX} Storing guest token association...`));

      try {
        // Option 1: Try to update the trip with guest_token if the column exists
        const { error: updateError } = await supabaseAdmin
          .from(TABLES.TRIPS)
          .update({ guest_token_text: guestToken }) // Use a text field name that won't conflict with UUID columns
          .eq('id', newTripId);

        if (updateError) {
          console.log(
            chalk.yellow(
              `${LOG_PREFIX} Could not update trip with guest token: ${updateError.message}`
            )
          );

          // Option 2: Store in guest_tokens table if it exists
          console.log(chalk.dim(`${LOG_PREFIX} Trying to store in guest_tokens table...`));
          const { error: tokenError } = await supabaseAdmin.from('guest_tokens').insert([
            {
              trip_id: newTripId,
              user_id: userId,
              token: guestToken,
              created_at: new Date().toISOString(),
            },
          ]);

          if (tokenError) {
            console.log(
              chalk.yellow(`${LOG_PREFIX} Could not store in guest_tokens: ${tokenError.message}`)
            );
            // This is non-fatal, we'll still allow the trip to be created
          } else {
            console.log(
              chalk.green(`${LOG_PREFIX} Guest token association stored in guest_tokens table`)
            );
          }
        } else {
          console.log(chalk.green(`${LOG_PREFIX} Guest token association stored in trips table`));
        }
      } catch (error) {
        console.log(chalk.yellow(`${LOG_PREFIX} Error storing guest token association:`, error));
        // Non-fatal error
      }
    }

    // 2. Add user as admin member
    console.log(chalk.dim(`${LOG_PREFIX} Adding user as admin...`));
    const memberData = {
      trip_id: newTripId,
      user_id: userId,
      role: TRIP_ROLES.ADMIN,
      joined_at: new Date().toISOString(),
      // Only include is_guest if it's a guest user
      ...(isGuest ? { is_guest: true } : {}),
    };

    console.log(
      chalk.dim(
        `${LOG_PREFIX} Member data:`,
        JSON.stringify({
          ...memberData,
          user_id: `UUID ${userId.substring(0, 8)}...`,
        })
      )
    );

    const { error: memberError } = await supabaseAdmin
      .from(TABLES.TRIP_MEMBERS)
      .insert([memberData]);

    if (memberError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error adding admin member:`), memberError);

      // If there's a schema error with the trip_members table, it might be expecting
      // a different field structure. Try again with a more limited set of fields.
      if (memberError.code === '22P02') {
        console.log(
          chalk.yellow(`${LOG_PREFIX} Attempting fallback insertion without guest_token...`)
        );
        const fallbackMemberData = {
          trip_id: newTripId,
          user_id: userId,
          role: TRIP_ROLES.ADMIN,
          joined_at: new Date().toISOString(),
          is_guest: isGuest || false,
        };

        const { error: fallbackError } = await supabaseAdmin
          .from(TABLES.TRIP_MEMBERS)
          .insert([fallbackMemberData]);

        if (fallbackError) {
          console.error(chalk.red(`${LOG_PREFIX} Fallback insertion also failed:`), fallbackError);
        } else {
          console.log(chalk.green(`${LOG_PREFIX} Fallback member insertion succeeded`));
        }
      }
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
    console.log(chalk.dim(`${LOG_PREFIX} Creating default items...`));
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
        description: `Try the local cuisine in ${cityName}`,
      },
    ];

    const { error: itemsError } = await supabaseAdmin
      .from(TABLES.ITINERARY_ITEMS)
      .insert(defaultItems);

    if (itemsError) {
      console.error(chalk.yellow(`${LOG_PREFIX} Error creating default items:`), itemsError);
      // Continue anyway - this is not fatal
    }

    // 5. Return success with the trip ID
    console.log(chalk.green(`${LOG_PREFIX} Successfully created trip: ${newTripId}`));

    // Store the guest ID in a cookie if it's a guest user
    if (isGuest && guestToken) {
      console.log(chalk.dim(`${LOG_PREFIX} Setting guest cookie...`));
      // Note: cookie is set earlier now when generating the token
    }

    return NextResponse.json({
      tripId: newTripId,
      isGuest,
      ...(isGuest ? { guestToken } : {}),
    });
  } catch (error) {
    console.error(chalk.red(`${LOG_PREFIX} Unexpected error:`), error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
