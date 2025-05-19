'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';

interface UseInvitationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useInvitation(options: UseInvitationOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch invitation data by token and type
  const fetchInvitation = useCallback(
    async (token: string, type?: 'trip' | 'group' | 'referral') => {
      setIsLoading(true);
      setError(null);

      try {
        // Different endpoints for different invitation types
        let url = `/api/invitations/${token}`;
        if (type === 'group') {
          url = `/api/invitations/group/${token}`;
        } else if (type === 'referral') {
          url = `/api/invitations/referral/${token}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch invitation');
        }

        const data = await response.json();
        setInvitation(data.invitation || data.referral || data);
        return data;
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching invitation');
        options.onError?.(err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to load invitation details',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, options]
  );

  // Accept a trip invitation
  const acceptTripInvitation = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Save the token to localStorage to process after login
          localStorage.setItem(
            'pendingInvitation',
            JSON.stringify({
              type: 'trip',
              token,
            })
          );

          // Redirect to login
          router.push(`/login?redirectTo=/invite/${token}`);
          return;
        }

        const response = await fetch(`/api/invitations/${token}/accept`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to accept invitation');
        }

        const data = await response.json();
        toast({
          title: 'Success',
          description: 'You have joined the trip!',
        });

        options.onSuccess?.(data);
        return data;
      } catch (err: any) {
        setError(err.message || 'An error occurred while accepting invitation');
        options.onError?.(err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to accept invitation',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router, toast, options]
  );

  // Accept a group invitation
  const acceptGroupInvitation = useCallback(
    async (token: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          // Save the token to localStorage to process after login
          localStorage.setItem(
            'pendingInvitation',
            JSON.stringify({
              type: 'group',
              token,
            })
          );

          // Redirect to login
          router.push(`/login?redirectTo=/invite/group/${token}`);
          return;
        }

        const response = await fetch(`/api/invitations/group/${token}/accept`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to accept group invitation');
        }

        const data = await response.json();
        toast({
          title: 'Success',
          description: 'You have joined the group!',
        });

        options.onSuccess?.(data);
        return data;
      } catch (err: any) {
        setError(err.message || 'An error occurred while accepting group invitation');
        options.onError?.(err);
        toast({
          title: 'Error',
          description: err.message || 'Failed to accept group invitation',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, router, toast, options]
  );

  // Check if there's a pending invitation after login/signup
  const checkPendingInvitation = useCallback(async () => {
    const pendingInviteJson = localStorage.getItem('pendingInvitation');
    if (!pendingInviteJson) return;

    try {
      const pendingInvite = JSON.parse(pendingInviteJson);

      if (pendingInvite.type === 'trip' && pendingInvite.token) {
        await acceptTripInvitation(pendingInvite.token);
      } else if (pendingInvite.type === 'group' && pendingInvite.token) {
        await acceptGroupInvitation(pendingInvite.token);
      }

      // Clear the pending invitation
      localStorage.removeItem('pendingInvitation');
    } catch (err) {
      console.error('Error processing pending invitation:', err);
    }
  }, [acceptTripInvitation, acceptGroupInvitation]);

  return {
    isLoading,
    error,
    invitation,
    fetchInvitation,
    acceptTripInvitation,
    acceptGroupInvitation,
    checkPendingInvitation,
  };
}
