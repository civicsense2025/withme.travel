import { createSupabaseClient } from './supabase';

/**
 * Test database connectivity and functionality
 * @returns Object containing test results
 */
export async function testDatabaseConnection() {
  const results = {
    clientCreated: false,
    sessionFetched: false,
    queryExecuted: false,
    errors: {} as Record<string, any>,
  };

  try {
    // Test 1: Create client
    const supabase = createSupabaseClient();
    results.clientCreated = !!supabase;

    // Test 2: Get session (doesn't need to be valid)
    try {
      const { data } = await supabase.auth.getSession();
      results.sessionFetched = true;
    } catch (error) {
      results.errors.session = error;
    }

    // Test 3: Try a simple query
    try {
      const { data, error } = await supabase
        .from('health_check')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        // Try profiles table instead if health_check doesn't exist
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('count(*)')
          .limit(1)
          .single();

        results.queryExecuted = !profileError;
        if (profileError) {
          results.errors.query = profileError;
        }
      } else {
        results.queryExecuted = true;
      }
    } catch (queryError) {
      results.errors.query = queryError;
    }

    return results;
  } catch (error) {
    results.errors.main = error;
    return results;
  }
}

/**
 * Test authentication functionality
 * @returns Object containing auth test results
 */
export async function testAuthentication() {
  const results = {
    anonymousSessionCreated: false,
    guestSessionFetched: false,
    errors: {} as Record<string, any>,
  };

  try {
    const supabase = createSupabaseClient();

    // Try to get current session
    try {
      const { data } = await supabase.auth.getSession();
      results.guestSessionFetched = true;
    } catch (error) {
      results.errors.session = error;
    }

    // Try anonymous session creation
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      results.anonymousSessionCreated = !error;
      if (error) {
        results.errors.anonymous = error;
      }
    } catch (error) {
      results.errors.anonymous = error;
    }

    return results;
  } catch (error) {
    results.errors.main = error;
    return results;
  }
}
