import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/tables';
import { randomBytes } from 'crypto';

// Helper to generate a referral token
function generateReferralToken() {
  return randomBytes(16).toString('hex');
}

// GET /api/user/referral-link - Get the current user's referral link
export async function GET(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to get a referral link' },
        { status: 401 }
      );
    }

    // Check if user already has a referral link
    const { data: existingReferral, error: referralError } = await supabase
      .from(TABLES.INVITATIONS)
      .select('*')
      .eq('inviter_id', user.id)
      .eq('type', 'referral')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If there's a valid existing referral, return it
    if (existingReferral && !referralError) {
      const now = new Date();
      const expiresAt = existingReferral.expires_at
        ? new Date(existingReferral.expires_at)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      if (expiresAt > now) {
        return NextResponse.json({
          referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/referral/${existingReferral.token}`,
          expiresAt: existingReferral.expires_at,
        });
      }
    }

    // Generate new referral link
    const token = generateReferralToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const { data: newReferral, error: createError } = await supabase
      .from(TABLES.INVITATIONS)
      .insert({
        email: user.email ?? '',
        expires_at: expiresAt.toISOString(),
        token,
        type: 'referral',
        invitation_status: 'pending',
        inviter_id: user.id,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating referral:', createError);
      return NextResponse.json({ error: 'Failed to create referral link' }, { status: 500 });
    }

    return NextResponse.json({
      referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/referral/${token}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error('Error generating referral link:', err);
    return NextResponse.json({ error: 'Failed to generate referral link' }, { status: 500 });
  }
}

// POST /api/user/referral-link - Regenerate the current user's referral link
export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to regenerate a referral link' },
        { status: 401 }
      );
    }

    // Invalidate any existing referral links
    await supabase
      .from(TABLES.INVITATIONS)
      .update({ status: 'expired' })
      .eq('inviter_id', user.id)
      .eq('type', 'referral');

    // Generate new referral link
    const token = generateReferralToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const { data: newReferral, error: createError } = await supabase
      .from(TABLES.INVITATIONS)
      .insert({
        email: user.email ?? '',
        expires_at: expiresAt.toISOString(),
        token,
        type: 'referral',
        invitation_status: 'pending',
        inviter_id: user.id,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('Error creating referral:', createError);
      return NextResponse.json({ error: 'Failed to create referral link' }, { status: 500 });
    }

    return NextResponse.json({
      referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/referral/${token}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error('Error regenerating referral link:', err);
    return NextResponse.json({ error: 'Failed to regenerate referral link' }, { status: 500 });
  }
}
