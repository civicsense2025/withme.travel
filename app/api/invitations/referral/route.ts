import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { trackServerEvent } from '@/lib/tracking';
import type { Database } from '@/utils/constants/tables.types';

// Request schema validation
const referralSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().optional(),
});

/**
 * POST /api/invitations/referral
 * Sends a referral invitation email to a friend
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = referralSchema.safeParse(body);

    if (!validationResult.success) {
      return formatErrorResponse(
        new ApiError('Invalid request data', 400, {
          errors: validationResult.error.format(),
        })
      );
    }

    const { email, message } = validationResult.data;

    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new ApiError('Unauthorized', 401));
    }

    // Get user profile for the invitation
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return formatErrorResponse(new ApiError('Failed to fetch user profile', 500));
    }

    // Generate a unique token for the invitation
    const token = nanoid(24);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Store the invitation in the database
    const invitationInsert: Database['public']['Tables']['invitations']['Insert'] = {
      email: user.email ?? '',
      expires_at: expiresAt.toISOString(),
      token,
      type: 'referral',
      invitation_status: 'pending',
      inviter_id: user.id,
      metadata: {
        message: message || '',
        sender_name: profile?.name ?? 'Someone',
        sender_avatar: profile?.avatar_url ?? null,
      },
    };
    const { data: invitation, error: invitationError } = await supabase
      .from(TABLES.INVITATIONS)
      .insert(invitationInsert)
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return formatErrorResponse(new ApiError('Failed to create invitation', 500));
    }

    // Create the invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://withme.travel';
    const inviteUrl = `${baseUrl}/invite/referral/${token}`;

    // Send the email using Plunk
    try {
      // In production, you would use Plunk's API to send the email
      // This is a placeholder for the actual implementation
      const plunkApiKey = process.env.PLUNK_API_KEY;
      const plunkBaseUrl = 'https://api.useplunk.com/v1';

      if (plunkApiKey) {
        const plunkResponse = await fetch(`${plunkBaseUrl}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${plunkApiKey}`,
          },
          body: JSON.stringify({
            to: email,
            subject: `${profile.name || 'Someone'} invited you to join withme.travel`,
            template: 'friend-invitation',
            variables: {
              inviteUrl,
              senderName: profile.name || 'Someone',
              senderAvatar: profile.avatar_url || '',
              message: message || '',
              recipientEmail: email,
            },
          }),
        });

        if (!plunkResponse.ok) {
          console.error('Plunk API error:', await plunkResponse.text());
          // Continue with the invitation even if email fails
          console.log('Email sending failed, but invitation created successfully');
        } else {
          console.log('Email sent successfully via Plunk');
        }
      } else {
        console.log('Plunk API key not configured, skipping email send');
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue with the invitation even if email fails
    }

    // Track the invitation event
    trackServerEvent('friend_invitation_sent', {
      sender_id: user.id,
      recipient_email: email,
      invitation_type: 'referral',
    });

    return NextResponse.json({
      success: true,
      data: {
        invitation: {
          id: invitation.id,
          token,
          email,
          created_at: invitation.created_at,
          expires_at: invitation.expires_at,
        },
      },
    });
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return formatErrorResponse(new ApiError('Failed to send invitation', 500));
  }
}
