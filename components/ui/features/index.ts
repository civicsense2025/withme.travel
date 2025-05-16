/**
 * Feature Components
 * 
 * This is the main entry point for all feature-specific UI components.
 * Components are organized using the atomic design methodology and feature-based folders.
 * 
 * Current features:
 * - Auth: Authentication components (login, signup, reset, etc.)
 * - Trips: Trip-related components (cards, lists, details)
 * - Destinations: Components for displaying destinations
 * - Groups: Group-related components (planned)
 * - Itinerary: Itinerary UI components (planned)
 * - User: User profile components (planned)
 * - Core: Basic UI building blocks (planned)
 */

// Authentication components
export * from './auth';

// Trip components
export * from './trips';

// Destination components
export * from './destinations';

// The following features will be implemented as we continue the refactoring:
// export * from './groups';
// export * from './itinerary';
// export * from './user';
// export * from './core';
// export * from './collaboration';
// export * from './focus';