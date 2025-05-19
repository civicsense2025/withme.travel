import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar } from 'lucide-react';

export interface ProcessedVotes {
  up: number;
  down: number;
  upVoters: string[];
  downVoters: string[];
  userVote?: 'up' | 'down';
}

export interface EnhancedDisplayItem {
  id: string;
  trip_id: string;
  title: string;
  created_at: string;
  section_id: string;
  type: string;
  item_type: string | null;
  date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  place_id?: string | null;
  latitude?: number;
  longitude?: number;
  estimated_cost?: number;
  currency?: string;
  notes?: string;
  description?: string;
  updated_at?: string;
  created_by?: string;
  is_custom?: boolean;
  day_number?: number;
  category?: string;
  status?: string;
  position?: number;
  duration_minutes?: number;
  cover_image_url?: string;
  creator_profile?: any;
  votes: ProcessedVotes;
  user_vote?: string;
  creatorProfile?: any;
  place?: any;
  formattedCategory?: string;
}

export interface ItineraryDisplayProps {
  initialItems: EnhancedDisplayItem[];
  tripId: string;
  canEdit: boolean;
}

export function ItineraryDisplay({ initialItems, tripId, canEdit }: ItineraryDisplayProps) {
  // Group items by date
  const itemsByDate = initialItems.reduce((acc, item) => {
    const date = item.date || 'Unscheduled';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, EnhancedDisplayItem[]>);

  // Sort dates
  const sortedDates = Object.keys(itemsByDate).sort((a, b) => {
    if (a === 'Unscheduled') return 1;
    if (b === 'Unscheduled') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const formatDate = (dateString: string) => {
    if (dateString === 'Unscheduled') return 'Unscheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <Card key={date} className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {formatDate(date)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {itemsByDate[date].map((item) => (
                <li
                  key={item.id}
                  className="p-4 border rounded-md hover:bg-slate-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.title}</h3>
                    {item.category && (
                      <Badge variant="outline">{item.category}</Badge>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {(item.start_time || item.end_time) && (
                      <span className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {item.start_time || ''} 
                        {item.start_time && item.end_time ? ' - ' : ''} 
                        {item.end_time || ''}
                      </span>
                    )}
                    
                    {item.location && (
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {item.location}
                      </span>
                    )}
                    
                    {item.estimated_cost && (
                      <span className="flex items-center">
                        ${item.estimated_cost}
                        {item.currency && ` ${item.currency}`}
                      </span>
                    )}
                  </div>
                  
                  {canEdit && (
                    <div className="mt-3 flex justify-end">
                      <div className="text-sm flex items-center space-x-3">
                        <span>
                          👍 {item.votes.up}
                        </span>
                        <span>
                          👎 {item.votes.down}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
