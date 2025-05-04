/**
 * @file Main component library export file for withme.travel
 * 
 * This file exports all components with proper documentation for Storybook integration.
 * Components are grouped by category for easier discovery.
 */

// Layout components
export { Navbar } from './navbar';
export { Footer } from './footer';
export { Container } from './container';
export { PageHeader } from './page-header';

// Trip components
export { TripCard } from './trip-card';
export { TripHeader } from './trip-header';
export { TripOverviewTab } from './trip-overview-tab';
export { TripManagement } from './trip-management';
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
export { LoginForm } from './login-form';
export { AuthProvider } from './auth-provider';
export { AuthModal } from './auth-modal';
export { PresenceIndicator } from './presence-indicator';
export { NotificationIndicator } from './notification-indicator';
export { ThemeToggle } from './theme-toggle';

// Feedback components
export { FirstLikeTour } from './first-like-tour';
export { OfflineNotification } from './offline-notification';
export { UpdateNotification } from './update-notification';

// Error handling components
export { default as ErrorBoundary, ClassErrorBoundary, useErrorBoundary } from './error-boundary';
export { ErrorBoundaryButton } from './error-boundary-button';
export { GlobalErrorBoundary } from './global-error-boundary';
export { AuthErrorBoundary } from './auth-error-boundary';

// UI Components
export { ClientTime } from './client-time';
export { HeroSection } from './hero-section';
export { CityBubbles } from './city-bubbles';

// Import from sub-directories
export * from './ui';
// These commented exports need to be fixed once the sub-directories are checked
// export * from './trips/components';
// export * from './itinerary'; 