'use client';

import { cn } from '@/lib/utils';
import { TripMemberItem } from '../molecules/TripMemberItem';
import type { TripMemberItemProps } from '../molecules/TripMemberItem';

/**
 * Props for the TripMembersList component
 */
export interface TripMembersListProps {
  /** List of members */
  members: TripMemberItemProps[];
  /** Optional click handler for member */
  onMemberClick?: (id: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: List of trip members
 */
export function TripMembersList({
  members,
  onMemberClick,
  className,
}: TripMembersListProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {members.map((member) => (
        <TripMemberItem
          key={member.id}
          {...member}
          onClick={onMemberClick}
        />
      ))}
    </div>
  );
} 