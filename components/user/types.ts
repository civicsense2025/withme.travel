/**
 * Types for User Components
 * 
 * This file contains TypeScript interfaces and types used across
 * user management components.
 */

// UserProfile Types
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at?: string;
  role?: string;
  interests?: string[];
  travel_personality?: string;
  travel_squad?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface UserProfileProps {
  /** User profile data to display */
  profile: UserProfile;
  /** Whether the profile is editable */
  editable?: boolean;
  /** Whether to show full details (false shows compact view) */
  showFullDetails?: boolean;
  /** Handler for when profile is updated */
  onProfileUpdate?: (profile: Partial<UserProfile>) => Promise<void>;
  /** Additional CSS class names */
  className?: string;
}

// UserProfileCard Types
export interface UserProfileCardProps {
  /** User profile to display */
  profile: UserProfile;
  /** Optional link to navigate to when clicking on the card */
  href?: string;
  /** Whether to show follow button (for public profiles) */
  showFollowButton?: boolean;
  /** Whether the user is following this profile */
  isFollowing?: boolean;
  /** Callback for when follow button is clicked */
  onFollowToggle?: (profileId: string, following: boolean) => Promise<void>;
  /** Callback for when the card is clicked */
  onClick?: (profile: UserProfile) => void;
  /** Additional CSS class names */
  className?: string;
}

// LoginForm Types
export interface LoginFormProps {
  /** Optional callback function to call when login is successful */
  onSuccess?: () => void;
  /** Optional custom text for the primary button */
  primaryButtonText?: string;
  /** Whether to redirect after successful login */
  redirectAfterLogin?: boolean;
  /** Custom redirect URL (defaults to /dashboard) */
  redirectUrl?: string;
  /** Show the registration link */
  showSignUpLink?: boolean;
  /** Custom sign up link text */
  signUpLinkText?: string;
  /** Additional CSS class names */
  className?: string;
}

// SignupForm Types
export interface SignupFormProps {
  /** Optional callback function to call when signup is successful */
  onSuccess?: () => void;
  /** Optional custom text for the primary button */
  primaryButtonText?: string;
  /** Whether to redirect after successful signup */
  redirectAfterSignup?: boolean;
  /** Custom redirect URL (defaults to /onboarding) */
  redirectUrl?: string;
  /** Show the login link */
  showLoginLink?: boolean;
  /** Custom login link text */
  loginLinkText?: string;
  /** Additional CSS class names */
  className?: string;
}

// UserSettings Types
export interface UserSettingsProps {
  /** User profile data */
  profile: UserProfile;
  /** Handler to update profile data */
  onProfileUpdate?: (profile: Partial<UserProfile>) => Promise<void>;
  /** Handler to update account settings */
  onAccountUpdate?: (settings: AccountSettings) => Promise<void>;
  /** Handler to update notifications settings */
  onNotificationsUpdate?: (settings: NotificationSettings) => Promise<void>;
  /** Handler to change password */
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Handler to delete account */
  onDeleteAccount?: (password: string) => Promise<void>;
  /** Default active tab */
  defaultTab?: 'profile' | 'account' | 'notifications' | 'security';
}

export interface AccountSettings {
  email?: string;
  username?: string;
  language?: string;
  timezone?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  tripUpdates: boolean;
  friendActivity: boolean;
  marketing: boolean;
  newFeatures: boolean;
} 