import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { TABLES } from '@/utils/constants/database';

// GET /api/invitations/referral/[token] - Get referral invitation details by token
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid referral token' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Get referral details
    const { data: referral, error } = await supabase
      .from(TABLES.REFERRALS)
      .select('*, inviter:profiles!inviter_id(*)')
      .eq('token', token)
      .single();

    if (error || !referral) {
      console.error('Error fetching referral:', error);
      return NextResponse.json(
        { error: 'Referral not found or expired' },
        { status: 404 }
      );
    }

    // Check if referral is expired
    const now = new Date();
    const expiresAt = new Date(referral.expires_at);
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'Referral has expired' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedReferral = {
      id: referral.id,
      token: referral.token,
      expiresAt: referral.expires_at,
      inviter: {
        id: referral.inviter.id,
        name: referral.inviter.full_name || 'Someone',
        avatarUrl: referral.inviter.avatar_url || null,
      },
      bonus: referral.bonus || 'Free trip upgrade',
    };

    return NextResponse.json({ referral: formattedReferral });
  } catch (err: any) {
    console.error('Error processing referral request:', err);
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    );
  }
} 