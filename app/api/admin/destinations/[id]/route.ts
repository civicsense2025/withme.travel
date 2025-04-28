import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';
import { createApiClient } from "@/utils/supabase/server";
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

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: Partial<ResponseCookie>) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        async remove(name: string, options: Partial<ResponseCookie>) {
          try {
            const cookieStore = await cookies();
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
    const { id } = context.params;
    const data = await request.json();

    const { error } = await supabase
      .from('destinations')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Destination updated successfully' });
  } catch (error: any) {
    console.error('Error updating destination:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update destination', details: error.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: Partial<ResponseCookie>) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error if needed
          }
        },
        async remove(name: string, options: Partial<ResponseCookie>) {
          try {
            const cookieStore = await cookies();
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
    const { id } = context.params;
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Destination deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting destination:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete destination', details: error.message }),
      { status: 500 }
    );
  }
}
