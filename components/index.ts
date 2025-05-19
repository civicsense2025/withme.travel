/**
 * Components Module
 * 
 * This file exports all components for easier imports. It's organized by:
 * 1. Shared components that can be used across the application
 * 2. Feature-specific components organized by feature domain
 * 
 * Usage examples:
 * 
 * - Import shared components:
 *   import { SubmitButton } from '@/components';
 * 
 * - Import feature-specific components:
 *   import { auth } from '@/components';
 *   const { PasswordField, LoginForm } = auth;
 *   
 * - You can also import directly from the feature:
 *   import { LoginForm } from '@/components/features/auth';
 */

// Shared components
export * from './shared';

// Feature components
import * as auth from './features/auth';
import * as groups from './features/groups';

// Export implemented features
export { auth, groups };

// Future features to be exported as they're implemented
// import * as maps from './features/maps';
// import * as destinations from './features/destinations';
// import * as comments from './features/comments';
// import * as feedback from './features/feedback';
// import * as search from './features/search';
// 
// export {
//   maps,
//   destinations,
//   comments,
//   feedback,
//   search
// };

// Re-export components from their new atomic structure locations
// This provides backward compatibility while we transition

// Layout components
export { PageHeader } from '@/components/features/layout/organisms/PageHeader';

// Trip components 
export { HeroSection } from '@/components/features/trips/organisms/HeroSection';
export { SharedPresenceSection } from '@/components/features/trips/organisms/SharedPresenceSection';
export { ExpenseMarketingSection } from '@/components/features/trips/organisms/ExpenseMarketingSection';
