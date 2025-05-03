/**
 * Supabase utilities for Server Components
 *
 * This file is specifically for use in Server Components in the app/ directory.
 * It safely uses next/headers which is only available in Server Components.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a Supabase client for use in server components
 * With proper cookie handling as documented in Next.js 15
 */
export function getServerComponentClient(): TypedSupabaseClient {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name) {
        const cookieStore = await cookies();
        return cookieStore.get(name)?.value;
      },
    },
  });
}

/**
 * Get the user's session in server components
 */
export async function getServerComponentSession() {
  try {
    const supabase = getServerComponentClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return { data: { session: data.session } };
  } catch (error) {
    console.error('Error getting server component session:', error);
    return { data: { session: null } };
  }
}
