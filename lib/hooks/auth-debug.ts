/**
 * Auth debugging utilities
 * This file contains utilities for debugging authentication issues
 */

export function debugAuth() {
  console.log('[Auth Debug] Starting authentication debugging...');

  // Check local storage for Supabase keys
  const supabaseKeys = Object.keys(localStorage).filter(
    (key) => key.startsWith('sb-') || key.includes('supabase')
  );

  console.log('[Auth Debug] Found Supabase-related localStorage keys:', supabaseKeys);

  // Check cookies
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const authCookies = cookies.filter(
    (cookie) =>
      cookie.startsWith('sb-') ||
      cookie.includes('supabase') ||
      cookie.includes('access_token') ||
      cookie.includes('refresh_token')
  );

  console.log('[Auth Debug] Found auth-related cookies:', authCookies);

  // Check environment variables are defined
  console.log('[Auth Debug] Environment variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY defined:',
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Check for browser compatibility issues
  console.log('[Auth Debug] Browser support check:');
  console.log('- localStorage available:', !!window.localStorage);
  console.log('- sessionStorage available:', !!window.sessionStorage);
  console.log('- cookies enabled:', navigator.cookieEnabled);
  console.log('- browser:', navigator.userAgent);

  console.log('[Auth Debug] Debug complete');

  // Return true if no obvious issues were found
  return (
    !!window.localStorage &&
    !!window.sessionStorage &&
    navigator.cookieEnabled &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function clearAuthData() {
  console.log('[Auth Debug] Attempting to clear auth data...');

  // Clear Supabase-related localStorage items
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
      console.log(`[Auth Debug] Removed localStorage key: ${key}`);
    }
  });

  // Attempt to clear auth cookies by setting expired date
  // Note: This is limited by domain/path constraints
  document.cookie.split(';').forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    if (
      cookieName.startsWith('sb-') ||
      cookieName.includes('supabase') ||
      cookieName.includes('access_token') ||
      cookieName.includes('refresh_token')
    ) {
      // Try to expire the cookie
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      console.log(`[Auth Debug] Attempted to expire cookie: ${cookieName}`);
    }
  });

  console.log('[Auth Debug] Auth data clearing complete. Page reload recommended.');
  return true;
}
