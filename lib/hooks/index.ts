/**
 * Hooks Index
 *
 * Central export point for all hooks in the application.
 * This maintains backward compatibility during migration to feature-first organization.
 */

// UI hooks
export { useToast } from '@/components/ui/use-toast';

// Auth hooks
export { useAuth } from './use-auth';

// Budget/Expenses hooks
export { useExpenses } from '../features/budget/hooks/use-expenses';

// Groups hooks
export { useGroups } from './use-groups';
export { useGroupIdeas } from './use-group-ideas';
export { useGroupMembers } from './use-group-members';
export { useGroupPlans } from './use-group-plans';

// Tags hooks
export { useTags } from '../features/tags/hooks/use-tags'; 

// Activities hooks
export { useActivities } from './use-activities';

// Comments hooks
export { useComments } from './use-comments';

// Destinations hooks
// TODO: Import from feature directory once migration is complete
export { useDestinations } from './use-destinations';
export { usePopularDestinations } from './use-popular-destinations';

// Trips hooks
export { useLogistics } from '../features/trips/hooks/use-logistics';
export { useItineraries } from './use-itineraries';
export { useTripMembers } from './use-trip-members';
export { usePermissions } from './use-permissions';

// Places hooks
export { usePlaces } from './use-places';

// Tasks hooks
export { useTasks } from './use-tasks';

// Shared/UI hooks
export { useMediaQuery } from './use-media-query';
export { useMobileDialog } from './use-mobile-dialog';
export { default as useOgImage } from './use-og-image'; 