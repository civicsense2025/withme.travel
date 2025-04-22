import { createBrowserClient } from "@supabase/ssr";

// Constants for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Global variable to hold the singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get the Supabase browser client as a singleton
 * This ensures we only create one client per browser context
 */
export const getSupabaseBrowserClient = () => {
  if (!supabaseInstance) {
    console.log("Creating new Supabase browser client");
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          // Parse cookies safely
          try {
            if (typeof document === "undefined") return null;
            const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
            return match ? decodeURIComponent(match[2]) : null;
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error);
            return null;
          }
        },
        set(name, value, options) {
          // Set cookies safely
          try {
            if (typeof document === "undefined") return;
            
            let cookieString = `${name}=${value}`;
            if (options?.expires) {
              cookieString += `; expires=${options.expires.toUTCString()}`;
            }
            if (options?.path) {
              cookieString += `; path=${options.path}`;
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`;
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`;
            }
            if (options?.secure) {
              cookieString += `; secure`;
            }
            
            document.cookie = cookieString;
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        remove(name, options) {
          // Remove cookies safely
          try {
            if (typeof document === "undefined") return;
            
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${
              options?.path ? `; path=${options.path}` : '; path=/'
            }`;
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
          }
        },
      },
    });
  }
  return supabaseInstance;
};

// Export a createClient function for backward compatibility
export const createClient = () => {
  return getSupabaseBrowserClient();
};

// For the most direct backward compatibility
export const supabase = getSupabaseBrowserClient();

export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}; 