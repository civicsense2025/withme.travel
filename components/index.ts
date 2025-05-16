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

// Trip components
export { TripCard } from './ui/features/trips/molecules/TripCard';
export { TripHeader } from './ui/features/trips/organisms/TripHeader';
export { TripOverviewTab } from './trip-overview-tab';
export { TripManagement } from './ui/features/trips/organisms/TripManagement';
export { TripNotesEditor } from './trip-notes-editor';
export { CollaborativeNotes } from './collaborative-notes';
export { UseTemplateButton } from './use-template-button';
export { RequestAccessDialog } from './request-access-dialog';
export { ExportCalendarDialog } from './export-calendar-dialog';
export { EmptyTrips } from './empty-trips';

// Destination components
export { DestinationCard } from './destination-card';
export { TrendingDestinations } from './trending-destinations';
export { LocationSearch } from './location-search';
export { PlaceSearch } from './place-search';
export { GooglePlacesAutocomplete } from './google-places-autocomplete';

// User components
export { LikeButton } from './like-button';
export { LoginForm } from './ui/features/auth/molecules/LoginForm';
export { AuthProvider } from './auth-provider';
export { AuthModal } from './ui/features/auth/organisms/AuthModal';
export { AuthDebugger } from './ui/features/auth/molecules/AuthDebugger';
export { PresenceIndicator } from './presence-indicator';
export { ThemeToggle } from './ui/atoms/ThemeToggle';

// Task and Todo components
export { Task } from './Task';
export { Todo } from './Todo';
export { TodoList } from './TodoList';

// Feedback components
export { FirstLikeTour } from './first-like-tour';

// Error handling components
export { default as ErrorBoundary, ClassErrorBoundary, useErrorBoundary } from './error-boundary';
export { ErrorBoundaryButton } from './error-boundary-button';
export { GlobalErrorBoundary } from './global-error-boundary';
export { AuthErrorBoundary } from './auth-error-boundary';

// UI Components
export { ClientTime } from './client-time';
export { HeroSection } from './hero-section';
export { CityBubbles } from './city-bubbles';
export { FullBleedSection } from './ui/FullBleedSection';
export { default as HeroEmojiExplosion } from './HeroEmojiExplosion';

// Import from UI component library - this includes all components from the new structure 
export * from './ui';

// Import from features - this is the new location of organized components
export { UserTestingDebugger } from './ui/features/user-testing';

// These commented exports need to be fixed once the sub-directories are checked
// export * from './trips/components';
// export * from './itinerary';
