import { NextResponse, NextRequest } from 'next/server';
// Import the correct Route Handler client creator from @supabase/ssr
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// Use the direct TABLES export as per constants guide
import { TABLES } from '@/utils/constants/database';
import type { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest, // Route Handlers receive NextRequest
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Must await params in Next.js 15
    const { tripId } = await params;

    // UUID validation to prevent database errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID format' },
        { status: 400 }
      );
    }

    // Await cookies() to get the actual cookie store
    const cookieStore = await cookies();

    // Create the correct Supabase client for Route Handlers using @supabase/ssr
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Pass request for context if needed by set
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            // Pass request for context if needed by remove
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Use getUser() for a more secure auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in members route:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch trip members using the correct TABLES constant
    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(`
        *,
        profiles:${TABLES.PROFILES}(*)
      `)
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Return only the data array as per original logic, assuming the consumer expects { data: [...] }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
