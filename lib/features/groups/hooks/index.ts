/**
 * Groups Feature Hooks
 * 
 * Central export point for all groups-related hooks.
 * 
 * Note: Currently re-exporting from main hooks directory. In the future,
 * the actual implementations will move here, and the main hooks directory
 * will re-export from this location instead.
 */

export {
  useGroups,
  useGroupIdeas,
  useGroupMembers,
  useGroupPlans
} from '@/lib/hooks'; 