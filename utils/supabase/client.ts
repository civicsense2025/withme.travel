import { createBrowserClient } from "@supabase/ssr";
import { Database } from '@/types/database.types'

// Constants for Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates and returns a Supabase browser client instance.
 * Uses a singleton pattern to avoid multiple client instances.
 */
export const createClient = () => {
  if (clientInstance) {
    return clientInstance;
  }

  console.log("[Supabase Client] Creating new browser client instance.");
  
  // Create new client instance with default cookie handling
  clientInstance = createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    // Let @supabase/ssr handle cookie storage automatically
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true, // This will use cookies by default
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }
  );

  return clientInstance;
};

// Function to reset the client (useful for testing/development)
export const resetClient = () => {
  clientInstance = null;
  
  // Clear Supabase-related items in localStorage (though we primarily use cookies now)
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all Supabase cookies explicitly
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name.includes('supabase') || name.includes('sb-')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
    
    // Fetch our clear-cookies endpoint to ensure server-side cookies are cleared too
    fetch('/api/auth/clear-cookies').catch(e => 
      console.error('Failed to clear server-side cookies:', e)
    );
  }
}; 