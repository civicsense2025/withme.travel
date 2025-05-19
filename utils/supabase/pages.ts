// ============================================================================
// SUPABASE UTILITIES FOR PAGES ROUTER
// ============================================================================

/**
 * @file utils/supabase/pages.ts
 * @description
 *   Supabase utility functions for use in Next.js Pages Router (`/pages` directory).
 *   These helpers provide properly typed Supabase clients for server-side rendering,
 *   API routes, and admin checks, using the Pages Router context and environment.
 *
 *   Use these utilities in `/pages` directory components and API routes.
 *   For App Router (`/app`), use the corresponding helpers in `utils/supabase/app.ts`.
 *
 * @module utils/supabase/pages
 */

// ============================================================================
// IMPORTS
// ============================================================================

// External dependencies
import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Types
import type { Database } from '../../types/.database.types';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

/**
 * Supabase project URL, loaded from environment variable.
 * @throws {Error} If not set.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// ============================================================================
// SUPABASE CLIENT FACTORIES
// ============================================================================

/**
 * Creates a Supabase client for use in `getServerSideProps` (Pages Router).
 *
 * @param context - The Next.js server-side props context
 * @returns A typed Supabase client instance
 *
 * @example
 *   export async function getServerSideProps(context) {
 *     const supabase = createPagesServerClient(context);
 *     // ...fetch data
 *   }
 */
export function createPagesServerClient(context: GetServerSidePropsContext) {
  // NOTE: The third argument is required for @supabase/ssr v0.8.0+
  return createServerSupabaseClient<Database>(
    context,
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    },
    {
      // Optionally, pass cookie options here if needed
    }
  );
}

/**
 * Creates a Supabase client for API routes in the Pages Router.
 *
 * @param req - The Next.js API request object
 * @param res - The Next.js API response object
 * @returns A typed Supabase client instance
 *
 * @example
 *   export default async function handler(req, res) {
 *     const supabase = createPagesApiClient(req, res);
 *     // ...handle API logic
 *   }
 */
export function createPagesApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerSupabaseClient<Database>(
    { req, res },
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    },
    {
      // Optionally, pass cookie options here if needed
    }
  );
}

/**
 * Creates a basic Supabase client without session handling.
 * Use for server-side utilities or API routes that do not require authentication.
 *
 * @returns A typed Supabase client instance
 */
export function createBasicClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ============================================================================
// ADMIN CHECK UTILITY
// ============================================================================

/**
 * Checks if the current user (from the Pages Router context) is an admin.
 *
 * @param context - The Next.js server-side props context
 * @returns An object with `isAdmin` boolean and `error` string (if any)
 *
 * @example
 *   const { isAdmin, error } = await checkAdminStatusPages(context);
 */
export async function checkAdminStatusPages(context: GetServerSidePropsContext): Promise<{ isAdmin: boolean; error: string | null }> {
  const supabase = createPagesServerClient(context);

  // Get the current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return { isAdmin: false, error: sessionError.message ?? 'Failed to get session' };
  }

  if (!session) {
    return { isAdmin: false, error: 'Not authenticated' };
  }

  // Check profile for admin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  // If error or no profile, fallback to user_metadata
  if (profileError) {
    // Optionally log error here
  }

  // First check the database
  if (profile && typeof profile === 'object' && 'is_admin' in profile && profile.is_admin) {
    return { isAdmin: true, error: null };
  }

  // Then check metadata as fallback
  if (session.user.user_metadata && session.user.user_metadata.is_admin) {
    return { isAdmin: true, error: null };
  }

  return { isAdmin: false, error: 'Not authorized as admin' };
}
