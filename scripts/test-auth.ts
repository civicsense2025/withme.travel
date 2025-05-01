import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '@/types/supabase';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a client for user interactions using the anon key
const supabaseAnon = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a client for admin actions using the service role key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAuthFlow() {
  let userId: string | null = null;
  try {
    console.log('🧪 Testing signup, login, and auth flows...\n');

    // 1. Sign up a new test user
    const email = `auth-test-${Date.now()}@example.com`;
    const password = 'testPassword123!';

    console.log('1️⃣ Signing up...');
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    console.log('✅ Sign up response:', signUpData);

    /* 
      Note: Depending on your Supabase project settings, the user may require email confirmation.
      For testing purposes, ensure auto-confirmation is enabled, or manually confirm the user via the dashboard.
    */

    // 2. Sign in the user
    console.log('\n2️⃣ Signing in...');
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    console.log('✅ Sign in response:', signInData);

    if (!signInData.session) {
      throw new Error('No session returned after sign in.');
    }
    userId = signInData.session.user.id;
    console.log('✅ Authenticated user id:', userId);

    // 3. Retrieve current session (optional check)
    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.getSession();
    if (sessionError) throw sessionError;
    console.log('✅ Current session:', sessionData.session);
  } catch (error) {
    console.error('❌ Auth test error:', error);
  } finally {
    // Clean up the test user using the admin client
    if (userId) {
      console.log('\n🧹 Cleaning up test user...');
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error('❌ Error deleting test user:', deleteError);
      } else {
        console.log('✅ Test user deleted.');
      }
    }
  }
}

testAuthFlow();
