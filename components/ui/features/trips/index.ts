/**
 * Trips Feature Components
 * 
 * This file exports all components related to trip planning, management,
 * and display from their respective atomic level directories.
 */

// ============================================================================
// ATOMS
// ============================================================================
// Will export from atoms directory once components are moved
// export * from './atoms';

// ============================================================================
// MOLECULES
// ============================================================================
// Direct exports for backward compatibility during migration
export { EmptyTrips } from './empty-trips';
export { ExportCalendarDialog } from './export-calendar-dialog';
export { TripCreationForm } from './trip-creation-form';
// Will export from molecules directory once components are moved
// export * from './molecules';

// ============================================================================
// ORGANISMS
// ============================================================================
// Direct exports for backward compatibility during migration
export { TripOverviewTab } from './trip-overview-tab';
export { MembersTab } from './members-tab';
export { BudgetTab } from './budget-tab';
export { ItineraryTab } from './itinerary-tab';
export { HeroSection } from './hero-section';
export { TripCard } from './organisms/TripCard';
export { FAQ } from './organisms/FAQ';
export { TripHeader } from './organisms/TripHeader';
// Will export from organisms directory once components are moved
// export * from './organisms';

// ============================================================================
// TEMPLATES
// ============================================================================
// Will export from templates directory once components are moved
// export * from './templates';

// ============================================================================
// PAGES
// ============================================================================
// Will export from pages directory once components are moved
// export * from './pages';

// ============================================================================
// COMMENT FOR MIGRATION
// ============================================================================
/*
This index file is a foundation for the feature-based migration.
As components are moved to their atomic subdirectories, uncomment
the corresponding export statements and update named exports.

Migration steps:
1. Move components to appropriate atomic level subdirectories
2. Create index.ts files in each atomic directory
3. Uncomment the corresponding exports here
4. Eventually remove direct component exports as imports are updated
*/

// ============================================================================
// UTILITIES & HOOKS
// ============================================================================
// Any hooks or utilities specific to trips feature 