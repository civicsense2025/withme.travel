/**
 * Auth utilities for backend authentication workflows
 */
// Removed CSRF import as it's no longer used
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Validate a CSRF token from the request
 * For server-side API routes
 *
 * NOTE: CSRF protection has been removed from this application.
 * This function remains for backward compatibility.
 *
 * @param token CSRF token to validate
 * @returns Error message if invalid, null if valid
 */
export async function validateCsrfToken(token: string): Promise<string | null> {
  // CSRF protection has been removed
  // This function always returns null (valid) for backward compatibility
  return null;
}

/**
 * Get current authenticated user ID from Supabase session
 * This is a helper for server-side routes
 *
 * @param supabase Supabase client instance
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting current user ID:', userError);
      return null;
    }
    return user?.id || null;
  } catch (error) {
    console.error('Unexpected error getting current user ID:', error);
    return null;
  }
}

/**
 * Check if user has admin role
 *
 * @param supabase Supabase client instance
 * @param userId User ID to check (defaults to current user)
 * @returns Boolean indicating if user is admin
 */
export async function isUserAdmin(supabase: SupabaseClient, userId?: string): Promise<boolean> {
  try {
    // If userId not provided, get current user
    const id = userId || (await getCurrentUserId(supabase));

    if (!id) return false;

    // Query the profiles table for admin status
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data.is_admin === true;
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
}
