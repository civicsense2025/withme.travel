/**
 * FAQ component system index
 * Re-exports all atomic design components for easy imports
 */

// Atomic design components
export * from './atoms';
export * from './molecules';
export * from './organisms';

// Context variants
export * from './variants';

// Re-export types
export type { FaqEntry, FaqLayout, FaqFilterParams } from '@/types/faq'; 