/**
 * TaskAssignee displays the assigned user for a task
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ProfileBasic } from '../types';

// ============================================================================
// PROPS DEFINITION
// ============================================================================

export interface TaskAssigneeProps {
  /** User profile information */
  user: ProfileBasic;
  /** Size of the avatar (in pixels) */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the tooltip */
  showTooltip?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get initials from name
 */
export function getInitials(profile: ProfileBasic): string {
  if (!profile.name) {
    return profile.username?.substring(0, 2).toUpperCase() || '?';
  }
  
  return profile.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Component for displaying an assigned user
 */
export function TaskAssignee({
  user,
  size = 'md',
  showTooltip = true,
  className = '',
}: TaskAssigneeProps) {
  // Determine avatar size
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };
  
  const avatar = (
    <Avatar className={`${sizeMap[size]} ${className}`}>
      <AvatarImage 
        src={user.avatar_url || undefined} 
        alt={user.name || user.username || 'User'} 
      />
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  );
  
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatar}
          </TooltipTrigger>
          <TooltipContent>
            <p>Assigned to: {user.name || user.username}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return avatar;
} 