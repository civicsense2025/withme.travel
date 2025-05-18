import { createRouteHandlerClient, createServerComponentClient } from '@/utils/supabase/server';

/**
 * Checks if the current user is an admin
 * Returns isAdmin, supabase client, and any error message
 */
export async function checkAdminAuth() {
  try {
    // Create a server component client which is appropriate for layout.tsx
    const supabase = await createServerComponentClient();

    // Get the current user securely using getUser
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

    if (profileError) {
      console.error('Error fetching profile:', profileError);

      // Check user metadata as fallback
      if (user.user_metadata?.is_admin === true) {
        return {
          isAdmin: true,
          supabase,
          error: null,
        };
      }

      return {
        isAdmin: false,
        supabase,
        error: 'Profile not found',
      };
    }

    // Check if the user is an admin
    const isAdmin = profile?.is_admin === true;

    // Also check user metadata as fallback
    if (!isAdmin && user.user_metadata?.is_admin === true) {
      return {
        isAdmin: true,
        supabase,
        error: null,
      };
    }

    return {
      isAdmin,
      supabase,
      error: !isAdmin ? 'Not authorized as admin' : null,
    };
  } catch (error) {
    console.error('Admin auth check error:', error);
    return {
      isAdmin: false,
      supabase: null,
      error: error instanceof Error ? error.message : 'Unknown error checking admin status',
    };
  }
}
