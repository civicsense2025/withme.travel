/**
 * Hooks Export Index
 *
 * Central export point for all hooks in the application.
 * Organized by functional domain to improve discoverability and maintainability.
 */

// ============================================================================
// UI AND INTERACTION HOOKS
// ============================================================================
export { useToast } from './use-toast';
export { useMediaQuery } from '@/lib/hooks/use-media-query'; 
export { useMobileDialog } from '@/lib/hooks/use-mobile-dialog';
export { useFocusSession } from '@/lib/hooks/use-focus-session';
export { useOgImage } from '@/lib/hooks/use-og-image';
export { useAsyncData } from '@/lib/hooks/use-async-data';
export { useDebounce } from '@/lib/hooks/use-debounce';
export { useLocalStorage } from '@/lib/hooks/use-local-storage';
export { useIsMobile } from '@/lib/hooks/use-mobile';

// ============================================================================
// TRIPS AND ITINERARY HOOKS
// ============================================================================
export { useTrips } from '@/lib/hooks/use-trips';
export { useTripMembers } from '@/lib/hooks/use-trip-members';
export { useTripItinerary } from '@/lib/hooks/use-trip-itinerary';
export { useItinerary } from '@/lib/hooks/use-itinerary';
export { useItineraryTemplates } from '@/lib/hooks/use-itinerary-templates';
export { useItineraryTemplate } from '@/lib/hooks/use-itinerary-template';
export { useLogistics } from '@/lib/hooks/use-logistics';
export { useTripManagement } from '@/lib/hooks/use-trip-management';
export { useTripEventTracking } from '@/lib/hooks/use-trip-event-tracking';

// ============================================================================
// GROUPS AND COLLABORATION HOOKS
// ============================================================================
export { useGroups } from '@/lib/hooks/use-groups';
export { useGroupIdeas } from '@/lib/hooks/use-group-ideas';
export { useGroupMembers } from '@/lib/hooks/use-group-members';
export { useGroupPlans } from '@/lib/hooks/use-group-plans';
export { useGroupEventTracking } from '@/lib/hooks/use-group-event-tracking';
export { useVotes } from '@/lib/hooks/use-votes';
export { useNotes } from '@/lib/hooks/use-notes';
export { useComments } from '@/lib/hooks/use-comments';
export { useLikes } from '@/lib/hooks/use-likes';

// ============================================================================
// DESTINATIONS AND PLACES HOOKS
// ============================================================================
export { useDestinations } from '@/lib/features/destinations/hooks/use-destinations';
export { usePopularDestinations } from '@/lib/features/destinations/hooks/use-popular-destinations';
export { usePlaces } from '@/lib/features/places/hooks/use-places';
export { useDestinationStats } from '@/lib/hooks/use-destination-stats';

// ============================================================================
// ACTIVITY AND TASK HOOKS
// ============================================================================
export { useActivities } from '@/lib/hooks/use-activities';
export { useActivitySuggestions } from '@/lib/hooks/useActivitySuggestions';
export { useActivityTimeline } from '@/lib/hooks/use-activity-timeline';
export { useTasks } from '@/lib/hooks/use-tasks';

// ============================================================================
// USER AND AUTHENTICATION HOOKS
// ============================================================================
export { useAuth } from '@/lib/hooks/use-auth';
export { usePermissions } from '@/lib/hooks/use-permissions';
export { useReferral } from '@/lib/hooks/use-referral';

// ============================================================================
// DATA MANAGEMENT HOOKS
// ============================================================================
export { useExpenses } from '@/lib/features/budget/hooks/use-expenses';
export { useImmer } from '@/lib/hooks/use-immer';
export { useInterests } from '@/lib/hooks/use-interests';
export { useTags } from '@/lib/hooks/use-tags';
export { useTagPicker } from '@/lib/hooks/use-tag-picker';

// ============================================================================
// ANALYTICS AND TRACKING HOOKS
// ============================================================================
export { useResearchTracking } from '@/lib/hooks/use-research-tracking';
