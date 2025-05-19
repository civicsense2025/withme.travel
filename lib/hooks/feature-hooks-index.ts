/**
 * Feature Hooks Index (DEMONSTRATION FILE)
 *
 * This file demonstrates how hooks will be organized in the feature-first structure.
 * It shows the planned structure without actual imports that might cause linter errors.
 * 
 * NOTE: This is a demonstration file and not meant to be used in production yet.
 * The actual migration of hooks to feature directories will be done gradually.
 */

/**
 * FEATURE HOOKS ORGANIZATION:
 * 
 * In the feature-first organization, hooks will be organized by feature domain:
 * 
 * 1. Shared hooks will be placed in lib/shared/hooks/
 *    - Example: useToast, useMediaQuery
 * 
 * 2. Feature-specific hooks will be placed in lib/features/{feature}/hooks/
 *    - Example: useAuth in lib/features/auth/hooks/
 *    - Example: useLogistics in lib/features/trips/hooks/
 * 
 * The main hooks/index.ts will import and re-export all hooks to maintain
 * backward compatibility during the migration.
 */

/**
 * HOOK CATEGORIZATION BY FEATURE:
 * 
 * - auth: useAuth
 * - trips: useLogistics, usePermissions, useExpenses, useItineraries, useTripMembers
 * - activities: useActivities
 * - comments: useComments
 * - destinations: useDestinations
 * - groups: useGroups
 * - places: usePlaces
 * - tags: useTags
 * - tasks: useTasks
 * 
 * Shared hooks:
 * - useToast
 * - useMediaQuery
 * - useMobileDialog
 * - useOgImage
 */

/**
 * MIGRATION STEPS:
 * 
 * 1. Create feature directories in lib/features/{feature-name}/hooks
 * 2. Move existing hooks to their feature directories
 * 3. Update imports in components using these hooks
 * 4. Update the main hooks index.ts to import from feature directories
 * 
 * For example, after migration, lib/hooks/index.ts would look like:
 * 
 * ```typescript
 * // Core hooks
 * export * from '@/lib/shared/hooks/use-toast';
 * export * from '@/lib/shared/hooks/use-media-query';
 * 
 * // Feature hooks
 * export * from '@/lib/features/auth/hooks/use-auth';
 * export * from '@/lib/features/trips/hooks/use-logistics';
 * export * from '@/lib/features/trips/hooks/use-permissions';
 * // ... and so on
 * ```
 * 
 * This maintains backward compatibility so existing components don't break.
 */

// Feature-specific hooks
// Will be uncommented as hooks are migrated to feature directories
// import { useAuth } from '@/lib/features/auth/hooks/use-auth';
// import { useLogistics, usePermissions } from '@/lib/features/trips/hooks';
// import { useActivities } from '@/lib/features/activities/hooks/use-activities';
// import { useComments } from '@/lib/features/comments/hooks/use-comments';
// import { useDestinations } from '@/lib/features/destinations/hooks/use-destinations';
// import { useExpenses } from '@/lib/features/trips/hooks/use-expenses';
// import { useGroups } from '@/lib/features/groups/hooks/use-groups';
// import { useItineraries } from '@/lib/features/trips/hooks/use-itineraries';
// import { usePlaces } from '@/lib/features/places/hooks/use-places';
// import { useTags } from '@/lib/features/tags/hooks/use-tags';
// import { useTasks } from '@/lib/features/tasks/hooks/use-tasks';
// import { useTripMembers } from '@/lib/features/trips/hooks/use-trip-members';

// Shared hooks - these would remain in shared directory
import { useToast } from '@/components/ui/use-toast';
// Current hooks (will be moved to shared directory later)
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useMobileDialog } from '@/lib/hooks/use-mobile-dialog';
import useOgImage from '@/lib/hooks/use-og-image';

// Legacy hooks (direct imports for now, will be updated as migration proceeds)
import { usePermissions } from '@/lib/hooks/use-permissions';
import { useLogistics } from '@/lib/hooks/use-logistics';
import { useAuth } from '@/lib/hooks/use-auth';
import { useActivities } from '@/lib/hooks/use-activities';
import { useComments } from '@/lib/hooks/use-comments';
import { useDestinations } from '@/lib/hooks/use-destinations';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { useGroups } from '@/lib/hooks/use-groups';
import { useItineraries } from '@/lib/hooks/use-itineraries';
import { usePlaces } from '@/lib/hooks/use-places';
import { useTags } from '@/lib/hooks/use-tags';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useTripMembers } from '@/lib/hooks/use-trip-members';
import { usePopularDestinations } from '@/lib/hooks/use-popular-destinations';

export {
  // Feature-specific hooks (commented until migration)
  // useAuth,
  // useLogistics,
  // usePermissions,
  // useActivities,
  // useComments,
  // useDestinations,
  // useExpenses,
  // useGroups,
  // useItineraries, 
  // usePlaces,
  // useTags,
  // useTasks,
  // useTripMembers,

  // Shared hooks
  useToast,
  useMediaQuery,
  useMobileDialog,
  useOgImage,
  
  // Legacy hooks
  usePermissions,
  useLogistics,
  useAuth,
  useActivities,
  useComments,
  useDestinations,
  useExpenses,
  useGroups,
  useItineraries,
  usePlaces,
  useTags,
  useTasks,
  useTripMembers,
  usePopularDestinations
};

/**
 * MIGRATION PLAN:
 * 
 * 1. Create feature directories in lib/features/{feature-name}/hooks
 * 2. Move existing hooks to their feature directories
 * 3. Update imports in components using these hooks
 * 4. Update the main hooks index.ts to import from feature directories
 * 
 * Features and their hooks:
 * 
 * - auth: useAuth
 * - trips: useLogistics, usePermissions, useExpenses, useItineraries, useTripMembers
 * - activities: useActivities
 * - comments: useComments
 * - destinations: useDestinations
 * - groups: useGroups
 * - places: usePlaces
 * - tags: useTags
 * - tasks: useTasks
 */

/**
 * Feature Hooks Index
 * 
 * Centralized export point for feature-specific hooks.
 * This helps organize hooks by feature domain for better maintainability.
 */

// Uncomment the import for useExpenses
// import { useExpenses } from '@/lib/features/budget/hooks/use-expenses';

// Trips feature hooks
export * from '@/lib/features/trips/hooks/use-logistics';

// Groups feature hooks
export * from '@/lib/features/groups/hooks';

// Tags feature hooks
export * from '@/lib/features/tags/hooks';

// Budget feature hooks
export * from '@/lib/features/budget/hooks';

// Places feature hooks
export * from '@/lib/features/places/hooks';

// Destinations feature hooks
export * from '@/lib/features/destinations/hooks';

// Future feature hooks can be added here
// export * from '@/lib/features/groups/hooks/use-group-logistics';
// export * from '@/lib/features/destinations/hooks/use-destination-search'; 