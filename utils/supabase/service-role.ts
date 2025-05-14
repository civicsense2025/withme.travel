import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!serviceRoleKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Create a singleton instance of the service role client
// NOTE: Use createSupabaseClient to avoid naming conflict if this file is also named createClient
const serviceRoleClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Service role client specifics
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Returns the singleton instance of the Supabase service role client.
 * Use this for backend operations requiring elevated privileges (bypassing RLS).
 */
export function createClient() {
  return serviceRoleClient;
}

// Optional: Export the instance directly if preferred
// export const supabaseServiceRole = serviceRoleClient;
