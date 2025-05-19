'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';

interface UseReferralOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useReferral(options: UseReferralOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Get the current user's referral link
  const getReferralLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to get a referral link');
        return null;
      }

      const response = await fetch('/api/user/referral-link');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get referral link');
      }

      const data = await response.json();
      setReferralLink(data.referralLink);
      setExpiresAt(data.expiresAt);

      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while getting referral link');
      options.onError?.(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to get referral link',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast, options]);

  // Generate a new referral link
  const generateReferralLink = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to generate a referral link');
        return null;
      }

      const response = await fetch('/api/user/referral-link', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate referral link');
      }

      const data = await response.json();
      setReferralLink(data.referralLink);
      setExpiresAt(data.expiresAt);

      toast({
        title: 'Success',
        description: 'New referral link generated!',
      });

      options.onSuccess?.(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating referral link');
      options.onError?.(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate referral link',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast, options]);

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    if (!referralLink) {
      toast({
        title: 'Error',
        description: 'No referral link to copy',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Success',
        description: 'Referral link copied to clipboard!',
      });
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
      return false;
    }
  }, [referralLink, toast]);

  // Fetch referral link on mount if autoFetch is true
  useEffect(() => {
    if (options.autoFetch) {
      getReferralLink();
    }
  }, [options.autoFetch, getReferralLink]);

  // Get formatted expiration date
  const getFormattedExpirationDate = useCallback(() => {
    if (!expiresAt) return null;

    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      return null;
    }
  }, [expiresAt]);

  return {
    isLoading,
    error,
    referralLink,
    expiresAt,
    getReferralLink,
    generateReferralLink,
    copyReferralLink,
    getFormattedExpirationDate,
  };
}
