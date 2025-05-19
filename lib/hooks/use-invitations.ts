/**
 * Hook for managing invitations
 */

import { useState } from 'react';
import * as invitationClient from '@/lib/client/invitations';
import { isSuccess } from '@/lib/client/result';
import { useToast } from './use-toast';

interface UseInvitationsResult {
  isLoading: boolean;
  error: string | null;
  sendReferralInvite: (email: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<boolean>;
}

/**
 * Hook for managing invitations
 */
export function useInvitations(): UseInvitationsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sendReferralInvite = async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationClient.sendReferralInvite(email);
      
      if (isSuccess(result)) {
        toast({
          title: 'Invitation sent',
          description: `We've sent an invitation to ${email}`,
        });
        return true;
      } else {
        setError(result.error);
        toast({
          title: 'Failed to send invitation',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Failed to send invitation',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await invitationClient.acceptInvitation(token);
      
      if (isSuccess(result)) {
        toast({
          title: 'Invitation accepted',
          description: 'You have joined the group',
        });
        return true;
      } else {
        setError(result.error);
        toast({
          title: 'Failed to accept invitation',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Failed to accept invitation',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    sendReferralInvite,
    acceptInvitation,
  };
} 