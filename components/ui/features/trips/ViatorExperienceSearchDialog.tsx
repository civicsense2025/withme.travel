'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ViatorExperienceGrid } from './ViatorExperienceGrid';
import { ViatorExperienceProps } from './ViatorExperienceCard';
import { Loader2, Palmtree, Plus, Search } from 'lucide-react';
import { appendViatorAffiliate } from '@/utils/api/viator';

interface ViatorExperienceSearchDialogProps {
  tripId: string;
  destinationName?: string;
  destinationId?: string;
  viatorDestinationId?: string;
  onAddToItinerary?: (experience: ViatorExperienceProps) => void;
  trigger?: React.ReactNode;
}

export function ViatorExperienceSearchDialog({
  tripId,
  destinationName,
  destinationId,
  viatorDestinationId,
  onAddToItinerary,
  trigger,
}: ViatorExperienceSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(destinationName || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ViatorExperienceProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Use our API endpoint to search for experiences
      const apiUrl = `/api/viator/search?query=${encodeURIComponent(searchQuery)}&limit=15${viatorDestinationId ? `&destId=${viatorDestinationId}` : ''}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Transform the API response to match our experience props
        const transformedResults = data.data.map((item: any) => ({
          id: item.code,
          title: item.title,
          description: item.description || item.shortDescription,
          imageUrl: item.thumbnailHiResURL || item.thumbnailURL,
          price: item.price?.formattedValue || '$0.00',
          duration: item.duration,
          rating: item.rating,
          reviewCount: item.reviewCount,
          location: item.primaryDestinationName || destinationName,
          productUrl: appendViatorAffiliate(item.webURL),
          productCode: item.code,
          labels: item.categories?.map((cat: any) => cat.name) || [],
          _isRealData: true,
        }));

        setSearchResults(transformedResults);

        if (transformedResults.length === 0) {
          setError('No experiences found for your search');
        }
      } else {
        setError('No experiences found for your search');
      }
    } catch (err: any) {
      console.error('Error searching experiences:', err);
      setError(err.message || 'Failed to search experiences. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToItinerary = (experience: ViatorExperienceProps) => {
    if (onAddToItinerary) {
      onAddToItinerary(experience);
    }

    // Optionally close the dialog after adding to itinerary
    // setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Palmtree className="mr-2 h-4 w-4" />
            Find Tours & Activities
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Find Experiences for Your Trip</DialogTitle>
          <DialogDescription>
            Search thousands of tours, activities, and attractions from Viator. Add them to your
            itinerary or book directly.
          </DialogDescription>
        </DialogHeader>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6 mt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search-query">Destination or Activity</Label>
              <div className="flex">
                <Input
                  id="search-query"
                  placeholder="E.g., Paris, Cooking Class, Boat Tour..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-r-none"
                />
                <Button type="submit" className="rounded-l-none" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </form>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="mb-4">
            <ViatorExperienceGrid
              title="Available Experiences"
              subtitle={`${searchResults.length} experiences found for "${searchQuery}"`}
              experiences={searchResults.map((exp) => ({
                ...exp,
                description: exp.description || undefined,
              }))}
              tripId={tripId}
              categories={[...new Set(searchResults.flatMap((exp) => exp.labels || []))].slice(
                0,
                5
              )}
            />
          </div>
        ) : (
          !isSearching && (
            <div className="mb-6 rounded-lg bg-surface-subtle p-10 text-center">
              <Palmtree className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Search for experiences</h3>
              <p className="text-secondary-text">
                Search by destination, activity type, or specific attraction to find the perfect
                experiences for your trip.
              </p>
            </div>
          )
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
