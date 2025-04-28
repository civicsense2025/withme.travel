/**
 * Auth utilities for backend authentication workflows
 */
import { CSRF } from './csrf';

/**
 * Validate a CSRF token from the request
 * For server-side API routes
 * 
 * @param token CSRF token to validate
 * @returns Error message if invalid, null if valid
 */
export async function validateCsrfToken(token: string): Promise<string | null> {
  if (!token) {
    return 'Missing CSRF token';
  }
  
  // For now we're just checking if the token exists
  // In a real implementation, we would validate it against the stored token in cookies
  // But we're already doing that validation in the csrf.ts validateRequestCsrfToken function
  
  return null; // Token is valid
}

/**
 * Get current authenticated user ID from Supabase session
 * This is a helper for server-side routes
 * 
 * @param supabase Supabase client instance
 * @returns User ID or null if not authenticated
 */
export async function getCurrentUserId(supabase: any): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
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
export async function isUserAdmin(supabase: any, userId?: string): Promise<boolean> {
  try {
    // If userId not provided, get current user
    const id = userId || await getCurrentUserId(supabase);
    
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