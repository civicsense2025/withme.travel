import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Define cookie handling functions separately
// Make getCookie async
async function getCookie(name: string) {
  // Await cookies() before using it
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

// Make setCookie async
async function setCookie(name: string, value: string, options: CookieOptions) {
  try {
    // Await cookies() before using it
    const cookieStore = await cookies();
    // Await the set operation if necessary (though set might not return a promise, awaiting cookies() is key)
    cookieStore.set({ name, value, ...options });
  } catch (error) {
    // Handle potential errors from `cookies().set(...)`
    console.error(`[Cookie Set Error] Failed to set cookie ${name}:`, error);
  }
}

// Make removeCookie async
async function removeCookie(name: string, options: CookieOptions) {
  try {
    // Await cookies() before using it
    const cookieStore = await cookies();
    // Await the set operation if necessary
    // Use set with empty value and maxAge 0 for removal
    cookieStore.set({ name, value: '', ...options });
  } catch (error) {
    // Handle potential errors
    console.error(`[Cookie Remove Error] Failed to remove cookie ${name}:`, error);
  }
}

/**
 * Creates a Supabase client configured for Server Components & Route Handlers.
 * Reads and writes cookies using the Next.js `cookies()` API.
 * This single helper works for both Server Components and Route Handlers in App Router.
 */
export function createServerSupabaseClient() {
  // No change needed here as we pass function references,
  // but the functions themselves are now async.
  // The `@supabase/ssr` library is designed to handle async cookie functions.
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: getCookie,
      set: setCookie,
      remove: removeCookie,
    },
  });
}

/**
 * Get the current session from the server using the unified Server Client.
 * @returns User session or null if not authenticated.
 */
export async function getServerSession() {
  try {
    // Use the single, correct helper
    const supabase = createServerSupabaseClient();

    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      // Specify type for reject
      setTimeout(() => reject(new Error('Authentication timeout')), 5000);
    });

    // Race the session fetch against a timeout
    const sessionPromise = supabase.auth.getSession();

    // Type the result of Promise.race explicitly
    const result = await Promise.race([sessionPromise, timeoutPromise]);

    // result here can be either the session response or the Error from timeoutPromise
    // We already handle the Error case via the catch block if timeoutPromise rejects
    // So, if we reach here, result must be the session response type.
    // However, Promise.race typing can be tricky, let's check for the error property explicitly.

    // Check if the result is the error from getSession()
    if ('error' in result && result.error) {
      console.error('Get session error:', result.error.message);
      return { data: { session: null } }; // Return null session on error
    }

    // Check if the result has the expected data structure
    if ('data' in result && 'session' in result.data) {
      return { data: { session: result.data.session } }; // Return correct structure
    }

    // If the result structure is unexpected, treat as error
    console.error('Unexpected result structure from getSession', result);
    return { data: { session: null } };
  } catch (error) {
    // This will catch the timeoutPromise rejection or other errors
    console.error('Error getting server session:', error);
    // Return a clean empty session object on error
    return { data: { session: null } };
  }
}

/**
 * Get the current authenticated user from the server.
 * This is more secure than getServerSession() as it validates the user's session
 * by contacting the Supabase Auth server rather than just reading from cookies.
 *
 * @returns Authenticated user object or null if not authenticated
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Check if a user is authenticated on the server using the more secure getUser method
 * @returns True if the user is authenticated
 */
export async function isAuthenticated() {
  const user = await getServerUser();
  return !!user;
}
