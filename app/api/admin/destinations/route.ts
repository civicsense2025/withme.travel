import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Helper function to check if user is an admin
 * @param supabaseClient The Supabase client instance
 * @returns Boolean indicating if the user is an admin
 */
async function isAdmin(supabaseClient: SupabaseClient<Database>): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return false;
    }
    
    const { data: profile, error: profileError } = await supabaseClient
      .from(DB_TABLES.PROFILES)
      .select(DB_FIELDS.PROFILES.IS_ADMIN)
      .eq(DB_FIELDS.PROFILES.ID, user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('[API Admin Check] Error fetching profile or profile not found:', profileError);
      return false;
    }
    
    return profile.is_admin === true;
  } catch (error) {
    console.error('[API Admin Check] Unexpected error:', error);
    return false;
  }
}

/**
 * Get all destinations (admin only)
 * @returns A JSON response with all destinations or error
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  const supabase = createClient();

  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin(supabase);
    if (!isUserAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized: Admin access required' 
      }, { status: 403 });
    }

    // Prepare query with proper field selection
    let query = supabase
      .from(DB_TABLES.DESTINATIONS)
      .select(`
        id,
        ${DB_FIELDS.DESTINATIONS.NAME},
        ${DB_FIELDS.DESTINATIONS.CITY},
        ${DB_FIELDS.DESTINATIONS.COUNTRY},
        ${DB_FIELDS.DESTINATIONS.REGION},
        ${DB_FIELDS.DESTINATIONS.DESCRIPTION},
        ${DB_FIELDS.DESTINATIONS.COVER_IMAGE_URL},
        ${DB_FIELDS.DESTINATIONS.CREATED_AT},
        ${DB_FIELDS.DESTINATIONS.UPDATED_AT},
        ${DB_FIELDS.DESTINATIONS.LATITUDE},
        ${DB_FIELDS.DESTINATIONS.LONGITUDE},
        trips:${DB_TABLES.TRIPS}(count)
      `)
      .order(DB_FIELDS.DESTINATIONS.CREATED_AT, { ascending: false });
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.or(`${DB_FIELDS.DESTINATIONS.NAME}.ilike.%${searchQuery}%,${DB_FIELDS.DESTINATIONS.CITY}.ilike.%${searchQuery}%,${DB_FIELDS.DESTINATIONS.COUNTRY}.ilike.%${searchQuery}%`);
    }
    
    // Execute query
    const { data: destinations, error } = await query;

    if (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      destinations 
    });
    
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch destinations', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Create a new destination (admin only)
 * @param request The HTTP request containing the destination data
 * @returns A JSON response with the created destination or error
 */
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = createClient();
  
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin(supabase);
    if (!isUserAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized: Admin access required' 
      }, { status: 403 });
    }

    // Parse and validate request body
    const destinationData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'city', 'country'];
    for (const field of requiredFields) {
      if (!destinationData[field]) {
        return NextResponse.json({ 
          success: false,
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }
    
    // Add metadata
    const { data: { user } } = await supabase.auth.getUser();
    destinationData.created_by = user?.id;
    destinationData.created_at = new Date().toISOString();
    destinationData.updated_at = new Date().toISOString();
    
    // Create new destination with proper table constants
    const { data: newDestination, error } = await supabase
      .from(DB_TABLES.DESTINATIONS)
      .insert([destinationData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating destination:', error);
      throw error;
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Destination created successfully',
      destination: newDestination 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating destination:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create destination', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
