import { createBrowserClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { type AuthChangeEvent, type Session } from '@supabase/supabase-js';

// Singleton instance for Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Default session expiry times for enhanced security
// 1 hour access token lifetime (shorter than Supabase default of 1 hour)
const SESSION_EXPIRY_SECONDS = 60 * 60; // 1 hour

/**
 * Creates or returns existing Supabase client instance
 * Uses createBrowserClient from @supabase/ssr for better coordination with server
 */
export function createClient() {
  if (!supabaseClient) {
    console.log('[Supabase Client] Creating new browser client instance.');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Supabase Client] Missing Supabase URL or Anon Key in environment variables!');
      throw new Error('Supabase environment variables are not set.');
    }
    
    console.log('[Supabase Client] Environment check:', { 
      hasSupabaseUrl: true, 
      hasSupabaseAnonKey: true,
      supabaseUrlFirstChars: supabaseUrl.substring(0, 10) + '...',
      anonKeyLength: supabaseAnonKey.length
    });
    
    try {
      supabaseClient = createBrowserClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        // No custom auth options needed here, @supabase/ssr handles cookies automatically
      );
      
      // Set up auth state change listener after client creation
      supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log(`[Supabase Client] Auth state change: ${event}`, { sessionExists: !!session });
        // Trigger a state update or re-check when auth state changes
        // Note: AuthProvider's useEffect listening to this should handle the update
        // If issues persist, might need a more direct state update here or event emitter
      });
      
    } catch (error) {
      console.error('[Supabase Client] Error creating client:', error);
      throw error;
    }
  }

  return supabaseClient;
}

/**
 * Resets the Supabase client and clears authentication state
 * Should be called on logout or when encountering auth errors
 */
export async function resetClient() {
  console.log("[Supabase Client] Resetting client...");
  const client = createClient(); // Use the singleton getter
  
  if (client && typeof window !== 'undefined') {
    try {
      // Sign out from Supabase first
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        console.error("[Supabase Client] Error during sign out:", signOutError.message);
      } else {
        console.log("[Supabase Client] Successfully signed out from Supabase");
      }
      
      // Clear localStorage (optional, Supabase SSR handles cookies)
      // Object.keys(localStorage).forEach(key => {
      //   if (key.includes('supabase') || key.includes('sb-')) {
      //     localStorage.removeItem(key);
      //   }
      // });
      
      // Clear cookies with secure parameters (this is often the most important part)
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=').map(c => c.trim());
        if (name && (name.includes('supabase') || name.includes('sb-'))) {
          // Set expiry to the past, specify path and domain if necessary
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax;`;
        }
      });
      
      // Make a server request to clear server-side session cookie
      try {
        await fetch('/api/auth/clear-cookies', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.error("[Supabase Client] Error calling clear-cookies endpoint:", e);
      }
      
    } catch (e) {
      console.error("[Supabase Client] Error during client reset:", e);
    } finally {
      // Reset the singleton instance variable
      supabaseClient = null;
    }
  } else {
    // Just reset the instance variable if no client or not in browser
    supabaseClient = null;
  }
}

/**
 * Attempts to repair auth state when client and server are out of sync
 * @returns {Promise<boolean>} True if repair succeeded, false otherwise
 */
export async function repairAuthState() {
  console.log("[Supabase Client] Attempting to repair auth state...");
  const client = createClient(); // Use the singleton getter
  
  try {
    // First try to refresh the session
    const { data: { session }, error: refreshError } = await client.auth.refreshSession();
    
    if (refreshError) {
      console.warn("[Supabase Client] Session refresh failed:", refreshError.message);
      // Don't necessarily reset client here, might be temporary network issue
      return false;
    }
    
    if (!session) {
      console.warn("[Supabase Client] No session after refresh");
      // If refresh succeeded but no session, likely logged out, reset state
      await resetClient(); 
      return false;
    }
    
    console.log("[Supabase Client] Session refreshed successfully");
    
    // Check if server recognizes the refreshed session
    const meResponse = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!meResponse.ok) {
      console.error("[Supabase Client] Server doesn't recognize refreshed session, status:", meResponse.status);
      await resetClient();
      return false;
    }
    
    const { user } = await meResponse.json();
    if (!user) {
      console.error("[Supabase Client] Server returned no user after session refresh");
      await resetClient();
      return false;
    }
    
    console.log("[Supabase Client] Auth state repaired successfully");
    return true;
  } catch (e) {
    console.error("[Supabase Client] Error repairing auth state:", e);
    // Consider resetting client on unexpected errors during repair
    await resetClient(); 
    return false;
  }
}
