'use client';

import { useEffect, useState } from 'react';
import { TripPageClient } from './trip-page-client';
import { ClassErrorBoundary } from '@/components/error-boundary';
import { TripPageError } from '@/components/trips/trip-page-error';
import { TripDataProvider } from './context/trip-data-provider';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';

// Define the type for TripData
interface TripData {
  trip: {
    id: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    created_by: string;
    privacy_setting: 'private' | 'shared_with_link' | 'public';
    destination_id?: string | null;
    cover_image_url?: string | null;
    destination?: {
      id: string;
      name: string;
      latitude?: number | null;
      longitude?: number | null;
    } | null;
    budget?: number | null;
    slug?: string | null;
    playlist_url?: string | null;
    [key: string]: any; // Allow for additional fields
  };
  userRole: 'admin' | 'editor' | 'viewer' | null;
  canEdit: boolean;
  members?: any[];
  sections?: any[];
  unscheduledItems?: any[];
  manualExpenses?: any[];
  tags?: any[];
}

// Helper function to calculate the duration in days between two dates, inclusive
function getDurationDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

export default function TripPageClientWrapper({
  tripId,
  canEdit,
}: {
  tripId: string;
  canEdit: boolean;
}) {
  const [hydrated, setHydrated] = useState(false);

  // Ensure we're hydrated on the client
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Return a simple loading state until hydrated
  if (!hydrated) {
    return <div className="p-4">Loading...</div>; // Simplified initial loading
  }

  return (
    <ClassErrorBoundary fallback={<TripPageError tripId={tripId} />} section="trip-page-client">
      <TripDataProvider tripId={tripId}>
        <TripPageClient tripId={tripId} canEdit={canEdit} />
      </TripDataProvider>
    </ClassErrorBoundary>
  );
}
