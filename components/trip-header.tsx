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
        const profileData = profile || { name: null, avatar_url: null };

        // Clean up and process name
        const rawNameValue = profileData.name || 
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
          creatorUrl: `https://unsplash.com/@${username}`
        };
      }
      
      // Check for Pexels
      if (url.includes('pexels.com')) {
        const match = url.match(/pexels\.com\/(?:photo\/[^/]+\-(\d+)|@([^/?&]+))/i);
        const photographer = match ? match[1] || match[2] || 'photographer' : 'photographer';
        return {
          source: 'pexels',
          creator: photographer,
          creatorUrl: `https://www.pexels.com/${photographer.startsWith('@') ? '' : '@'}${photographer}`
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
    <div className="w-full">
      {/* Cover Image Section with Attribution */}
      <div className="relative w-full h-48 md:h-64 my-4 rounded-lg overflow-hidden group">
        <div className="absolute inset-0 bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`Cover image for trip ${tripName}`}
              fill
              style={{ objectFit: 'cover' }}
              onLoad={() => setImageLoaded(true)}
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No cover image</p>
            </div>
          )}
        </div>
        
        {/* Image Attribution */}
        {hasAttribution && imageLoaded && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
            <span>Photo{creator ? ` by ${creator}` : ''} on</span>
            {creatorUrl ? (
              <a 
                href={creatorUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 hover:underline font-medium"
              >
                {source === 'unsplash' ? 'Unsplash' : 'Pexels'}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="font-medium">
                {source === 'unsplash' ? 'Unsplash' : 'Pexels'}
              </span>
            )}
          </div>
        )}
        
        {/* Change Cover Button - Only visible when user can edit */}
        {canEdit && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onChangeCover}
          >
            <Camera className="mr-2 h-4 w-4" />
            {coverImageUrl ? 'Change Cover' : 'Add Cover'}
          </Button>
        )}
      </div>

      {/* Trip Info Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between mb-4">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tripName}</h1>
              
              {/* Location */}
              {destinationName && (
                <div className="flex items-center mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{destinationName}</span>
                </div>
              )}
              
              {/* Date Range with Inline Editing */}
              <div className="mt-2">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "justify-start text-left font-normal relative group",
                        canEdit && "hover:bg-muted",
                        !startDate && !endDate && "text-muted-foreground"
                      )}
                      disabled={!canEdit}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate || endDate ? (
                        formatDateRange(startDate, endDate)
                      ) : (
                        "Add dates"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col">
                      <div className="p-2 border-b flex justify-between items-center">
                        <span className="text-sm font-medium">Select Trip Dates</span>
                        {canEdit && (
                          <div className="flex items-center text-muted-foreground">
                            <Pencil className="h-3 w-3 mr-1" />
                            <span className="text-xs">Edit</span>
                          </div>
                        )}
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={startDate ? new Date(startDate) : new Date()}
                        selected={selectedDateRange}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                      />
                      <div className="p-3 border-t text-xs text-center text-muted-foreground">
                        Click to select your travel dates. Click Save to confirm changes.
                      </div>
                      <div className="p-2 border-t flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDatePickerOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            if (onDatesChange) {
                              onDatesChange(editingDates);
                              setDatePickerOpen(false);
                              toast({
                                title: "Dates updated",
                                description: `Travel dates changed to ${formatDateRange(
                                  editingDates.start, 
                                  editingDates.end
                                )}`,
                              });
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Edit Button */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Trip
                </Button>
                
                {/* Compact Share Button */}
                <ShareTripButton
                  privacySetting={privacySetting || null}
                  slug={slug || null}
                  tripId={tripId}
                  className=""
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra Content Slot */}
      {extraContent && (
        <div className="mb-2">
          {extraContent}
        </div>
      )}
    </div>
  );
}
