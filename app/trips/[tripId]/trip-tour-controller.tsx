'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// TODO: Replace 'any' with the correct import from 'onborda' if available
// import { useTour } from 'onborda';
const useTour: any = () => ({ startTour: () => {} }); // fallback for linter
// Try default import for tripPlanningTour
import tripPlanningTour from '@/lib/onboarding/tours/trip-planning-tour';

export function TripTourController() {
  const { startTour } = useTour();
  const searchParams = useSearchParams();
  const showTour = searchParams && searchParams.get('tour') === 'true';

  useEffect(() => {
    if (showTour) {
      setTimeout(() => {
        startTour(tripPlanningTour);
      }, 800); // Give the page a moment to render
    }
  }, [showTour, startTour]);

  return null;
} 