import { createClient as createSupabaseClient } from '@supabase/supabase-js';
/**
 * Creates a Supabase admin client with the service role key
 * which can bypass RLS policies. Only use this for admin operations
 * that are properly guarded with additional auth checks.
 */
export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase service role credentials');
    }
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
