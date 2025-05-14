import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database'; // Make sure this is imported

// --- Types ---
interface ReferralDetailsResponse {
  referral: any;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// GET /api/invitations/referral/[token] - Get referral invitation details by token
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Invalid referral token' }, { status: 400 });
    }

    // Create a typed Supabase client
    const supabase = await createRouteHandlerClient();

    // Get referral details with proper typing
    const { data: referral, error } = await supabase
      .from('invitations')
      .select('*, inviter:profiles!inviter_id(*)')
      .eq('token', token)
      .single();

    if (error || !referral) {
      console.error('Error fetching referral:', error);
      return NextResponse.json({ error: 'Referral not found or expired' }, { status: 404 });
    }

    // Check if referral is expired
    const now = new Date();
    const expiresAt = new Date(referral.expires_at);
    if (expiresAt < now) {
      return NextResponse.json({ error: 'Referral has expired' }, { status: 404 });
    }

    // Defensive: Type guard for inviter profile
    function isInviterProfile(
      inviter: unknown
    ): inviter is { id: string; full_name?: string | null; avatar_url?: string | null } {
      return (
        inviter !== null &&
        typeof inviter === 'object' &&
        'id' in inviter &&
        typeof (inviter as any).id === 'string'
      );
    }

    // Defensive: Only use inviter if valid, else fallback
    const inviter = isInviterProfile(referral.inviter)
      ? {
          id: referral.inviter.id,
          name: referral.inviter.full_name ?? 'Someone',
          avatarUrl: referral.inviter.avatar_url ?? null,
        }
      : {
          id: '',
          name: 'Someone',
          avatarUrl: null,
        };

    // Defensive: Only use bonus if present and string, else fallback
    let bonus: string = 'Free trip upgrade';
    if (
      'bonus' in referral &&
      typeof referral.bonus === 'string' &&
      referral.bonus.trim().length > 0
    ) {
      bonus = referral.bonus;
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: referral.id,
        token: referral.token,
        expiresAt: referral.expires_at,
        inviter,
        bonus,
      },
    });
  } catch (err: unknown) {
    console.error('Error processing referral request:', err);
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 });
  }
}
