import { createRouteHandlerClient, createServerComponentClient } from '@/utils/supabase/server';

/**
 * Checks if the current user is an admin
 * Returns isAdmin, supabase client, and any error message
 */
export async function checkAdminAuth() {
  try {
    // Determine if we're in a route handler or server component
    let supabase;
    try {
      // Try to create a route handler client first
      supabase = await createRouteHandlerClient();
    } catch (error) {
      // If that fails, create a server component client
      supabase = await createServerComponentClient();
    }

    // Get the current user securely using getUser instead of getSession
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isAdmin: false,
        supabase,
        error: userError ? userError.message : 'Not authenticated',
      };
    }

    // Get the user's profile to check if they are an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        isAdmin: false,
        supabase,
        error: 'Profile not found',
      };
    }

    // Check if the user is an admin
    return {
      isAdmin: !!profile.is_admin,
      supabase,
      error: !profile.is_admin ? 'Not authorized as admin' : null,
    };
  } catch (error) {
    return {
      isAdmin: false,
      supabase: null,
      error: error instanceof Error ? error.message : 'Unknown error checking admin status',
    };
  }
}
