/**
 * User Management Components
 * 
 * This module exports all user-related components such as profile, settings,
 * authentication forms, etc.
 */

// Authentication Components
// export { LoginForm } from './LoginForm';
// export { SignupForm } from './SignupForm';

// Profile Components
export { UserProfile, type UserProfile as UserProfileType } from './UserProfile';
export { UserProfileCard } from './UserProfileCard';

// Settings Components
export { UserSettings } from './UserSettings';

// Types
export type { 
  LoginFormProps,
  SignupFormProps,
  UserProfileProps,
  UserProfileCardProps,
  UserSettingsProps, 
  AccountSettings,
  NotificationSettings
} from './types';

// Onboarding Components
export * from './onboarding'; 