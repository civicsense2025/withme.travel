'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripDates } from '../atoms/TripDates';
import { PresenceAvatar } from '../atoms/PresenceAvatar';

/**
 * Props for the TripCardFooter component
 */
export interface TripCardFooterProps {
  /** Start date of the trip (ISO string) */
  startDate: string | null;
  /** End date of the trip (ISO string) */
  endDate: string | null;
  /** List of member avatars to show */
  members?: Array<{
    id: string;
    name: string;
    imageUrl?: string | null;
    status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  }>;
  /** Maximum number of members to display */
  maxMembers?: number;
  /** Optional additional CSS classes */
  className?: string;
  /** Date format */
  dateFormat?: 'short' | 'medium' | 'long';
  /** Optional trip members count (if different from members array length) */
  membersCount?: number;
  /** Optional custom date format class */
  dateClassName?: string;
  /** Optional click handler for when members section is clicked */
  onMembersClick?: () => void;
}

/**
 * Component for displaying the footer portion of a trip card
 * Shows trip dates and member avatars
 */
export function TripCardFooter({
  startDate,
  endDate,
  members = [],
  maxMembers = 3,
  className,
  dateFormat = 'medium',
  membersCount,
  dateClassName,
  onMembersClick,
}: TripCardFooterProps) {
  // Calculate the total number of members (visible + hidden)
  const totalMembers = membersCount ?? members.length;
  // Determine how many additional members beyond the displayed ones
  const hiddenMembersCount = Math.max(0, totalMembers - maxMembers);
  // Slice the members array to show only up to maxMembers
  const visibleMembers = members.slice(0, maxMembers);

  return (
    <div 
      className={cn(
        'flex justify-between items-center py-2',
        className
      )}
    >
      {/* Trip dates */}
      <div className={cn('text-sm', dateClassName)}>
        <TripDates
          startDate={startDate}
          endDate={endDate}
          format={dateFormat}
          showMonth={true}
          showYear={true}
        />
      </div>
      
      {/* Members avatars */}
      <div 
        className={cn(
          'flex items-center', 
          onMembersClick && 'cursor-pointer hover:opacity-90'
        )}
        onClick={onMembersClick}
      >
        {visibleMembers.length > 0 ? (
          <div className="flex -space-x-2">
            {visibleMembers.map((member, index) => (
              <PresenceAvatar
                key={member.id}
                name={member.name}
                imageUrl={member.imageUrl}
                status={member.status}
                size="sm"
                showStatus={false}
                zIndex={visibleMembers.length - index}
              />
            ))}
            
            {/* Show count of additional members if any */}
            {hiddenMembersCount > 0 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium ml-1 border border-white dark:border-gray-700">
                +{hiddenMembersCount}
              </div>
            )}
          </div>
        ) : (
          // No members yet
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Users size={16} className="mr-1" />
            <span>No members</span>
          </div>
        )}
      </div>
    </div>
  );
} 