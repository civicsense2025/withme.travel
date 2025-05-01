import { NextResponse, type NextRequest } from 'next/server';
import { createApiClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { DB_TABLES } from '@/utils/constants/database';

// Define the expected request body structure from Mapbox Geocoder
// Adjust based on the actual structure of Mapbox result properties
const lookupOrCreateSchema = z
  .object({
    mapbox_id: z.string().min(1), // Mapbox Feature ID (e.g., "poi.123...")
    name: z.string().min(1), // Place name (e.g., "Eiffel Tower", "Starbucks")
    address: z.string().optional().nullable(), // Formatted address
    latitude: z.number(),
    longitude: z.number(),
    context: z.array(z.any()).optional().nullable(),
  })
  .strict();

// Helper function to parse Mapbox context (example)
const parseContext = (context: any) => {
  let city: string | undefined;
  let region: string | undefined;
  let country: string | undefined;
  let postcode: string | undefined;

  if (Array.isArray(context)) {
    context.forEach((item: any) => {
      if (item.id?.startsWith('place')) city = item.text;
      if (item.id?.startsWith('region')) region = item.text;
      if (item.id?.startsWith('country')) country = item.text;
      if (item.id?.startsWith('postcode')) postcode = item.text;
    });
  }
  // Add logic for other context structures if needed

  // You might need a mapping from country code/name to continent
  const continent = 'Unknown'; // Placeholder - Implement continent mapping

  return { city, region, country, postcode, continent };
};

export async function POST(request: NextRequest) {
  const supabase = await createApiClient();

  // 1. Authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Lookup/Create Destination Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and Validate Body
  let validatedData;
  try {
    const body = await request.json();
    // Log the received body before validation
    console.log(
      '[/api/destinations/lookup-or-create] Received body:',
      JSON.stringify(body, null, 2)
    );

    const result = lookupOrCreateSchema.safeParse(body);
    if (!result.success) {
      console.error('Lookup/Create Destination Validation Error:', result.error.issues);
      return NextResponse.json(
        { error: 'Invalid input', issues: result.error.issues },
        { status: 400 }
      );
    }
    validatedData = result.data;
  } catch (e) {
    console.error('Lookup/Create Destination Body Parse Error:', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { mapbox_id, name, address, latitude, longitude, context } = validatedData;

  try {
    // 3. Check by mapbox_id (Primary Key)
    console.log(`Checking destination by mapbox_id: ${mapbox_id}`);
    let { data: existingDest, error: selectError } = await supabase
      .from(DB_TABLES.DESTINATIONS)
      .select('id') // Only need the id
      .eq('mapbox_id', mapbox_id)
      .maybeSingle();

    if (selectError) {
      console.error('Supabase select error (mapbox_id):', selectError);
      throw new Error('Database error checking for existing destination.');
    }

    if (existingDest) {
      console.log(`Found existing destination by mapbox_id: ${existingDest.id}`);
      return NextResponse.json({ destination_id: existingDest.id });
    }

    // 4. Optional: Check by coordinates (as fallback or deduplication)
    // Note: Floating point comparisons can be tricky. Use a small tolerance.
    // const tolerance = 0.0001;
    // let { data: existingByCoords, error: coordError } = await supabase
    //     .from(DB_TABLES.DESTINATIONS)
    //     .select('id')
    //     .gte('latitude', latitude - tolerance)
    //     .lte('latitude', latitude + tolerance)
    //     .gte('longitude', longitude - tolerance)
    //     .lte('longitude', longitude + tolerance)
    //     .limit(1)
    //     .maybeSingle();
    // if (coordError) { ... handle error ... }
    // if (existingByCoords) { return NextResponse.json({ destination_id: existingByCoords.id }); }

    // 5. Not found, Create New Destination
    console.log(`Destination not found for mapbox_id ${mapbox_id}. Creating new one.`);

    // Parse context to extract city, country, etc.
    // IMPORTANT: Implement robust context parsing based on Mapbox response structure
    const { city, region, country, postcode, continent } = parseContext(context);

    // Prepare data for insertion
    // Ensure these fields exist in your destinations table!
    const newDestinationData = {
      name: name, // Specific name from Mapbox result
      address: address, // Full address from Mapbox result
      latitude: latitude,
      longitude: longitude,
      mapbox_id: mapbox_id,
      city: city, // Parsed from context
      state_province: region, // Parsed from context
      country: country, // Parsed from context
      continent: continent, // Implement mapping or use default
      // Remove fields not explicitly added by migration or managed by DB defaults
      // image_url: null,
      // description: null,
      // is_featured: false,
      // slug: `${city?.toLowerCase().replace(/ /g, '-')}-${country?.toLowerCase().replace(/ /g, '-')}-${Date.now()}` // Remove slug generation here
    };

    console.log('Attempting to insert destination data:', newDestinationData);

    const { data: insertedDest, error: insertError } = await supabase
      .from(DB_TABLES.DESTINATIONS)
      .insert(newDestinationData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Handle potential race conditions if needed (similar to places lookup)
      if (insertError.code === '23505') {
        // Unique constraint violation (likely mapbox_id)
        console.warn(`Race condition detected for mapbox_id: ${mapbox_id}. Refetching.`);
        const { data: raceDest, error: raceError } = await supabase
          .from(DB_TABLES.DESTINATIONS)
          .select('id')
          .eq('mapbox_id', mapbox_id)
          .single();
        if (raceError || !raceDest) {
          console.error('Error refetching destination after race condition:', raceError);
          throw new Error('Database error resolving race condition.');
        }
        return NextResponse.json({ destination_id: raceDest.id });
      }
      throw new Error('Database error creating new destination.');
    }

    if (!insertedDest) {
      throw new Error('Failed to retrieve ID after inserting destination.');
    }

    console.log(`Created new destination: ${insertedDest.id}`);
    return NextResponse.json({ destination_id: insertedDest.id }, { status: 201 });
  } catch (error: any) {
    console.error('Error in lookup-or-create destination:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
