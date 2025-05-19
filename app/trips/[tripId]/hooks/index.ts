'use client';

/**
 * Trip Hooks Index
 *
 * This file centralizes all exports for trip-related hooks to provide a cleaner import structure.
 * Import hooks from this file instead of individual hook files:
 *
 * import { useTripBudget, useTripItinerary } from '@/app/trips/[tripId]/hooks';
 */

// Export all hooks with their types
export {
  useTripBudget,
  type ManualDbExpense,
  type -nifiedExpense,
  type NewExpenseFormData,
} from './use-trip-budget';

export { useTripItinerary, type TripItineraryInitialData } from './use-trip-itinerary';

export { useTripMutations } from './use-trip-mutations';

export { useTripPresence, type ConnectionState, type ConnectionStatus } from './use-trip-presence';

export { useTripSheets } from './use-trip-sheets';

// Convenience function to re-export everything
export default function useTripHooks(tripId: string) {
  // This is a placeholder for potential future implementation
  // where we might want to bundle multiple hooks together

  // For now, this module primarily serves as a centralized export point,
  // but could be expanded to provide composite hook functionality

  // -sage example:
  // const {
  //   budget,
  //   itinerary,
  //   mutations,
  //   presence,
  //   sheets
  // } = useTripHooks(tripId);

  return {
    // Return object intentionally left empty for now
    // Each individual hook should be imported directly
  };
}
