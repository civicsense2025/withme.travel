import React from 'react';
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
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getInitials, formatDateRange } from '@/lib/utils';
// import { TripPrivacySetting } from "@/types/trip" // Assuming type is defined here -> Define locally
import { ShareTripButton } from '@/components/trips/ShareTripButton'; // Removed props type import
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      title={`${members.length} member${members.length !== 1 ? 's' : ''}`}
    >
      {visibleMembers.map((member) => {
        const profile = member.profiles;
        if (!profile?.id) return null;
        const name = profile.name || profile.username || 'User';
        const initials = getInitials(name);
        return (
          <Avatar
            key={profile.id}
            className="inline-block h-6 w-6 rounded-full ring-1 ring-background"
            title={name}
          >
            <AvatarImage src={profile.avatar_url || undefined} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        );
      })}
      {hiddenCount > 0 && (
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xxs font-medium ring-1 ring-background z-10">
          +{hiddenCount}
        </div>
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
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false);
  const [editingDates, setEditingDates] = React.useState<{
    start: string | null;
    end: string | null;
  }>({ start: startDate ?? null, end: endDate ?? null });

  // Handler for date change (simulate save on close for now)
  const handleDateChange = (range: DateRange | undefined) => {
    setEditingDates({
      start: range?.from ? range.from.toISOString().split('T')[0] : null,
      end: range?.to ? range.to.toISOString().split('T')[0] : null,
    });
    if (onDatesChange) {
      onDatesChange({
        start: range?.from ? range.from.toISOString().split('T')[0] : null,
        end: range?.to ? range.to.toISOString().split('T')[0] : null,
      });
    }
    // TODO: Backend update for trip dates
  };

  return (
    <div>
      {/* Cover Image Section */}
      <div className="relative w-full h-48 md:h-64 mb-6 group">
        {' '}
        {/* Standardized height and bottom margin */}
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-sm">
          <Image
            src={coverImageUrl || '/default-placeholder.jpg'}
            alt={`${tripName} cover image`}
            fill
            className="object-cover"
            priority // Load cover image quickly
          />
          {/* Button appears on hover or if editable */}
          {canEdit && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onChangeCover}
              title="Change Cover Image"
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change Cover Image</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Block */}
      <div className="px-1">
        {' '}
        {/* Optional: Add slight horizontal padding if needed */}
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-1 break-words leading-[2]">
          {tripName}
        </h1>
        {/* Description */}
        {tripDescription && (
          <p className="text-sm text-muted-foreground mt-1 mb-3 max-w-prose break-words">
            {tripDescription}
          </p>
        )}
        {/* Meta Info Row (Tags, Date, Members, Privacy) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="font-normal text-xs px-1.5 py-0.5"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
          {/* Destination Link (Optional) */}
          {destinationId && destinationName && (
            <Link
              href={`/destinations/${destinationId}`}
              className="flex items-center hover:text-foreground transition-colors"
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {destinationName}
            </Link>
          )}
          {/* Date Range */}
          <span className="flex items-center whitespace-nowrap">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {canEdit ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 py-1 h-auto border-dashed border-2"
                      onClick={() => setDatePopoverOpen(true)}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                      {formatDateRange(editingDates.start, editingDates.end) || 'Set Dates'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Click to edit trip dates</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span>{formatDateRange(startDate, endDate)}</span>
            )}
          </span>
          {/* Member Avatars */}
          {members && members.length > 0 && (
            <span
              className="flex items-center cursor-pointer"
              onClick={onMembers}
              title="View Members"
            >
              <Users className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <MemberAvatars members={members} />
            </span>
          )}
          {/* Privacy Indicator */}
          <PrivacyIndicator privacySetting={privacySetting ?? null} />
        </div>
        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <ShareTripButton slug={slug ?? null} privacySetting={privacySetting ?? null} />
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit Details
            </Button>
          )}
          {/* Additional content like presence indicator */}
          {extraContent}
        </div>
      </div>
    </div>
  );
}
