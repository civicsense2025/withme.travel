/**
 * @file Main component library export file for withme.travel
 *
 * This file exports all components with proper documentation for Storybook integration.
 * Components are grouped by category for easier discovery.
 */

// Layout components
export { default as Navbar } from './layout/Navbar';
export { Footer } from './footer';
export { Container } from './container';
export { PageHeader } from './page-header';

// Core UI components
export { FullBleedSection } from './ui/features/core/atoms/FullBleedSection';
export { Text } from './ui/features/core/atoms/Text';

// Trip components
export { TripCard } from './ui/features/trips/molecules/TripCard';
export { TripHeader } from './ui/features/trips/organisms/TripHeader';
export { TripOverviewTab } from './trip-overview-tab';
export { TripManagement } from './ui/features/trips/organisms/TripManagement';

// Task components
export { Task } from './ui/features/tasks/organisms/Task';
export { TaskItem } from './ui/features/tasks/molecules/TaskItem';

// Destinations
export { DestinationCard } from './ui/features/destinations/molecules/DestinationCard';

// Legacy components (to be migrated)
// export { Todo } from './Todo';
// export { TodoList } from './TodoList';
