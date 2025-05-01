'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { formatDateRange } from '@/lib/utils'; // Assuming formatDateRange is in lib/utils

// Define TripPrivacySetting type locally or import if defined elsewhere
type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

interface TripSidebarContentProps {
  description: string | null;
  privacySetting: TripPrivacySetting | null;
  startDate: string | null;
  endDate: string | null;
  tags: { id: string; name: string }[];
  canEdit: boolean;
  onEdit: () => void;
}

export function TripSidebarContent({
  // Export the component
  description,
  privacySetting,
  startDate,
  endDate,
  tags,
  canEdit,
  onEdit,
}: TripSidebarContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Description</Label>
          <p className="text-sm">{description || 'No description provided.'}</p>{' '}
          {/* Added default text */}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Privacy</Label>
          <p className="text-sm capitalize">
            {privacySetting?.replace('_', ' ') || 'Private'}
          </p>{' '}
          {/* Improved display */}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Dates</Label>
          <p className="text-sm">
            {startDate && endDate ? formatDateRange(startDate, endDate) : 'Dates not set'}
          </p>{' '}
          {/* Added default text */}
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {tags && tags.length > 0 ? (
              tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tags added</p>
            )}
          </div>
        </div>
        {canEdit && (
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onEdit}>
            {' '}
            {/* Added margin-top */}
            <Pencil className="mr-2 h-3 w-3" /> Edit Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Default export
export default TripSidebarContent;
