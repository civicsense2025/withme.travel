import React, { useState } from 'react';
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Tag,
  Camera,
  Pencil,
  Share2,
  Lock,
  Link as LinkIcon,
  Globe,
  PlusCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
// import { TripPrivacySetting } from "@/types/trip"; // Assuming type is defined here -> Define locally
import { ShareTripButton } from '@/components/trips/ShareTripButton'; // Removed props type import
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Define helper functions locally
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function formatDateRange(startDate?: string | Date | null, endDate?: string | Date | null): string {
  if (!startDate && !endDate) return 'Dates not set';

  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) return `${startStr} - ${endStr}`;

  return 'Invalid date range';
}
// End local helpers

// Define privacy setting type locally
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

// Define the structure of a member with profile data expected from the page
export interface MemberWithProfile {
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
  privacySetting: TripPrivacySetting | null;
  id?: string;
  user_id: string;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

// Define the props for the TripHeader component
export interface TripHeaderProps {
  tripId: string;
  tripName: string;
  tripDescription?: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  destinationId?: string | null;
  destinationName?: string | null;
  members?: MemberWithProfile[] | null;
  tags?: { id: string; name: string }[] | null;
  canEdit: boolean;
  onEdit: () => void;
  onMembers: () => void;
  onChangeCover: () => void;
  isSaving?: boolean;
  slug?: string | null;
  privacySetting?: TripPrivacySetting | null;
  extraContent?: React.ReactNode;
  onDatesChange?: (range: { start: string | null; end: string | null }) => void;
}

// Sub-component to render overlapping member avatars (Minor adjustments for size)
function MemberAvatars({ members }: { members?: MemberWithProfile[] | null }) {
  if (!members || members.length === 0) return null;
  const maxVisible = 5;
  const visibleMembers = members.slice(0, maxVisible);
  const hiddenCount = members.length - visibleMembers.length;

  return (
    <div
      className="flex items-center -space-x-1.5"
      title={`${members.length} member${members.length !== 1 ? `s` : ''}`}
    >
      {visibleMembers.map((member, idx) => {
        // Handle case where member might be null
        if (!member) return null;

        // Check both profile structures (profiles vs profile) for backward compatibility
        const profile = member.profiles || member.profile;

        // Use fallback if profile is missing
        const name = profile?.name || profile?.username || (profile as any)?.email || 'Member';
        // Clean up the name if it contains "unknown"
        const displayName = name.toLowerCase().includes('unknown') ? 'Member' : name;
        const avatarUrl = profile?.avatar_url || null;

        // Generate a consistent background color based on the user ID for anonymous users
        const colorIndex = member.user_id
          ? member.user_id
              .split('')
              .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 10
          : idx % 10;

        const bgColors = [
          'bg-rose-500', // Red
          'bg-orange-500', // Orange
          'bg-amber-500', // Amber
          'bg-lime-500', // Lime
          'bg-emerald-500', // Emerald
          'bg-teal-500', // Teal
          'bg-cyan-500', // Cyan
          'bg-blue-500', // Blue
          'bg-indigo-500', // Indigo
          'bg-purple-500', // Purple
        ];

        // Get initials for avatar fallback
        const getInitials = (name: string) => {
          const parts = name.split(' ');
          if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
          return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        };

        const initials = getInitials(displayName);
        const bgColorClass = bgColors[colorIndex];

        return (
          <Tooltip key={member.id || idx} delayDuration={300}>
            <TooltipTrigger asChild>
              <Avatar className="border-2 border-background">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className={`text-white ${bgColorClass}`}>{initials}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">{displayName}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {hiddenCount > 0 && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Avatar className="bg-muted border-2 border-background relative">
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                +{hiddenCount}
              </div>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              {hiddenCount} more member{hiddenCount !== 1 ? 's' : ''}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function PrivacyIndicator({ privacySetting }: { privacySetting: TripPrivacySetting | null }) {
  if (!privacySetting || privacySetting === 'private') {
    return (
      <span className="flex items-center" title="Private Trip">
        <Lock className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Private
      </span>
    );
  }
  if (privacySetting === 'shared_with_link') {
    return (
      <span className="flex items-center" title="Shared with Link">
        <LinkIcon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Link Shared
      </span>
    );
  }
  if (privacySetting === 'public') {
    return (
      <span className="flex items-center" title="Public Trip">
        <Globe className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Public
      </span>
    );
  }
  return null;
}

// Main TripHeader component - Refactored
export function TripHeader({
  tripId,
  tripName,
  tripDescription,
  startDate,
  endDate,
  coverImageUrl,
  destinationId,
  destinationName,
  members,
  tags,
  canEdit,
  onEdit,
  onMembers,
  onChangeCover,
  slug,
  privacySetting,
  extraContent,
  onDatesChange,
}: TripHeaderProps) {
  const [editingDates, setEditingDates] = useState<{ start: string | null; end: string | null }>({
    start: startDate ?? null, end: endDate ?? null });

  // Handler for date change (simulate save on close for now)
  const handleDateChange = (range: DateRange | undefined) => {
    setEditingDates({
      start: range?.from ? range.from.toISOString().split('T')[0] : null,
      end: range?.to ? range.to.toISOString().split('T')[0] : null
    });
    if (onDatesChange) {
      onDatesChange({
        start: range?.from ? range.from.toISOString().split('T')[0] : null,
        end: range?.to ? range.to.toISOString().split('T')[0] : null
      });
    }
    // TODO: Backend update for trip dates
  };

  return (
    <div className="container mx-auto px-4 w-full">
      {/* Cover Image Section */}
      <div className="relative w-full h-48 md:h-64 my-8 group">
        {' '}
        {/* Add top and bottom margin */}
        <div className="absolute inset-0 rounded-lg overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`Cover image for trip ${tripName}`}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No cover image</p>
            </div>
          )}
        </div>
      </div>

      {/* Rest of the component content */}
    </div>
  );
}