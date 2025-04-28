import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { Profile } from '@/types/database.types';

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const userId = params.id;

  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin(supabase);
    if (!isUserAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized: Admin access required' 
      }, { status: 403 });
    }

    // Fetch the user with all necessary relations
    const { data: userData, error: userError } = await supabase
      .from(DB_TABLES.PROFILES)
      .select(`
        id,
        ${DB_FIELDS.PROFILES.NAME},
        ${DB_FIELDS.PROFILES.EMAIL},
        ${DB_FIELDS.PROFILES.AVATAR_URL},
        ${DB_FIELDS.PROFILES.IS_ADMIN},
        ${DB_FIELDS.PROFILES.CREATED_AT},
        ${DB_FIELDS.PROFILES.UPDATED_AT}
      `)
      .eq(DB_FIELDS.PROFILES.ID, userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user details',
        details: userError?.message || 'User not found'
      }, { status: 404 });
    }

    // Get update data from request
    const updateData = await request.json();
    
    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from(DB_TABLES.PROFILES)
      .update(updateData)
      .eq(DB_FIELDS.PROFILES.ID, userId)
      .select();

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update user',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: updatedProfile
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const userId = params.id;

  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin(supabase);
    if (!isUserAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized: Admin access required' 
      }, { status: 403 });
    }

    // Delete user's trip memberships
    await supabase.from(DB_TABLES.TRIP_MEMBERS).delete().eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId);

    // Delete user's profile
    const { error: profileError } = await supabase
      .from(DB_TABLES.PROFILES)
      .delete()
      .eq(DB_FIELDS.PROFILES.ID, userId);

    if (profileError) {
      throw profileError;
    }

    // Auth user will need to be deleted separately through Supabase Auth API
    // as it requires admin privileges and typically can't be done directly

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
