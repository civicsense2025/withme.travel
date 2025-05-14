import React, { useState, useMemo } from 'react';
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
  ExternalLink,
  UserPlus2,
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
import { toast } from '@/components/ui/use-toast';
import CompactBudgetSnapshot from '@/components/trips/compact-budget-snapshot';

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
  budgetProps?: {
    targetBudget: number | null;
    totalPlanned: number;
    totalSpent: number;
    isEditing: boolean;
    onEditToggle: (isEditing: boolean) => void;
    onSave: (newBudget: number) => Promise<void>;
    onLogExpenseClick: () => void;
  };
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
        const profileData = profile || { name: null, avatar_url: null };

        // Clean up and process name
        const rawNameValue =
          profileData.name ||
          ('username' in profileData ? profileData.username : null) ||
          (profile && 'email' in profile ? profile.email : null) ||
          'Member';

        // Ensure rawName is always a string
        const rawName = typeof rawNameValue === 'string' ? rawNameValue : 'Member';

        // Clean up the name if it contains "unknown"
        const displayName = rawName.toLowerCase().includes('unknown') ? 'Member' : rawName;
        const avatarUrl = profileData.avatar_url || null;

        // Generate a consistent background color based on the user ID
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

        // Get first letter of name for avatar fallback
        const initials = displayName.charAt(0).toUpperCase();
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

// Main TripHeader component - Enhanced
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
  budgetProps,
}: TripHeaderProps) {
  const [editingDates, setEditingDates] = useState<{ start: string | null; end: string | null }>({
    start: startDate ?? null,
    end: endDate ?? null,
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Extract attribution from URL if possible
  const extractAttribution = (url: string | null) => {
    if (!url) return { source: null, creator: null, creatorUrl: null };

    try {
      // Check for Unsplash
      if (url.includes('unsplash.com')) {
        const match = url.match(/unsplash\.com\/photos\/([^/]+)(?:\/@([^/?&]+))?/i);
        const username = match ? match[2] || 'photographer' : 'photographer';
        return {
          source: 'unsplash',
          creator: username,
          creatorUrl: `https://unsplash.com/@${username}`,
        };
      }

      // Check for Pexels
      if (url.includes('pexels.com')) {
        const match = url.match(/pexels\.com\/(?:photo\/[^/]+\-(\d+)|@([^/?&]+))/i);
        const photographer = match ? match[1] || match[2] || 'photographer' : 'photographer';
        return {
          source: 'pexels',
          creator: photographer,
          creatorUrl: `https://www.pexels.com/${photographer.startsWith('@') ? '' : '@'}${photographer}`,
        };
      }
    } catch (e) {
      console.error('Error extracting attribution:', e);
    }

    return { source: null, creator: null, creatorUrl: null };
  };

  const { source, creator, creatorUrl } = extractAttribution(coverImageUrl);
  const hasAttribution = Boolean(source);

  // Handler for date change
  const handleDateChange = (range: DateRange | undefined) => {
    setEditingDates({
      start: range?.from ? range.from.toISOString().split('T')[0] : null,
      end: range?.to ? range.to.toISOString().split('T')[0] : null,
    });

    if (onDatesChange && range?.from) {
      onDatesChange({
        start: range.from.toISOString().split('T')[0],
        end: range.to ? range.to.toISOString().split('T')[0] : null,
      });
      setDatePickerOpen(false);
    }
  };

  // Date formatting helpers
  const selectedDateRange = useMemo(() => {
    if (!startDate && !endDate) return undefined;
    return {
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    };
  }, [startDate, endDate]);

  return (
    <div className="relative bg-background z-10">
      <div
        className="relative h-[240px] w-full bg-muted overflow-hidden"
        style={{
          backgroundImage: coverImageUrl
            ? `url(${coverImageUrl})`
            : 'linear-gradient(to right, hsl(var(--primary)/0.2), hsl(var(--primary)/0.1))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Add an overlay to darken the image slightly and provide contrast */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Show Change Cover option on hover when canEdit is true - centered */}
        {canEdit && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center bg-black/30 transition-opacity duration-200 cursor-pointer"
            onClick={onChangeCover}
          >
            <div className="bg-black/80 text-white py-2 px-4 rounded-md flex items-center">
              <Camera className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Change Cover</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-b">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
                {tripName}
                {canEdit && (
                  <Button
                    onClick={onEdit}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 rounded-full"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit trip</span>
                  </Button>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {members && members.length > 0 && (
                  <div className="flex items-center">
                    <MemberAvatars members={members} />
                    <Button
                      onClick={onMembers}
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground ml-1"
                    >
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {members.length} {members.length === 1 ? 'member' : 'members'}
                    </Button>
                  </div>
                )}

                {/* If datePickerOpen is controlled based on prop... */}
                {onDatesChange && (
                  <div className="flex items-center">
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          {formatDateRange(startDate, endDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={
                            startDate
                              ? new Date(startDate)
                              : endDate
                                ? new Date(endDate)
                                : undefined
                          }
                          selected={{
                            from: startDate ? new Date(startDate) : undefined,
                            to: endDate ? new Date(endDate) : undefined,
                          }}
                          onSelect={handleDateChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {tags && tags.length > 0 && (
                  <div className="flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    <div className="flex flex-wrap gap-1 items-center">
                      {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Container for action buttons and budget */}
            <div className="flex items-center gap-3 self-end">
              {/* Insert Budget Snapshot Component */}
              {budgetProps && (
                <div className="hidden sm:block">
                  <CompactBudgetSnapshot
                    targetBudget={budgetProps.targetBudget}
                    totalPlanned={budgetProps.totalPlanned}
                    totalSpent={budgetProps.totalSpent}
                    canEdit={canEdit}
                    isEditing={budgetProps.isEditing}
                    onEditToggle={budgetProps.onEditToggle}
                    onSave={budgetProps.onSave}
                    onLogExpenseClick={budgetProps.onLogExpenseClick}
                    tripId={tripId}
                  />
                </div>
              )}

              {/* Share button */}
              {slug && (
                <ShareTripButton
                  tripId={tripId}
                  slug={slug}
                  privacySetting={privacySetting || null}
                />
              )}
            </div>
          </div>

          {extraContent}
        </div>
      </div>
    </div>
  );
}
