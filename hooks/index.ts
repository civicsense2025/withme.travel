/**
 * Hooks Export Index
 *
 * Central export point for all hooks in the application.
 */

// UI Hooks
export { useToast } from './use-toast';
export { useMediaQuery } from '@/lib/hooks/use-media-query'; 
export { useMobileDialog } from '@/lib/hooks/use-mobile-dialog';
export { useFocusSession } from '@/lib/hooks/use-focus-session';
export { default as useOgImage } from '@/lib/hooks/use-og-image';

// Trip and Planning Hooks
export { useTrips } from './use-trips';
export { usePlaces } from '@/lib/features/places/hooks/use-places';
export { useExpenses } from '@/lib/hooks/use-expenses';
export { usePermissions } from '@/lib/hooks/use-permissions';
export { useTripMembers } from '@/lib/hooks/use-trip-members';
export { useDestinations } from '@/lib/hooks/use-destinations';
export { usePopularDestinations } from '@/lib/hooks/use-popular-destinations';

// Data and Content Hooks
export { useTags } from '@/lib/hooks/use-tags';
export { useComments } from '@/lib/hooks/use-comments';
export { useTasks } from '@/lib/hooks/use-tasks';
export { useActivities } from '@/lib/hooks/use-activities';

// Groups Hooks
export { useGroups } from '@/lib/hooks/use-groups';
export { useGroupMembers } from '@/lib/hooks/use-group-members';
export { useGroupPlans } from '@/lib/hooks/use-group-plans';
export { useGroupIdeas } from '@/lib/hooks/use-group-ideas';

// Auth Hooks
export { useAuth } from '@/lib/hooks/use-auth';
