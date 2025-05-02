/**
 * Server-only Supabase client utility using @supabase/ssr
 * This file should only be imported in server components, API routes, or server actions
 */
import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (URL or Anon Key).');
}

// --- Type Definitions ---
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a Supabase client for Server Components (read-only cookies)
 */
export function createServerSupabaseClient(): TypedSupabaseClient {
  console.log('[supabase] Creating server component client');
  try {
    // Get the cookies - already returns the store directly in Next.js 15
    const cookieStore = cookies();
    
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.warn(`[supabase] Error accessing cookie ${name}:`, error);
            return undefined;
          }
        },
        // Server Components cannot set cookies
      },
    });
  } catch (error) {
    console.error('[supabase] Error creating server component client:', error);
    // Create a minimal client with no cookie access as fallback
    // This will still work for non-auth operations
    return _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        get(name: string) {
          return undefined;
        },
      },
    });
  }
}

/**
 * Get the current session from the server
 */
export async function getServerSession() {
  const supabase = createServerSupabaseClient();
  return supabase.auth.getSession();
}

/**
 * Get the current user from the server
 */
export async function getServerUser() {
  const { data } = await getServerSession();
  return data?.session?.user || null;
}

export default createServerSupabaseClient;
