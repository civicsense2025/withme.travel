'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, LinkIcon, Clock, MapPin, Calendar, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrapedUrlData, DisplayItineraryItem } from '@/types/itinerary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EventUrlInputProps {
  tripId: string;
  userId: string;
  onEventAdded: (newItem: DisplayItineraryItem) => void;
  dayNumber?: number;
}

export function EventUrlInput({ tripId, userId, onEventAdded, dayNumber }: EventUrlInputProps) {
  const [url, setUrl] = useState<string>('');
  const [scrapedData, setScrapedData] = useState<ScrapedUrlData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear previous data when URL changes
    if (scrapedData) {
      setScrapedData(null);
    }
    if (error) {
      setError(null);
    }
  };

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      // Basic URL validation
      new URL(url);
    } catch (err) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary/scrape-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to scrape URL: ${response.statusText}`);
      }

      const data = await response.json();
      setScrapedData(data);
    } catch (err) {
      console.error('Error scraping URL:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load event details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!scrapedData || !tripId || !userId) return;

    setIsSaving(true);

    try {
      // Prepare itinerary item from scraped data
      const itemData = {
        trip_id: tripId,
        title: scrapedData.title || 'Event from URL',
        description: scrapedData.description || '',
        location: null,
        address: null,
        category: 'Event',
        created_by: userId,
        status: 'pending',
        cover_image_url: scrapedData.imageUrl || null,
        day_number: dayNumber || null,
        canonical_url: scrapedData.scrapedUrl,
      };

      // Send request to add item to itinerary
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to add event: ${response.statusText}`);
      }

      const newItem = await response.json();

      // Notify parent component
      onEventAdded(newItem);

      // Reset form
      setUrl('');
      setScrapedData(null);

      // Show success message
      toast({
        title: 'Event Added',
        description: 'The event has been added to your itinerary.',
      });
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err.message : 'Failed to add event. Please try again.');

      toast({
        title: 'Error Adding Event',
        description: err instanceof Error ? err.message : 'Failed to add event to itinerary',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste event URL (e.g., eventbrite.com/...)"
            disabled={isLoading || isSaving}
          />
          <Button onClick={handleScrapeUrl} disabled={isLoading || isSaving || !url.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              'Get Event'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <Info className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle>{scrapedData.title || 'Event Details'}</CardTitle>
            <CardDescription>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <LinkIcon className="h-3 w-3 mr-1" />
                <a
                  href={scrapedData.scrapedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline truncate"
                >
                  {scrapedData.scrapedUrl}
                </a>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scrapedData.description && (
              <p className="text-sm mb-4 line-clamp-3">{scrapedData.description}</p>
            )}
            {scrapedData.imageUrl && (
              <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                <img
                  src={scrapedData.imageUrl}
                  alt={scrapedData.title || 'Event image'}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={() => setScrapedData(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Itinerary'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
