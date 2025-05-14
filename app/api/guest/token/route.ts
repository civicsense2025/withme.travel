import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create guest token for non-authenticated users
 * POST /api/guest/token
 */
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();
    const cookieStore = await cookies();

    // Check if there's an existing token in the cookies
    let guestToken = cookieStore.get('guest_token')?.value;

    // If there's no token, generate a new one
    if (!guestToken) {
      guestToken = uuidv4();

      // Set the token in cookies, expires in 30 days
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

    // Get the guest metadata if submitted in the request
    const { name, email, avatar_url } = await request.json();

    // Store guest metadata in response
    const guestInfo = {
      token: guestToken,
      name: name || `Guest-${guestToken.substring(0, 6)}`,
      email: email || null,
      avatar_url: avatar_url || null,
    };

    // Set the guest_token application setting in Supabase
    await supabase.rpc('set_app_setting', {
      setting_name: 'app.guest_token',
      setting_value: guestToken,
    });

    return NextResponse.json({
      success: true,
      guest: guestInfo,
    });
  } catch (error) {
    console.error('Error creating guest token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest token' },
      { status: 500 }
    );
  }
}

/**
 * Get current guest token
 * GET /api/guest/token
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = await createRouteHandlerClient();

    // Check if there's an existing token in the cookies
    const guestToken = cookieStore.get('guest_token')?.value;

    if (!guestToken) {
      return NextResponse.json({
        success: false,
        error: 'No guest token found',
      });
    }

    // Set the guest_token application setting in Supabase
    await supabase.rpc('set_app_setting', {
      setting_name: 'app.guest_token',
      setting_value: guestToken,
    });

    // Return the guest token
    return NextResponse.json({
      success: true,
      guest: {
        token: guestToken,
        name: `Guest-${guestToken.substring(0, 6)}`,
      },
    });
  } catch (error) {
    console.error('Error retrieving guest token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve guest token' },
      { status: 500 }
    );
  }
}

/**
 * Update guest information
 * PUT /api/guest/token
 */
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createRouteHandlerClient();

    // Check if there's an existing token in the cookies
    const guestToken = cookieStore.get('guest_token')?.value;

    if (!guestToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No guest token found',
        },
        { status: 404 }
      );
    }

    // Get the updated guest metadata
    const { name, email, avatar_url } = await request.json();

    // Set the guest_token application setting in Supabase
    await supabase.rpc('set_app_setting', {
      setting_name: 'app.guest_token',
      setting_value: guestToken,
    });

    // Return the updated guest info
    return NextResponse.json({
      success: true,
      guest: {
        token: guestToken,
        name: name || `Guest-${guestToken.substring(0, 6)}`,
        email: email || null,
        avatar_url: avatar_url || null,
      },
    });
  } catch (error) {
    console.error('Error updating guest info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest information' },
      { status: 500 }
    );
  }
}
