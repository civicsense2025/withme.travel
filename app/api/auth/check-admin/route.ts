import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * API route to check if the current user is an admin
 * Returns { isAdmin: boolean }
 */
export async function GET() {
  try {
    // Initialize Supabase client with the correct approach
    const supabase = await createRouteHandlerClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the user has is_admin field set to true in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);

      // First check if the user has admin in their metadata as a fallback
      if (user.user_metadata?.is_admin === true) {
        return NextResponse.json({ isAdmin: true });
      }

      return NextResponse.json(
        { isAdmin: false, error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // Check if is_admin is true
    const isAdmin = profileData?.is_admin === true;

    // If the user is not admin in the profiles table, check metadata as fallback
    if (!isAdmin && user.user_metadata?.is_admin === true) {
      return NextResponse.json({ isAdmin: true });
    }

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Server error' }, { status: 500 });
  }
}
