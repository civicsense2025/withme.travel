import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Helper function to check admin status (can be moved to a shared lib later)
async function isAdmin(supabaseClient: any): Promise<boolean> {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    return false;
  }
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  if (error || !profile) {
    console.error('[API Admin Check] Error fetching profile or profile not found:', error);
    return false;
  }
  return profile.is_admin === true;
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        remove(name: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
      },
    }
  );

  // Check if the user is an admin
  const userIsAdmin = await isAdmin(supabase);
  if (!userIsAdmin) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch destinations', details: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        remove(name: string, options: Partial<ResponseCookie>) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
      },
    }
  );

  // Check if the user is an admin
  const userIsAdmin = await isAdmin(supabase);
  if (!userIsAdmin) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();

    const { error } = await supabase
      .from('destinations')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Destination created successfully' });
  } catch (error: any) {
    console.error('Error creating destination:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create destination', details: error.message }),
      { status: 500 }
    );
  }
}
