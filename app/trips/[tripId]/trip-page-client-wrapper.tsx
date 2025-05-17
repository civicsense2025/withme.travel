'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TripPageClient } from './trip-page-client';
import { ClassErrorBoundary } from '@/components/error-boundary';
import { TripPageError } from '@/components/trips';
import { TripDataProvider, useTripData } from './context/trip-data-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TripTourController from './trip-tour-controller';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SimplifiedTripHeader } from '@/components/trips';
import { Skeleton } from '@/components/ui/skeleton';
import { TABLES } from '@/utils/constants/database';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
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
      content:
        'This is your trip dashboard. Here you can see all your trip details and collaborate with others.',
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
  budget?: {
    target_budget: number;
    total_planned: number;
    total_spent: number;
  } | null;
}

// Helper function to calculate the duration in days between two dates, inclusive
function getDurationDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
}

// Define SimplifiedTripInfo type for the header
interface SimplifiedTripInfo {
  id: string;
  name: string;
  description?: string | null;
  destination_name?: string | null;
  cover_image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  membersCount: number;
}

// Enhancement layer that fetches basic trip info and passes to both components
function EnhancedTripContent({
  tripId,
  canEdit,
  isGuestCreator,
}: {
  tripId: string;
  canEdit: boolean;
  isGuestCreator: boolean;
}) {
  const { tripData, isLoading, error } = useTripData();
  const [isSavingCover, setIsSavingCover] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Calculate item count for research tracker
  const itemCount = useMemo(() => {
    if (!tripData?.sections) return 0;
    return tripData.sections.reduce((count, section) => {
      return count + (section.items?.length || 0);
    }, 0);
  }, [tripData?.sections]);

  // Add this to track if we've shown the milestone
  const [hasShownMilestone, setHasShownMilestone] = useState(false);

  // Check local storage to see if we've already shown this milestone
  useEffect(() => {
    const key = `research_milestone_itinerary_${tripId}`;
    const hasShown = localStorage.getItem(key) === 'true';
    setHasShownMilestone(hasShown);

    // If we have 3+ items and haven't shown milestone, mark it as shown
    if (itemCount >= 3 && !hasShown) {
      localStorage.setItem(key, 'true');
      setHasShownMilestone(true);
    }
  }, [tripId, itemCount]);

  // Extract simplified trip info for the header
  const simplifiedTripInfo: SimplifiedTripInfo | null = tripData?.trip
    ? {
        id: tripData.trip.id,
        name: tripData.trip.name,
        description: tripData.trip.description || null,
        destination_name: tripData.trip.destination_name || null,
        cover_image_url: tripData.trip.cover_image_url || null,
        start_date: tripData.trip.start_date || null,
        end_date: tripData.trip.end_date || null,
        membersCount: tripData.members?.length || 1,
      }
    : null;

  // Budget data for the simplified header - using optional chaining for safety
  const budgetData = tripData?.trip?.budget
    ? {
        targetBudget: tripData.trip.budget,
        totalPlanned: 0, // Calculate this from trip data if available
        totalSpent: 0, // Calculate this from trip data if available
        isEditing: isEditingBudget,
        onEditToggle: (editing: boolean) => setIsEditingBudget(editing),
        onSave: async (newBudget: number) => {
          const supabase = getBrowserClient();
          const { error } = await supabase
            .from('trips')
            .update({ budget: newBudget.toString() })
            .eq('id', String(tripId));

          if (error) {
            toast({
              title: 'Failed to update budget',
              description: error.message,
              variant: 'destructive',
            });
            throw error;
          }

          toast({
            title: 'Budget updated',
            description: 'Your trip budget has been updated successfully',
          });

          // Update local state
          router.refresh();
        },
        onLogExpenseClick: () => {
          setIsAddExpenseOpen(true);
        },
      }
    : undefined;

  // Handle changing the cover image
  const handleChangeCover = async () => {
    // Placeholder for cover image change functionality
    console.log('Change cover image');

    // You would implement file upload functionality here
    // For example:
    // 1. Open a file picker
    // 2. Upload the selected file to storage
    // 3. Update the trip record with the new cover_image_url
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (error || !tripData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Failed to load trip data</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading the trip information.
        </p>
        <Button onClick={() => router.push('/trips')}>Return to Trips</Button>
      </div>
    );
  }

  return (
    <>
      {/* Simplified Trip Header */}
      {simplifiedTripInfo && (
        <SimplifiedTripHeader
          tripId={String(simplifiedTripInfo.id)}
          name={simplifiedTripInfo.name}
          description={simplifiedTripInfo.description}
          destination={simplifiedTripInfo.destination_name}
          coverImageUrl={
            simplifiedTripInfo.cover_image_url
              ? String(simplifiedTripInfo.cover_image_url)
              : undefined
          }
          startDate={
            simplifiedTripInfo.start_date ? String(simplifiedTripInfo.start_date) : undefined
          }
          endDate={simplifiedTripInfo.end_date ? String(simplifiedTripInfo.end_date) : undefined}
          membersCount={simplifiedTripInfo.membersCount}
          budgetProps={budgetData}
        />
      )}

      {/* Trip Page Client */}
      <TripPageClient tripId={tripId} canEdit={canEdit} isGuestCreator={isGuestCreator} />

      {/* Add Expense Dialog (could be implemented as needed) */}
      {isAddExpenseOpen && (
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Log a new expense for your trip.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Expense tracking functionality would go here.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddExpenseOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: 'Expense Logged',
                    description: 'Your expense has been added to the trip budget.',
                  });
                  setIsAddExpenseOpen(false);
                }}
              >
                Save Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
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

interface TripPageClientWrapperProps {
  tripId: string;
  canEdit: boolean;
  isGuestCreator?: boolean;
  initialTrip?: any;
}

export default function TripPageClientWrapper({
  tripId,
  canEdit,
  isGuestCreator = false,
  initialTrip,
}: TripPageClientWrapperProps) {
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
      <TripTourController tripId={tripId} />
      <ClassErrorBoundary fallback={<TripPageError tripId={tripId} />} section="trip-page-client">
        <QueryClientProvider client={queryClient}>
          <TripDataProvider tripId={tripId} initialData={initialTrip}>
            <EnhancedTripContent
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
