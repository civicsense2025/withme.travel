'use client';

import { cn } from '@/lib/utils';
import { PresenceAvatar } from '../atoms/PresenceAvatar';

export interface PresenceIndicatorMember {
  id: string;
  name: string;
  imageUrl?: string | null;
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
}

/**
 * Props for the PresenceIndicator component
 */
export interface PresenceIndicatorProps {
  /** Array of present members */
  members: PresenceIndicatorMember[];
  /** Maximum number of avatars to display */
  maxAvatars?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Shows a group of avatars for present members, with a count if more than maxAvatars
 */
export function PresenceIndicator({
  members,
  maxAvatars = 4,
  className,
}: PresenceIndicatorProps) {
  const visibleMembers = members.slice(0, maxAvatars);
  const extraCount = members.length - visibleMembers.length;
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {visibleMembers.map((member, i) => (
        <PresenceAvatar
          key={member.id}
          name={member.name}
          imageUrl={member.imageUrl}
          status={member.status}
          size="sm"
          showStatus
          zIndex={visibleMembers.length - i}
        />
      ))}
      {extraCount > 0 && (
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 font-medium">+{extraCount}</span>
      )}
    </div>
  );
} 