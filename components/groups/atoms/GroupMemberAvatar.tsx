/**
 * GroupMemberAvatar
 * 
 * Avatar component for displaying group member profile images with fallback
 * 
 * @module groups/atoms
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMemberAvatarProps {
  /** Member's name for fallback display */
  name: string;
  /** URL to the avatar image */
  avatarUrl?: string;
  /** Size of the avatar - determines avatar dimensions */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
}: GroupMemberAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
} 