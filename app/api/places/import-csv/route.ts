import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { parse } from 'csv-parse/sync';
import type { PlaceCategory } from '@/types/places';
import { TABLES } from '@/utils/constants/tables';

// Define place schema for CSV import
interface PlaceImportData {
  name: string;
  description?: string;
  category?: PlaceCategory;
  address?: string;
  latitude?: number;
  longitude?: number;
  destination_id?: string;
  price_level?: number;
  rating?: number;
  website?: string;
  phone_number?: string;
}

/**
 * Validate and map a category string to a valid PlaceCategory
 */
function validateCategory(category?: string): PlaceCategory | undefined {
  if (!category) return undefined;

  const normalizedCategory = category.toLowerCase().trim();

  // Check valid categories based on PlaceCategory type
  const validCategories: PlaceCategory[] = [
    'attraction',
    'restaurant',
    'cafe',
    'hotel',
    'landmark',
    'shopping',
    'transport',
    'other',
  ];

  // Check if it's already a valid category
  if (validCategories.includes(normalizedCategory as PlaceCategory)) {
    return normalizedCategory as PlaceCategory;
  }

  // Map common variations
  if (
    ['restaurant', 'dining', 'food', 'eatery'].some((term) => normalizedCategory.includes(term))
  ) {
    return 'restaurant';
  }

  if (
    ['hotel', 'accommodation', 'lodging', 'stay'].some((term) => normalizedCategory.includes(term))
  ) {
    return 'hotel';
  }

  if (['cafe', 'coffee', 'bakery'].some((term) => normalizedCategory.includes(term))) {
    return 'cafe';
  }

  if (
    ['attraction', 'sight', 'point of interest'].some((term) => normalizedCategory.includes(term))
  ) {
    return 'attraction';
  }

  if (['landmark', 'monument', 'historic'].some((term) => normalizedCategory.includes(term))) {
    return 'landmark';
  }

  if (['shopping', 'store', 'mall', 'market'].some((term) => normalizedCategory.includes(term))) {
    return 'shopping';
  }

  if (
    ['transportation', 'transit', 'station', 'airport'].some((term) =>
      normalizedCategory.includes(term)
    )
  ) {
    return 'transport';
  }

  return 'other';
}

/**
 * API endpoint for importing places from CSV
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const destinationId = formData.get('destination_id') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Please upload a CSV file.',
        },
        { status: 400 }
      );
    }

    // Read and parse CSV content
    const fileContent = await file.text();

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid data found in the CSV file',
        },
        { status: 400 }
      );
    }

    // Process and validate records
    const validPlaces: PlaceImportData[] = [];
    const invalidRecords: { row: number; errors: string[] }[] = [];

    records.forEach((record, index) => {
      const errors: string[] = [];

      // Check required fields
      if (!record.name) {
        errors.push('Name is required');
      }

      // Validate and convert numeric fields
      let latitude: number | undefined;
      let longitude: number | undefined;
      let priceLevel: number | undefined;
      let rating: number | undefined;

      if (record.latitude) {
        const lat = parseFloat(record.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.push('Invalid latitude value (must be between -90 and 90)');
        } else {
          latitude = lat;
        }
      }

      if (record.longitude) {
        const lng = parseFloat(record.longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.push('Invalid longitude value (must be between -180 and 180)');
        } else {
          longitude = lng;
        }
      }

      if (record.price_level) {
        const price = parseInt(record.price_level);
        if (isNaN(price) || price < 1 || price > 5) {
          errors.push('Invalid price level (must be between 1 and 5)');
        } else {
          priceLevel = price;
        }
      }

      if (record.rating) {
        const rate = parseFloat(record.rating);
        if (isNaN(rate) || rate < 0 || rate > 5) {
          errors.push('Invalid rating (must be between 0 and 5)');
        } else {
          rating = rate;
        }
      }

      // If no errors, add to valid places
      if (errors.length === 0) {
        validPlaces.push({
          name: record.name,
          description: record.description || undefined,
          category: validateCategory(record.category),
          address: record.address || undefined,
          latitude,
          longitude,
          destination_id: destinationId,
          price_level: priceLevel,
          rating,
          website: record.website || undefined,
          phone_number: record.phone_number || undefined,
        });
      } else {
        invalidRecords.push({
          row: index + 2, // +2 because of 0-indexing and header row
          errors,
        });
      }
    });

    if (validPlaces.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid places found in the CSV file',
          invalidRecords,
        },
        { status: 400 }
      );
    }

    // Insert valid places into the database
    const placesToInsert = validPlaces.map((place) => ({
      name: place.name,
      description: place.description || null,
      category: place.category || 'other',
      address: place.address || null,
      latitude: place.latitude || null,
      longitude: place.longitude || null,
      destination_id: destinationId,
      price_level: place.price_level || null,
      rating: place.rating || null,
      rating_count: null,
      is_verified: false,
      suggested_by: user.id,
      source: 'csv_import',
      website: place.website || null,
      phone_number: place.phone_number || null,
    }));

    const { data: insertedPlaces, error: insertError } = await supabase
      .from(TABLES.PLACES)
      .insert(placesToInsert)
      .select('id, name');

    if (insertError) {
      console.error('Error inserting places:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to import places: ${insertError.message}`,
          invalidRecords,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedPlaces.length} places`,
      insertedPlaces,
      invalidRecords: invalidRecords.length > 0 ? invalidRecords : undefined,
    });
  } catch (error) {
    console.error('Error in CSV import:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: `CSV import failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
