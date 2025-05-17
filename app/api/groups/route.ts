import { NextResponse } from 'next/server';
import { getUserGroups, createGroupWithMembership, createGuestGroup } from '@/lib/api/groups';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// --- Types ---
interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// In-memory rate limit store (MVP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // max 5 per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

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

    // Use centralized API to get user groups
    const result = await getUserGroups(userId, {
      search: searchQuery,
      limit,
      offset,
      includeMembers: true,
      includeTripCount: true,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ groups: result.data });
  } catch (error) {
    console.error('Error in groups GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      const cookieStore = cookies();
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

      // Use centralized API to create guest group
      const result = await createGuestGroup(
        {
          name,
          description: description || null,
          emoji: emoji || null,
          visibility: visibility || 'private',
        },
        guestToken
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ group: result.data }, { status: 201 });
    }

    // --- Authenticated user: use centralized API for group creation with membership ---
    const result = await createGroupWithMembership(
      {
        name,
        description: description || null,
        emoji: emoji || null,
        visibility: visibility || 'private',
      },
      user.id
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        group: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in groups POST route:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: String(error) },
      { status: 500 }
    );
  }
}
