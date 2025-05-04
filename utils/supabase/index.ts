/**
 * Centralized Supabase client utilities for Next.js
 *
 * This file provides type-safe Supabase client creation for both client and server components
 * with proper cookie handling throughout your Next.js application.
 */
import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { createApiClient } from './api';

// Ensure environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Canonical browser client accessor:
export { getBrowserClient } from './browser-client';

// Export the API client to make imports consistent
export { createApiClient };

// Export types for convenience
export type SupabaseBrowserClient = ReturnType<typeof createSupabaseBrowserClient<Database>>;
export type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;
