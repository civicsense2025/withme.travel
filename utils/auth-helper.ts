/**
 * Auth helpers for managing authentication state and cookies
 */
import { supabase } from '@/utils/supabase/client';

/**
 * Clear all authentication-related cookies and local storage
 */
export async function clearAuthState(): Promise<void> {
  try {
    // Clear Supabase auth
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear cookies
    const cookiesToClear = [
      'supabase-auth-token',
      'sb-refresh-token',
      'sb-access-token',
      '__supabase_session_id',
      'withme_cookie_consent'
    ];
    
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    
    // Clear localStorage items related to auth
    const localStorageKeysToRemove = [
      'cookiesAccepted',
      'supabase.auth.token',
      'withme_auth_state'
    ];
    
    localStorageKeysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors with localStorage
      }
    });
    
    console.log('Auth state cleared successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('Failed to clear auth state:', error);
    return Promise.reject(error);
  }
}

/**
 * Fix corrupted auth state
 * Attempts to repair authentication without losing the session
 */
export async function repairAuthState(): Promise<boolean> {
  try {
    // Try to refresh the session
    const { error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.warn('Session refresh failed, clearing auth state completely:', error);
      await clearAuthState();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to repair auth state:', error);
    await clearAuthState();
    return false;
  }
} 