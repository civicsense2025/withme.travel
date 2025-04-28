import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { type AuthChangeEvent, type Session } from '@supabase/supabase-js';

// Singleton instance for Supabase client
let supabaseClient: any = null;

/**
 * Creates or returns existing Supabase client instance
 * Uses createBrowserClient from @supabase/ssr for better coordination with server
 */
export function createClient() {
  if (!supabaseClient) {
    console.log('[Supabase Client] Creating new browser client instance.');
    try {
      const client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true, 
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            // Debug settings
            debug: process.env.NODE_ENV === 'development',
            // Override storage options to fix PKCE issues
            storageKey: 'supabase-auth-token',
            storage: {
              getItem: (key: string): string | null => {
                try {
                  const item = localStorage.getItem(key);
                  return item;
                } catch (error) {
                  console.error(`[Supabase Client] Error retrieving from storage: ${key}`, error);
                  return null;
                }
              },
              setItem: (key: string, value: string): void => {
                try {
                  localStorage.setItem(key, value);
                } catch (error) {
                  console.error(`[Supabase Client] Error setting to storage: ${key}`, error);
                }
              },
              removeItem: (key: string): void => {
                try {
                  localStorage.removeItem(key);
                } catch (error) {
                  console.error(`[Supabase Client] Error removing from storage: ${key}`, error);
                }
              },
            }
          },
          global: {
            headers: {
              'x-client-info': 'withme.travel@1.0.0',
            },
          },
        }
      );
      
      // Set up auth state change listener after client creation
      client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        console.log(`[Supabase Client] Auth state change: ${event}`, !!session);
      });
      
      supabaseClient = client;
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
  
  if (supabaseClient && typeof window !== 'undefined') {
    try {
      // Sign out from Supabase first
      const { error: signOutError } = await supabaseClient.auth.signOut({ scope: 'global' });
      if (signOutError) {
        console.error("[Supabase Client] Error during sign out:", signOutError.message);
      } else {
        console.log("[Supabase Client] Successfully signed out from Supabase");
      }
      
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=').map(c => c.trim());
        if (name && (name.includes('supabase') || name.includes('sb-'))) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      });
      
      // Verify with server that session is cleared
      try {
        const meResponse = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!meResponse.ok) {
          console.log("[Supabase Client] Server confirms no active session");
        } else {
          console.warn("[Supabase Client] Server still reports active session after reset");
        }
      } catch (e) {
        console.error("[Supabase Client] Error checking server session:", e);
      }
      
    } catch (e) {
      console.error("[Supabase Client] Error during client reset:", e);
    } finally {
      // Always reset the client instance
      supabaseClient = null;
    }
  } else {
    // Just reset the client if we're not in browser or no client exists
    supabaseClient = null;
  }
}

/**
 * Attempts to repair auth state when client and server are out of sync
 * @returns {Promise<boolean>} True if repair succeeded, false otherwise
 */
export async function repairAuthState() {
  console.log("[Supabase Client] Attempting to repair auth state...");
  const client = createClient();
  
  try {
    // First try to refresh the session
    const { data: { session }, error: refreshError } = await client.auth.refreshSession();
    
    if (refreshError) {
      console.warn("[Supabase Client] Session refresh failed:", refreshError.message);
      return false;
    }
    
    if (!session) {
      console.warn("[Supabase Client] No session after refresh");
      return false;
    }
    
    console.log("[Supabase Client] Session refreshed successfully");
    
    // Check if server recognizes the refreshed session
    const meResponse = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!meResponse.ok) {
      console.error("[Supabase Client] Server doesn't recognize refreshed session");
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
    await resetClient();
    return false;
  }
}
