/**
 * Supabase utilities for Pages Router
 * Use these in /pages directory components instead of the App Router versions
 */

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/.database.types';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

/**
 * Create a Supabase client for use in getServerSideProps
 */
export function createPagesServerClient(context: GetServerSidePropsContext) {
  return createServerSupabaseClient<Database>(context, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
}

/**
 * Create a Supabase client for API routes in the Pages Router
 */
export function createPagesApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerSupabaseClient<Database>(
    { req, res },
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    }
  );
}

/**
 * Create a basic Supabase client without session handling
 * For use in API routes that don't need authentication
 */
export function createBasicClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Simple check to determine if a user is an admin
 * For use in Pages Router components
 */
export async function checkAdminStatusPages(context: GetServerSidePropsContext) {
  const supabase = createPagesServerClient(context);

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { isAdmin: false, error: 'Not authenticated' };
  }

  // Check profile for admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  // First check the database
  if (profile?.is_admin) {
    return { isAdmin: true, error: null };
  }

  // Then check metadata as fallback
  if (session.user.user_metadata?.is_admin) {
    return { isAdmin: true, error: null };
  }

  return { isAdmin: false, error: 'Not authorized as admin' };
}
