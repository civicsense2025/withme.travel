/**
 * Route authentication helper utilities
 * These functions can be used in page components to handle authentication checks
 */
import { redirect } from 'next/navigation';
import { createServerComponentClient, getServerSession } from '@/utils/supabase/server';
import { getGuestToken } from '@/utils/guest';

/**
 * Redirects to login if not authenticated
 * To be used in server components
 *
 * @param redirectPath The path to redirect to if unauthenticated (default: /login)
 * @returns User data if authenticated, never returns if not (redirects instead)
 */
export async function requireAuth(redirectPath = '/login') {
  // Check for authenticated user
  const { data } = await getServerSession();
  const user = data.user;

  // If no user, redirect to login
  if (!user) {
    // Include the current path as a redirect parameter
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const redirectUrl = currentPath
      ? `${redirectPath}?redirectTo=${encodeURIComponent(currentPath)}`
      : redirectPath;

    redirect(redirectUrl);
  }

  return user;
}

/**
 * Verifies if the user is authenticated, but allows guest access based on guest tokens
 * To be used in server components
 *
 * @param redirectPath The path to redirect to if neither authenticated nor guest (default: /login)
 * @returns Object with user and isGuest flags
 */
export async function requireAuthOrGuest(redirectPath = '/login') {
  // First check for authenticated user
  const { data } = await getServerSession();
  const user = data.user;

  if (user) {
    return { user, isGuest: false };
  }

  // If no user, check for guest token
  const guestToken = await getGuestToken();
  if (guestToken) {
    return { user: null, isGuest: true, guestToken };
  }

  // Neither authenticated nor guest, redirect
  redirect(redirectPath);
}

/**
 * Redirects authenticated users away from this route
 * Useful for login/signup pages that should only be shown to unauthenticated users
 *
 * @param redirectPath The path to redirect authenticated users to (default: /trips/manage)
 * @returns null if not authenticated, never returns if authenticated
 */
export async function requireNoAuth(redirectPath = '/trips/manage') {
  // Check for authenticated user
  const { data } = await getServerSession();
  const user = data.user;

  // If user exists, redirect away from this page
  if (user) {
    redirect(redirectPath);
  }

  return null;
}
