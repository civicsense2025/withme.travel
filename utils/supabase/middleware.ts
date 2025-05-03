'use server'; // Ensure this module is only used on the server

/**
 * Supabase Client Utility - MIDDLEWARE ONLY
 *
 * This file isolates the middleware client creator to avoid potential
 * build issues with Next.js associating it incorrectly with Server Actions.
 */
import { createServerClient as _createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { NextRequest, NextResponse } from 'next/server';

// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables (URL or Anon Key) for middleware client.'
  );
}

// --- Type Definitions ---
// Re-define or import TypedSupabaseClient if needed, assuming it might be defined elsewhere
// or just use SupabaseClient<Database> directly.
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a Supabase client for Middleware.
 */
export function createMiddlewareClient(
  request: NextRequest,
  response = NextResponse.next()
): { supabase: TypedSupabaseClient; response: NextResponse } {
  console.log('[supabase-middleware] Creating middleware client');
  // NOTE: Middleware uses the request/response objects directly for cookie handling,
  // it does NOT use the cookies() function from next/headers.
  const supabase = _createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options) => {
        response.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
  return { supabase, response };
}
