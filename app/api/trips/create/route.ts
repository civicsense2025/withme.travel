import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import chalk from 'chalk';
import { TRIP_ROLES } from '@/utils/constants/status';
import { TABLES } from '@/utils/constants/tables';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Import from our types definition
import type { TripInsert } from '@/types/trips';
import type { Database } from '@/types/database.types';

// Log prefix for this file
const LOG_PREFIX = '[API][trip/create]';

export async function POST(request: NextRequest) {
  // Create Supabase client
  const supabase = await createRouteHandlerClient();

  // Get JSON data from request
  let data;
  try {
    data = await request.json();
  } catch (e) {
    console.error(chalk.red(`${LOG_PREFIX} Invalid JSON in request body`));
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Get data from request body
  const {
    name,
    description,
    budget,
    city_id,
    start_date,
    end_date,
    cover_image_url,
    privacy_setting,
  } = data;

  try {
    // Get auth session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Base trip data
    const tripData: TripInsert = {
      name,
      description,
      budget: budget ? budget.toString() : null,
      city_id,
      start_date,
      end_date,
      cover_image_url,
      privacy_setting,
      created_by: session?.user?.id || 'guest', // Default to guest if no user
    };

    // Create the trip record
    const { data: trip, error } = await supabase
      .from(TABLES.TRIPS)
      .insert(tripData)
      .select()
      .single();

    if (error) {
      console.error(chalk.red(`${LOG_PREFIX} Error creating trip:`), error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!trip) {
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
    }

    console.log(chalk.green(`${LOG_PREFIX} Trip created successfully`), trip.id);

    // Add a trip membership record for the creator (if authenticated)
    if (session?.user) {
      // Define membership data
      const memberData = {
        trip_id: trip.id,
        user_id: session.user.id,
        role: TRIP_ROLES.ADMIN,
      };

      // Insert into trip_members table
      const { error: memberError } = await supabase
        .from(TABLES.TRIP_MEMBERS)
        .insert(memberData);

      if (memberError) {
        console.error(chalk.red(`${LOG_PREFIX} Error adding trip member:`), memberError);
        // We'll still return success since the trip was created
      }
    }

    // Return the trip data
    return NextResponse.json({ trip });
  } catch (error: any) {
    console.error(chalk.red(`${LOG_PREFIX} Unexpected error:`), error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
