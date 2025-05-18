/**
 * Groups Component Library
 * 
 * Re-exports all components from atoms and molecules subdirectories.
 */

// Re-export atomic components
export * from './atoms';
export * from './molecules';
export * from './organisms';

// Legacy/non-atomic components
// Note: ActivityGeneratorWidget is now exported from organisms/index.ts

// Legacy exports - will be moved to atomic structure over time
export { GroupMemberList } from './group-member-list';
// Note: GroupPlanCard is now exported from organisms/index.ts
// Note: GroupPlanIdea is now exported from molecules/index.ts
// Note: GroupPlanActivity is now exported from molecules/index.ts 