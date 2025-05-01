import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for the component types
interface ItineraryTemplateItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  item_order: number;
}

interface ItineraryTemplateSection {
  id: string;
  title: string;
  day_number: number;
  position: number;
  items: ItineraryTemplateItem[];
}

interface ItineraryTemplate {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  destination_id: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
  like_count: number;
  tags: string[];
  metadata: Record<string, any>;
  destination?: {
    id: string;
    city: string;
    country: string;
    image_url: string | null;
  };
}

interface ItineraryTemplateDisplayProps {
  template: ItineraryTemplate;
  sections: ItineraryTemplateSection[];
}

// Format time helper function (12-hour format)
function formatTime(timeString: string | null): string {
  if (!timeString) return '';
  
  try {
    // Assuming timeString is in format HH:MM:SS
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original string if parsing fails
  }
}

// Item component
const ItemDisplay = ({ item, index }: { item: ItineraryTemplateItem; index: number }) => (
  <div className="p-4 border-b last:border-b-0">
    <div className="flex justify-between items-start gap-4">
      <div className="flex gap-3">
        <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center">
          {index + 1}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">{item.title}</h4>
          
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
          
          {item.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {(item.start_time || item.end_time) && (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {item.start_time && formatTime(item.start_time)}
          {item.start_time && item.end_time && ' - '}
          {item.end_time && formatTime(item.end_time)}
        </div>
      )}
    </div>
  </div>
);

// Main component
export function ItineraryTemplateDisplay({ template, sections }: ItineraryTemplateDisplayProps) {
  // Sort sections by day number
  const sortedSections = [...sections].sort((a, b) => a.day_number - b.day_number);
  
  // Use the first section's ID as the default tab value, or a fallback
  const defaultTabValue = sortedSections.length > 0 ? sortedSections[0].id : 'day-1';

  console.log(`[DEBUG] ItineraryTemplateDisplay - template.id: ${template.id}, title: ${template.title}`);
  console.log(`[DEBUG] ItineraryTemplateDisplay - Received ${sections.length} sections`);
  
  if (sections.length === 0) {
    console.log('[DEBUG] ItineraryTemplateDisplay - No sections found for this template');
  } else {
    sections.forEach(section => {
      console.log(`[DEBUG] ItineraryTemplateDisplay - Section: ${section.id}, day: ${section.day_number}, items: ${section.items.length}`);
      if (section.items.length > 0) {
        console.log(`[DEBUG] ItineraryTemplateDisplay - Items for section ${section.id}: ${section.items.map(item => item.title).join(', ')}`);
      }
    });
  }
  
  return (
    <div className="space-y-8">
      {/* Template Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{template.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">
              {template.duration_days} {template.duration_days === 1 ? 'day' : 'days'}
            </span>
          </div>
          
          {template.destination && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {template.destination.city}, {template.destination.country}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Last updated {formatDate(template.updated_at)}
            </span>
          </div>
        </div>
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {template.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {template.description && (
          <p className="text-muted-foreground mt-2">
            {template.description}
          </p>
        )}
      </div>
      
      {/* Day Sections using Tabs */}
      {sortedSections.length > 0 ? (
        <Tabs defaultValue={defaultTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-4"> {/* Adjust grid-cols based on typical max days? Or make scrollable? */} 
            {sortedSections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {/* Use section.title if available, otherwise default to Day X */}
                {section.title || `Day ${section.day_number}`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sortedSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-4">
              {/* We can wrap content in a Card if desired, or just list items */}
              <Card>
                <CardContent className="p-0">
                  {section.items
                    .sort((a, b) => a.item_order - b.item_order)
                    .map((item, idx) => (
                      <ItemDisplay key={item.id} item={item} index={idx} />
                    ))}
                  {section.items.length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground italic text-center">
                      No activities planned for this day yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              This itinerary doesn't have any days or activities planned yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// This can be imported in utils/date-utils.ts
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
} 