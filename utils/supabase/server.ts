import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for use on the server.
 * To be used in server components and route handlers.
 */
export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // Session is managed via cookies on the server
        autoRefreshToken: false, // Token refresh is handled separately
        detectSessionInUrl: false, // No browser detection on server
      },
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            await cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This is an edge case that should rarely happen
            // See https://github.com/vercel/next.js/issues/49259
            console.error('Cookie set error:', error);
          }
        },
        async remove(name: string, options: any) {
          try {
            await cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch (error) {
            console.error('Cookie remove error:', error);
          }
        },
      },
    }
  );
}

/**
 * Creates an untyped Supabase client for use in server utilities.
 * This bypasses TypeScript checking for easier database operations.
 * To be used in database utility functions where type safety is handled manually.
 */
export function createUntypedServerClient() {
  // Using any to suppress TypeScript errors
  const cookieStore = cookies();
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      // Using any to allow cookies object to bypass strict type checking
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          // Not called in server context
          console.log('Cookie set attempted but not implemented in server context');
        },
        remove(name: string, options: any) {
          // Not called in server context
          console.log('Cookie remove attempted but not implemented in server context');
        },
      } as any,
    }
  );
}

// Creates a client for use in API routes, automatically retrieving cookies
export function createApiClient(cookieStore?: ReturnType<typeof cookies>) {
  return createClient(cookieStore || cookies());
}

// Creates a client for use in server components, automatically retrieving cookies
export function createSupabaseServerClient(cookieStore?: ReturnType<typeof cookies>) {
  return createClient(cookieStore || cookies());
}

// Creates a client for use in route handlers, automatically retrieving cookies
export function createRouteHandlerClient(cookieStore?: ReturnType<typeof cookies>) {
  return createClient(cookieStore || cookies());
}

// Creates a client for use in server components with enhanced error handling
export function createServerComponentClient() {
  const cookieStore = cookies();
  const client = createClient(cookieStore);
  return client;
}

/**
 * Get the current session from the server
 * @returns User session or null if not authenticated
 */
export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Add a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Authentication timeout')), 5000);
    });
    
    // Race the session fetch against a timeout
    const sessionPromise = supabase.auth.getSession();
    
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Error getting server session:', error);
    // Return a clean empty session object on error
    return { data: { session: null } };
  }
}

/**
 * Get the current user from the server
 * @returns User object or null if not authenticated
 */
export async function getServerUser() {
  const { data } = await getServerSession();
  return data.session?.user || null;
}

/**
 * Check if a user is authenticated on the server
 * @returns True if the user is authenticated
 */
export async function isAuthenticated() {
  const { data } = await getServerSession();
  return !!data.session;
}
