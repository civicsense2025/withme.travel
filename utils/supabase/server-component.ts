/**
 * Supabase utilities for Server Components
 * 
 * This file is specifically for use in Server Components in the app/ directory.
 * It safely uses next/headers which is only available in Server Components.
 */
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
// Note: Don't import cookies directly at the top level
// import { cookies } from 'next/headers';

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
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Access cookies() only when the function is called
        // This approach works with Next.js 15 and prevents static analysis errors
        get(name) {
          // Dynamic import of the cookies function at runtime
          // This is a special pattern that works with Next.js
          const { cookies } = require('next/headers');
          return cookies().get(name)?.value;
        }
      }
    }
  );
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