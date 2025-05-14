import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client configured for server usage (API routes, server components)
 * This centralizes the client creation logic to avoid duplication
 *
 * @deprecated Use createServerComponentClient or createRouteHandlerClient from utils/supabase/server instead
 */
export async function getServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Gets the current user session from Supabase
 * Returns null if no session is found
 *
 * @deprecated Use getServerSession from utils/supabase/server instead
 */
export async function getServerSession() {
  const supabase = await getServerSupabase();
  // Use getUser() for security
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user in deprecated getServerSession:', error);
    return null;
  }
  // Note: This function signature might need adjustment if callers expect the full session object
  // Returning just the user for now, as the session object from getSession is discouraged.
  // Ideally, refactor callers to use the new utils/supabase/server functions.
  return user;
}

/**
 * Gets the current user from Supabase
 * Returns null if no user is found
 *
 * @deprecated Use a method from utils/supabase/server instead
 */
export async function getServerUser() {
  const user = await getServerSession();
  return user;
}
