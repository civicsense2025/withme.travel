'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type TripRole } from '@/utils/constants/status';
import { type MemberWithProfile } from '@/components/trip-header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

// Define TripPrivacySetting type locally or import if defined elsewhere
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

// Define a local formatDateRange function
function formatDateRange(startDate?: string | Date | null, endDate?: string | Date | null): string {
  if (!startDate && !endDate) return 'Dates not set';
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;
  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) return `${startStr} - ${endStr}`;
  return 'Invalid date range';
}

// Define AccessRequest type
interface AccessRequestUser {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AccessRequest {
  id: string;
  user_id: string;
  message: string | null;
  created_at: string;
  user: AccessRequestUser | null;
}

interface TripSidebarContentProps {
  description?: string | null;
  privacySetting?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  tags?: any[];
  canEdit?: boolean;
  userRole?: string | null;
  accessRequests?: any[];
  members?: any[];
  onEdit?: () => void;
  onManageAccessRequest?: (id: string, approve: boolean) => void;
  /**
   * If true, renders without the Card wrapper (for use inside CollapsibleSection)
   */
  noCardWrapper?: boolean;
}

// Helper function for avatar colors
const getBackgroundColor = (userId: string, index: number): string => {
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

  const colorIndex = userId
    ? userId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 10
    : index % 10;

  return bgColors[colorIndex];
};

// Helper function to get initials
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function TripSidebarContent({
  description,
  privacySetting,
  startDate,
  endDate,
  tags,
  canEdit,
  userRole,
  accessRequests,
  members,
  onEdit,
  onManageAccessRequest,
  noCardWrapper = false,
}: TripSidebarContentProps) {
  // Check if user is admin or owner to manage access requests
  const isAdmin = userRole === 'admin';

  // Format privacy setting for display
  const formatPrivacy = (setting: TripPrivacySetting | null): string => {
    if (!setting) return 'Private';
    switch (setting) {
      case 'private':
        return 'Private (Only invited members)';
      case 'shared_with_link':
        return 'Shared with Link';
      case 'public':
        return 'Public';
      default:
        return 'Private';
    }
  };

  const content = (
    <div className="px-4 pt-4 pb-4">
      {noCardWrapper ? null : (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-medium">Trip Details</span>
        </div>
      )}
      {/* Members Section */}
      <div>
        <Label className="text-[10px] font-medium text-muted-foreground flex items-center">
          <Users className="h-3 w-3 mr-1" />
          Members
        </Label>
        <div className="mt-2">
          {members && members.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {members.map((member, idx) => {
                if (!member) return null;

                // Get profile info
                const profile = member.profiles || member.profile;
                const name = profile?.name || profile?.username || 'Member';
                const displayName = name.toLowerCase().includes('unknown') ? 'Member' : name;
                const avatarUrl = profile?.avatar_url || null;
                const initials = getInitials(displayName);
                const bgColorClass = getBackgroundColor(member.user_id, idx);

                return (
                  <Tooltip key={member.id || idx}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className={`text-white ${bgColorClass}`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">{displayName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No members</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-[10px] font-medium text-muted-foreground">Description</Label>
        <p className="text-xs">{description || 'No description provided.'}</p>{' '}
        {/* Added default text */}
      </div>
      <div>
        <Label className="text-[10px] font-medium text-muted-foreground">Privacy</Label>
        <p className="text-xs">{formatPrivacy(privacySetting as TripPrivacySetting | null)}</p>
      </div>
      <div>
        <Label className="text-[10px] font-medium text-muted-foreground">Tags</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No tags yet</p>
          )}
        </div>
      </div>

      {/* Access Requests Section (Conditional) */}
      {isAdmin && (
        <div className="pt-4 border-t">
          <Label className="text-[10px] font-medium text-muted-foreground">Access Requests</Label>
          {accessRequests && accessRequests.length > 0 ? (
            <ul className="mt-2 space-y-3">
              {accessRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={request.user?.avatar_url || undefined} />
                      <AvatarFallback>{request.user?.name?.substring(0, 1) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{request.user?.name || 'User'}</span>
                    {/* Optional: Show message in a tooltip */}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-600 hover:bg-green-100"
                      onClick={() =>
                        onManageAccessRequest && onManageAccessRequest(request.id, true)
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600 hover:bg-red-100"
                      onClick={() =>
                        onManageAccessRequest && onManageAccessRequest(request.id, false)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">No pending requests.</p>
          )}
        </div>
      )}
    </div>
  );

  if (noCardWrapper) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Details</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
