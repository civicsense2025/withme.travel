/**
 * Hooks Index
 *
 * Central export point for all hooks in the application.
 * This maintains backward compatibility during migration to feature-first organization.
 */

// UI hooks
export { useToast } from '@/hooks/use-toast';

// Auth hooks
export { useAuth } from './use-auth';

// Budget/Expenses hooks
export { useExpenses } from './use-expenses';

// Groups hooks
export { useGroups } from './use-groups';
export { useGroupIdeas } from './use-group-ideas';
export { useGroupMembers } from './use-group-members';
export { useGroupPlans } from './use-group-plans';

// Tags hooks
export { useTags } from './use-tags'; 

// Activities hooks
export { useActivities } from './use-activities';

// Comments hooks
export { useComments } from './use-comments';

// Destinations hooks
export { useDestinations } from './use-destinations';
export { usePopularDestinations } from './use-popular-destinations';

// Trips hooks
export { useLogistics } from './use-logistics';
export { useItineraries } from './use-itineraries';
export { useTripMembers } from './use-trip-members';
export { usePermissions } from './use-permissions';
export { useItinerary } from './use-itinerary';
export { useNotes } from './use-notes';
export { useTripBudget } from './use-trip-budget';
export { useTripPresence } from './use-trip-presence';
export { useTripMutations } from './use-trip-mutations';
export { useTripItinerary } from './use-trip-itinerary';

// Places hooks
export { usePlaces } from '@/lib/features/places/hooks/use-places';

// Tasks hooks
export { useTasks } from './use-tasks';

// Votes hooks
export { useVotes } from './use-votes';

// Maps and Cities hooks
export { useMaps } from './use-maps';
export { useCities } from './use-cities';

// Shared/UI hooks
export { useMediaQuery } from './use-media-query';
export { useMobileDialog } from './use-mobile-dialog';
export { default as useOgImage } from './use-og-image'; 