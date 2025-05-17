'use client';

import { cn } from '@/lib/utils';
import { PresenceAvatar } from '../atoms/PresenceAvatar';

/**
 * Props for the TripMemberItem component
 */
export interface TripMemberItemProps {
  /** Member's unique ID */
  id: string;
  /** Member's display name */
  name: string;
  /** Member's avatar image URL */
  imageUrl?: string | null;
  /** Member's role in the trip */
  role?: 'admin' | 'editor' | 'viewer' | 'contributor';
  /** Member's online status */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  /** Optional additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: (id: string) => void;
  /** Whether to show the role label */
  showRole?: boolean;
}

/**
 * Displays a single trip member with avatar, name, and role
 */
export function TripMemberItem({
  id,
  name,
  imageUrl,
  role,
  status = 'none',
  className,
  onClick,
  showRole = true,
}: TripMemberItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer',
        className
      )}
      onClick={() => onClick?.(id)}
      tabIndex={0}
      role="button"
      aria-label={`View member ${name}`}
    >
      <PresenceAvatar
        name={name}
        imageUrl={imageUrl}
        status={status}
        size="md"
        showStatus
      />
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{name}</span>
        {showRole && role && (
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {role}
          </span>
        )}
      </div>
    </div>
  );
} 