import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';
import { cookies } from 'next/headers';

// --- Types ---
type Group = Database['public']['Tables']['groups']['Row'];
type GroupMember = Database['public']['Tables']['group_members']['Row'];

interface GroupResponse {
  group: Group & { group_members?: GroupMember[] };
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// GET /api/groups - Get a list of groups the user belongs to
export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user securely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get URL params
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('groups')
      .select(`*, group_members (user_id, role, status), trip_count:group_trips(count)`)
      .eq('group_members.user_id', userId)
      .eq('group_members.status', 'active');

    // Add search filter if provided
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: groups, error } = await query;

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error in groups GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// In-memory rate limit store (MVP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// POST /api/groups - Create a new group
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get user securely, but don't require a user
    let user = null;
    let guestToken = null;

    try {
      // Try to get authenticated user
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        user = data.user;
      } else if (process.env.NODE_ENV === 'development') {
        console.log('No authenticated user, proceeding as guest: ', error);
      }
    } catch (err) {
      console.log('Error checking user auth, proceeding as guest: ', err);
    }

    // Parse body to get group details and guest token if present
    const body = await request.json();
    const { name, description, emoji, visibility, website } = body;
    console.log('[API] Incoming group creation:', body);

    // Honeypot check
    if (website && website.length > 0) {
      console.warn('[API] Honeypot triggered:', website);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name) {
      console.warn('[API] Missing group name');
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // --- Guest group creation logic ---
    if (!user) {
      // Try to get guest token from cookies
      const cookieStore = await cookies();
      let guestToken = cookieStore.get('guest_token')?.value || null;
      let ip =
        (request.headers.get('x-forwarded-for') || '').split(',')[0] ||
        request.headers.get('x-real-ip') ||
        null;
      console.log('[API] Guest group creation:', { guestToken, ip });

      // Rate limiting for guests
      if (ip) {
        const now = Date.now();
        const rl = rateLimitMap.get(ip) || { count: 0, lastReset: now };
        if (now - rl.lastReset > RATE_LIMIT_WINDOW) {
          rl.count = 0;
          rl.lastReset = now;
        }
        rl.count++;
        rateLimitMap.set(ip, rl);
        if (rl.count > RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Too many group creations from this IP. Please try again later.' },
            { status: 429 }
          );
        }
      }

      // Generate new guest token if none exists
      if (!guestToken) {
        guestToken = crypto.randomUUID();
        cookieStore.set({
          name: 'guest_token',
          value: guestToken,
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }

      // Insert guest group (NO guest_token in groups table)
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name,
          description: description || null,
          emoji: emoji || null,
          visibility: visibility || 'private',
        })
        .select()
        .single();

      if (error) {
        console.error('[API] Error creating guest group:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Insert into group_guest_members for guest
      if (group && guestToken) {
        // Check if already present
        const { data: existing } = await supabase
          .from('group_guest_members')
          .select('id')
          .eq('group_id', group.id)
          .eq('guest_token', guestToken)
          .maybeSingle();
        if (!existing) {
          await supabase
            .from('group_guest_members')
            .insert({ group_id: group.id, guest_token: guestToken });
        }
      }

      console.log('[API] Guest group created:', group);
      return NextResponse.json({ group }, { status: 201 });
    }

    // --- Authenticated user: first try the RPC function, then fallback to direct insert if it fails ---
    try {
      // Try to use the create_group RPC function first
      const { data, error } = await supabase.rpc('create_group', {
        p_name: name,
        p_description: description || null,
        p_emoji: emoji || null,
        p_visibility: visibility || 'private',
      });

      if (error) {
        // If there's an infinite recursion error in the policy, fall back to direct insert
        if (error.message.includes('infinite recursion') || error.code === '42P17') {
          console.warn('RPC error with recursion, falling back to direct insert:', error);
          // Fallback to direct insert and then add membership
          const { data: newGroup, error: insertError } = await supabase
            .from('groups')
            .insert({
              name,
              description: description || null,
              emoji: emoji || null,
              visibility: visibility || 'private',
            })
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          // Now add the user as admin member
          const { error: memberError } = await supabase.from('group_members').insert({
            group_id: newGroup.id,
            user_id: user.id,
            role: 'admin',
            status: 'active',
          });

          if (memberError) {
            console.error('Error adding group member:', memberError);
          }

          // Return the created group with the membership
          return NextResponse.json(
            {
              group: {
                ...newGroup,
                group_members: [
                  {
                    user_id: user.id,
                    role: 'admin',
                    status: 'active',
                  },
                ],
              },
            },
            { status: 201 }
          );
        } else {
          // For other errors, pass them through
          throw error;
        }
      }

      // If RPC succeeded, fetch the newly created group with members
      const { data: newGroup, error: fetchError } = await supabase
        .from('groups')
        .select(
          `
        *,
        group_members (
          user_id,
          role,
          status
        ),
        trip_count:group_trips(count)
      `
        )
        .eq('id', data.id)
        .single();

      if (fetchError) {
        console.error('Error fetching newly created group:', fetchError);
        throw fetchError;
      }

      return NextResponse.json({ group: newGroup }, { status: 201 });
    } catch (error) {
      console.error('Error in groups POST route:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in groups POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
