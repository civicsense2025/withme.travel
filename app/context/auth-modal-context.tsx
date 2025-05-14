'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

// Define all possible contexts for the auth modal
export type AuthModalContext =
  | 'default'
  | 'join-group'
  | 'create-group'
  | 'save-trip'
  | 'like-trip'
  | 'comment'
  | 'edit-trip'
  | 'invite-friends'
  | 'premium-feature'
  | 'vote-on-idea'
  | 'create-itinerary'
  | 'add-to-itinerary';

// A/B testing variants
export type ABTestVariant = 'control' | 'variant-a' | 'variant-b';

// Interface for the auth modal state
interface AuthModalState {
  isOpen: boolean;
  context: AuthModalContext;
  abTestVariant: ABTestVariant;
  redirectPath: string | null;
  extraData?: Record<string, any>;
}

// Interface for the auth modal context
interface AuthModalContextType extends AuthModalState {
  open: (
    context?: AuthModalContext,
    redirectPath?: string,
    extraData?: Record<string, any>
  ) => void;
  close: () => void;
  setABTestVariant: (variant: ABTestVariant) => void;
  trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
}

// Create the auth modal context
const AuthModalContext = createContext<AuthModalContextType>({
  isOpen: false,
  context: 'default',
  abTestVariant: 'control',
  redirectPath: null,
  open: () => {},
  close: () => {},
  setABTestVariant: () => {},
  trackEvent: () => {},
});

// Custom hook to use the auth modal context
export const useAuthModal = () => useContext(AuthModalContext);

interface AuthModalProviderProps {
  children: React.ReactNode;
  initialABTestVariant?: ABTestVariant;
}

export function AuthModalProvider({
  children,
  initialABTestVariant = 'control',
}: AuthModalProviderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for the auth modal
  const [state, setState] = useState<AuthModalState>({
    isOpen: false,
    context: 'default',
    abTestVariant: initialABTestVariant,
    redirectPath: null,
  });

  // Check for URL params that might trigger the auth modal
  useEffect(() => {
    if (!searchParams) return;

    const showAuth = searchParams.get('auth');
    const authContext = searchParams.get('authContext') as AuthModalContext | null;

    if (showAuth === 'true' && !user) {
      setState((prev) => ({
        ...prev,
        isOpen: true,
        context: authContext || 'default',
        redirectPath: pathname,
      }));

      // Clean URL by removing the auth parameters
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('auth');
      newParams.delete('authContext');

      const newPathname = pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
      router.replace(newPathname);
    }
  }, [searchParams, pathname, router, user]);

  // Close the modal if the user is authenticated
  useEffect(() => {
    if (user && state.isOpen) {
      setState((prev) => ({ ...prev, isOpen: false }));
    }
  }, [user, state.isOpen]);

  // Function to open the auth modal
  const open = useCallback(
    (
      context: AuthModalContext = 'default',
      redirectPath: string | null = pathname,
      extraData?: Record<string, any>
    ) => {
      setState((prev) => ({
        ...prev,
        isOpen: true,
        context,
        redirectPath,
        extraData,
      }));

      // Track modal open event
      trackEvent('auth_modal_open', {
        context,
        abTestVariant: state.abTestVariant,
        path: pathname,
      });
    },
    [pathname, state.abTestVariant]
  );

  // Function to close the auth modal
  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));

    // Track modal close event
    trackEvent('auth_modal_close', {
      context: state.context,
      abTestVariant: state.abTestVariant,
      path: pathname,
    });
  }, [pathname, state.context, state.abTestVariant]);

  // Function to set the A/B test variant
  const setABTestVariant = useCallback((variant: ABTestVariant) => {
    setState((prev) => ({ ...prev, abTestVariant: variant }));

    // Persist the variant in localStorage for consistent experience
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_modal_ab_variant', variant);
    }

    // Track variant assignment
    trackEvent('ab_test_variant_assigned', { variant });
  }, []);

  // Function to track events (analytics)
  const trackEvent = useCallback((eventName: string, eventData?: Record<string, any>): void => {
    // Log to console during development
    console.log(`[AuthModal Analytics] ${eventName}`, eventData);

    // TODO: Replace with your actual analytics implementation
    // Example: gtag('event', eventName, eventData);
    // Example: posthog.capture(eventName, eventData);

    // Send to admin dashboard - this would connect to an API endpoint
    if (process.env.NODE_ENV === 'production') {
      try {
        fetch('/api/admin/analytics/auth-modal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventName, data: eventData }),
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        console.error('Failed to send analytics event', err);
      }
    }
  }, []);

  // Load A/B test variant from localStorage on initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVariant = localStorage.getItem('auth_modal_ab_variant') as ABTestVariant | null;
      if (savedVariant) {
        setState((prev) => ({ ...prev, abTestVariant: savedVariant }));
      } else {
        // Randomly assign a variant if none exists (simple A/B testing)
        const variants: ABTestVariant[] = ['control', 'variant-a', 'variant-b'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        setABTestVariant(randomVariant);
      }
    }
  }, [setABTestVariant]);

  // Create the context value
  const contextValue = useMemo(
    () => ({
      ...state,
      open,
      close,
      setABTestVariant,
      trackEvent,
    }),
    [state, open, close, setABTestVariant, trackEvent]
  );

  return <AuthModalContext.Provider value={contextValue}>{children}</AuthModalContext.Provider>;
}
