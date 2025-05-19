/**
 * Invitations API client
 * 
 * Client-side functions for managing invitations
 */

import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';

/**
 * Send a referral invitation to an email address
 * 
 * @param email - Email address to send invitation to
 * @returns Result with success or failure
 */
export async function sendReferralInvite(email: string): Promise<Result<boolean>> {
  const fetchInvitation = async (): Promise<boolean> => {
    const response = await fetch('/api/invitations/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send invitation');
    }

    return true;
  };

  return tryCatch(fetchInvitation());
}

/**
 * Accept an invitation
 * 
 * @param token - Invitation token
 * @returns Result with success or failure
 */
export async function acceptInvitation(token: string): Promise<Result<boolean>> {
  const acceptInvite = async (): Promise<boolean> => {
    const response = await fetch(`/api/invitations/accept/${token}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept invitation');
    }

    return true;
  };

  return tryCatch(acceptInvite());
} 