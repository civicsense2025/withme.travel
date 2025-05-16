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
 * - Itineraries: Itinerary UI components
 * - Tasks: Task management components
 * - User: User profile components (planned)
 * - Core: Basic UI building blocks (planned)
 * - UserTesting: User research and testing components
 * - Todo: Todo list and task management components
 */

// Authentication components
export * from './auth';

// Trip components
export * from './trips';

// Destination components
export * from './destinations';

// Core UI components
export * from './core';

// Tasks components
export * from './tasks';

// User Testing components
export * from './user-testing';

// Todo components
export * from './todo';

// Itineraries components
export * from './itineraries';

// The following features will be implemented as we continue the refactoring:
// export * from './groups';
// export * from './user';
// export * from './collaboration';
// export * from './focus';