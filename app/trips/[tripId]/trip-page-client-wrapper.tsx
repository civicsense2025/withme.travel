'use client';

import { useState, useEffect } from 'react';
import { TripPageClient, TripPageClientProps } from './trip-page-client';
import { PresenceProvider } from '@/components/presence/presence-context';
import { PresenceErrorBoundary } from '@/components/presence/presence-error-boundary';
import { TripDataProvider } from './context/trip-data-provider';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TripRole } from '@/utils/constants';

// Define a proper type for the props to match TripPageClient props
interface TripPageClientWrapperProps extends Partial<TripPageClientProps> {
  tripId: string;
}

export default function TripPageClientWrapper(props: TripPageClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<{ [key: string]: Error | null }>({});
  const [retryCount, setRetryCount] = useState(0);

  // Provide default values for required props
  const defaultProps: TripPageClientProps = {
    tripId: props.tripId,
    tripName: props.tripName || 'Unnamed Trip',
    tripDescription: props.tripDescription || null,
    startDate: props.startDate || null,
    endDate: props.endDate || null,
    tripDurationDays: props.tripDurationDays || null,
    coverImageUrl: props.coverImageUrl || null,
    destinationId: props.destinationId || null,
    initialMembers: props.initialMembers || [],
    initialSections: props.initialSections || [],
    initialUnscheduledItems: props.initialUnscheduledItems || [],
    initialManualExpenses: props.initialManualExpenses || [],
    userRole: props.userRole || null,
    canEdit: props.canEdit || false,
    isTripOver: props.isTripOver || false,
    initialTripBudget: props.initialTripBudget || null,
    initialTags: props.initialTags || [],
    slug: props.slug || null,
    privacySetting: props.privacySetting || 'private',
  };

  // Handle API errors globally for this component
  useEffect(() => {
    const handleApiError = (event: ErrorEvent) => {
      // Only handle API errors
      if (event.message && (
          event.message.includes('API') || 
          event.message.includes('/api/') ||
          event.message.includes('network') ||
          event.message.includes('fetch')
        )) {
        // Store the error by API path or generic error if no path identified
        const errorKey = event.message.match(/\/api\/[^\s:]*/)?.[0] || 'general';
        setApiErrors(prev => ({ ...prev, [errorKey]: new Error(event.message) }));
      }
    };

    // Add event listener for errors
    window.addEventListener('error', handleApiError);

    // Clean up listener
    return () => {
      window.removeEventListener('error', handleApiError);
    };
  }, []);

  const handleRetryAll = () => {
    setIsLoading(true);
    setApiErrors({});
    // Increment retry count to force a refresh of components
    setRetryCount(prev => prev + 1);
    
    // Give time for loading state to show
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Show error if we have too many errors
  const errorCount = Object.keys(apiErrors).length;
  
  if (errorCount > 2 && !isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>API Connection Issues</AlertTitle>
          <AlertDescription>
            <p className="mb-4">Some trip data couldn't be loaded due to API connection issues. This may be a temporary problem.</p>
            <Button onClick={handleRetryAll} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Loading
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TripDataProvider initialData={props} tripId={props.tripId}>
      <PresenceProvider tripId={props.tripId} trackCursor={true}>
        <PresenceErrorBoundary>
          <TripPageClient {...defaultProps} key={`trip-page-${retryCount}`} />
        </PresenceErrorBoundary>
      </PresenceProvider>
    </TripDataProvider>
  );
} 