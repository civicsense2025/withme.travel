/**
 * UI Components
 * 
 * This is the main entry point for all UI components.
 * Components are organized in a hierarchical structure:
 * 
 * 1. Base UI components (button, input, card, etc)
 * 2. Feature-specific components (auth, trips, destinations, etc)
 */

// Text components
export { Text } from './Text';
export { Heading } from './Heading';
export type { TextScreenSize, TextVariant, TextWeight } from './Text';
export type { HeadingLevel, HeadingWeight, HeadingSize, HeadingAlignment } from './Heading';

// Base UI components
export * from './button';
export * from './badge';
export * from './card';
export * from './dialog';
export * from './input';
export * from './label';
export * from './popover';
export * from './tooltip';
export { Button } from './button';
export { FullBleedSection } from './FullBleedSection';
export type { FullBleedSectionProps } from './FullBleedSection';

// Note: Feature-specific components are exported via their own entry points
// Import them directly from their respective modules:
// import { AuthForm, LoginForm } from '@/components/ui/features/auth';
// import { TripCard } from '@/components/ui/features/trips';
// import { DestinationCard } from '@/components/ui/features/destinations'; 