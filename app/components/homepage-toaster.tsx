'use client';

import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function HomePageToaster() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('justLoggedOut') === '1') {
      toast({ title: 'Successfully logged out', variant: 'destructive' });
      // Remove the param from the URL (replaceState to avoid extra navigation)
      const params = new URLSearchParams(window.location.search);
      params.delete('justLoggedOut');
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, toast]);

  return null;
}
