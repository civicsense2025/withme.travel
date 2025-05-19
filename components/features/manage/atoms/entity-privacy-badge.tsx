/**
 * Entity Privacy Badge (Atom)
 *
 * Displays a badge indicating the privacy level of an entity (trip, group, etc).
 *
 * @module manage/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Globe, Lock, Users } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type PrivacyLevel = 'public' | 'unlisted' | 'private' | 'shared' | 'members-only';

export interface EntityPrivacyBadgeProps {
  /** The privacy level to display */
  privacy: PrivacyLevel;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the color scheme for a privacy level
 */
function getPrivacyColor(privacy: PrivacyLevel): string {
  switch (privacy) {
    case 'public':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'unlisted':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'shared':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'members-only':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'private':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}

/**
 * Get the icon for a privacy level
 */
function getPrivacyIcon(privacy: PrivacyLevel, size: number = 14): React.ReactNode {
  switch (privacy) {
    case 'public':
      return <Globe size={size} />;
    case 'unlisted':
      return <Eye size={size} />;
    case 'shared':
      return <Users size={size} />;
    case 'members-only':
      return <Users size={size} />;
    case 'private':
      return <Lock size={size} />;
    default:
      return <EyeOff size={size} />;
  }
}

/**
 * Get a user-friendly label for a privacy level
 */
function getPrivacyLabel(privacy: PrivacyLevel): string {
  switch (privacy) {
    case 'public':
      return 'Public';
    case 'unlisted':
      return 'Unlisted';
    case 'shared':
      return 'Shared';
    case 'members-only':
      return 'Members Only';
    case 'private':
      return 'Private';
    default: {
      // This case shouldn't happen with our defined PrivacyLevel type,
      // but TypeScript needs to handle it to avoid the 'never' type error
      const fallbackPrivacy = String(privacy);
      return fallbackPrivacy.charAt(0).toUpperCase() + fallbackPrivacy.slice(1);
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EntityPrivacyBadge({
  privacy,
  showIcon = true,
  showLabel = true,
  className,
  size = 'md',
}: EntityPrivacyBadgeProps) {
  // Size-based classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  // Icon size based on badge size
  const iconSize = size === 'lg' ? 16 : 14;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        getPrivacyColor(privacy),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">{getPrivacyIcon(privacy, iconSize)}</span>}
      {showLabel && (
        <span className="flex-shrink-0 whitespace-nowrap font-medium">
          {getPrivacyLabel(privacy)}
        </span>
      )}
    </div>
  );
}
