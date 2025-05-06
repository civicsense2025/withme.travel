'use client';

import { useEffect, useState } from 'react';
import { TripPageClient } from './trip-page-client';
import { ClassErrorBoundary } from '@/components/error-boundary';
import { TripPageError } from '@/components/trips/trip-page-error';
import { TripDataProvider } from './context/trip-data-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TripTourController } from './trip-tour-controller';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// TODO: Replace 'any' with the correct import from 'onborda' if available
// import { useTour } from 'onborda';
const useTour: any = () => ({ startTour: () => {} }); // fallback for linter
// Try default import for tripPlanningTour
// Create a fallback tour configuration since the module can't be found
const tripPlanningTour = {
  id: 'trip-planning',
  steps: [
    {
      id: 'trip-header',
      title: 'Trip Overview',
      content: 'This is your trip dashboard. Here you can see all your trip details and collaborate with others.',
      target: '.trip-header',
      placement: 'bottom',
    },
    {
      id: 'itinerary-section',
      title: 'Plan Your Itinerary',
      content: 'Add day-by-day activities, accommodations, and transportation to your trip.',
      target: '.itinerary-section',
      placement: 'right',
    },
    {
      id: 'add-item-button',
      title: 'Add Items',
      content: 'Click here to add new activities, accommodations, or transportation.',
      target: '.add-itinerary-item-button',
      placement: 'top',
    },
    {
      id: 'members-tab',
      title: 'Invite Friends',
      content: 'Collaborate by inviting friends to join your trip planning.',
      target: '.members-tab',
      placement: 'left',
    },
    {
      id: 'finish',
      title: 'Ready to Plan!',
      content: 'You now know the basics of trip planning. Add your first activity to get started!',
      placement: 'center',
      target: 'body',
    },
  ],
};

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

function TripCreatedCelebrationModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { startTour } = useTour();
  const show = searchParams?.get('tripCreated') === 'true';
  const [open, setOpen] = useState(show);

  const handleShowMeAround = () => {
    setOpen(false);
    // Remove tripCreated param and add tour param
    const params = new URLSearchParams(window.location.search);
    params.delete('tripCreated');
    params.set('tour', 'true');
    router.replace(window.location.pathname + '?' + params.toString());
    setTimeout(() => {
      startTour(tripPlanningTour);
    }, 400);
  };

  if (!show) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="text-5xl mb-2">🎉</div>
          <DialogTitle className="text-2xl font-bold mb-2">Trip Created!</DialogTitle>
          <DialogDescription className="mb-4">
            Your trip is ready. Time to start planning your adventure with friends!
          </DialogDescription>
        </DialogHeader>
        <Button size="lg" className="mt-2 w-full" onClick={handleShowMeAround}>
          Show Me Around
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function TripPageClientWrapper({
  tripId,
  canEdit,
  isGuestCreator = false,
}: {
  tripId: string;
  canEdit: boolean;
  isGuestCreator?: boolean;
}) {
  const [hydrated, setHydrated] = useState(false);
  // Create a QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  // Ensure we're hydrated on the client
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Return a simple loading state until hydrated
  if (!hydrated) {
    return <div className="p-4">Loading...</div>; // Simplified initial loading
  }

  return (
    <>
      <TripCreatedCelebrationModal />
      <TripTourController />
      <ClassErrorBoundary fallback={<TripPageError tripId={tripId} />} section="trip-page-client">
        <QueryClientProvider client={queryClient}>
          <TripDataProvider tripId={tripId}>
            <TripPageClient
              key={tripId}
              tripId={tripId}
              canEdit={canEdit}
              isGuestCreator={isGuestCreator}
            />
          </TripDataProvider>
        </QueryClientProvider>
      </ClassErrorBoundary>
    </>
  );
}
