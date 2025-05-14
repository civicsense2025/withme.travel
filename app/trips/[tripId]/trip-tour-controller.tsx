'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
// TODO: Replace 'any' with the correct import from 'onborda' if available
// import { useTour } from 'onborda';
const useTour: any = () => ({ startTour: () => {} }); // fallback for linter
// Import tripPlanningTour from the onboarding tours
import { tripPlanningTour } from '../../lib/onboarding/tours/trip-planning-tour';

interface TripTourControllerProps {
  tripId?: string;
}

/**
 * TripTourController - Manages guided tours for the trip page
 *
 * This component will initialize and control guided tours for different
 * parts of the trip interface. Currently a placeholder until the full
 * tour system is implemented.
 */
const TripTourController: FC<TripTourControllerProps> = ({ tripId }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tourActive, setTourActive] = useState(false);
  const showTour = searchParams?.get('tour') === 'true';

  // Start the tour if requested via URL param
  useEffect(() => {
    if (showTour && !tourActive) {
      console.log('Starting trip tour based on URL parameter');
      setTourActive(true);
      // When tour system is implemented, call the start method here
      // startTour(tripPlanningTour);
    }
  }, [showTour, tourActive]);

  // This will be used to check if we should automatically start a tour
  useEffect(() => {
    // This is a placeholder for future tour implementation
    // We'll detect if this is a new trip or if the user has never
    // seen this feature before and then initiate the appropriate tour

    // For now, just log that the controller is mounted
    console.log('Trip Tour Controller mounted for trip:', tripId);

    return () => {
      // Clean up any active tours on unmount
      if (tourActive) {
        console.log('Cleaning up active tour');
        setTourActive(false);
      }
    };
  }, [tripId, pathname, tourActive]);

  // Handle tour completion
  const handleTourComplete = useCallback(() => {
    setTourActive(false);
    // Save completion status to localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`tour-completed-trip-planning`, 'true');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

// Export both as named export and default export to support both import styles
export { TripTourController };
export default TripTourController;
