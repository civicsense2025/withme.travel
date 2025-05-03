'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type TripRole } from '@/utils/constants/status';
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
  description: string | null;
  privacySetting: TripPrivacySetting | null;
  startDate: string | null;
  endDate: string | null;
  tags: { id: string; name: string }[];
  canEdit: boolean;
  userRole: TripRole | null; // Add userRole to determine if they can manage requests
  accessRequests: AccessRequest[];
  onEdit: () => void;
  onManageAccessRequest: (requestId: string, approve: boolean) => void; // Callback to handle approval/rejection
}

export function TripSidebarContent({
  // Export the component
  description,
  privacySetting,
  startDate,
  endDate,
  tags,
  canEdit,
  userRole,
  accessRequests,
  onEdit,
  onManageAccessRequest,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-[10px] font-medium text-muted-foreground">Description</Label>
          <p className="text-xs">{description || 'No description provided.'}</p>{' '}
          {/* Added default text */}
        </div>
        <div>
          <Label className="text-[10px] font-medium text-muted-foreground">Privacy</Label>
          <p className="text-xs">{formatPrivacy(privacySetting)}</p>
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
                        <AvatarFallback>
                          {request.user?.name?.substring(0, 1) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{request.user?.name || 'User'}</span>
                      {/* Optional: Show message in a tooltip */}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-600 hover:bg-green-100"
                        onClick={() => onManageAccessRequest(request.id, true)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:bg-red-100"
                        onClick={() => onManageAccessRequest(request.id, false)}
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
      </CardContent>
    </Card>
  );
}

// Default export
export default TripSidebarContent;
