'use client';

import { TripPageClient } from './trip-page-client';
import { PresenceProvider } from '@/components/presence/presence-context';
import { PresenceErrorBoundary } from '@/components/presence/presence-error-boundary';
import { TripDataProvider } from './context/trip-data-provider';

// Define a proper type for the props to match TripPageClient props
interface TripPageClientWrapperProps {
  tripId: string;
  [key: string]: any; // Allow for other props from the page
}

export default function TripPageClientWrapper(props: TripPageClientWrapperProps) {
  return (
    <TripDataProvider initialData={props} tripId={props.tripId}>
      <PresenceProvider tripId={props.tripId} trackCursor={true}>
        <PresenceErrorBoundary>
          <TripPageClient {...props} />
        </PresenceErrorBoundary>
      </PresenceProvider>
    </TripDataProvider>
  );
} 