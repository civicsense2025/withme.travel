'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ViatorExperienceGrid } from './ViatorExperienceGrid';
import { ViatorExperienceProps } from './ViatorExperienceCard';
import { Loader2, Palmtree, Plus, Search } from 'lucide-react';
import { searchViatorExperiences } from '@/utils/api/viator';

interface ViatorExperienceSearchDialogProps {
  tripId: string;
  destinationName?: string;
  destinationId?: string;
  onAddToItinerary?: (experience: ViatorExperienceProps) => void;
  trigger?: React.ReactNode;
}

export function ViatorExperienceSearchDialog({
  tripId,
  destinationName,
  destinationId,
  onAddToItinerary,
  trigger
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
      // This is a mock response for now until we implement the backend
      // Replace with actual API call in production
      
      // Mock API call timing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results
      const mockResults: ViatorExperienceProps[] = [
        {
          id: '1',
          title: 'Skip-the-Line Eiffel Tower Tour with Summit Access',
          description: 'Skip the long lines at the Eiffel Tower with this tour that includes summit access.',
          imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
          price: '$89.99',
          duration: '2 hours',
          rating: 4.8,
          reviewCount: 3240,
          location: 'Paris, France',
          productUrl: 'https://www.viator.com/tours/Paris/Skip-the-Line-Eiffel-Tower-Tour',
          productCode: 'EIFFEL123',
          labels: ['Skip-the-Line', 'Guided Tour']
        },
        {
          id: '2',
          title: 'Notre-Dame Cathedral and Latin Quarter Walking Tour',
          description: 'Explore the Latin Quarter and Notre-Dame Cathedral on this guided walking tour.',
          imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94',
          price: '$45.99',
          duration: '3 hours',
          rating: 4.6,
          reviewCount: 1854,
          location: 'Paris, France',
          productUrl: 'https://www.viator.com/tours/Paris/Notre-Dame-Latin-Quarter-Tour',
          productCode: 'PARIS456',
          labels: ['Walking Tour', 'Historical']
        },
        {
          id: '3',
          title: 'Paris Seine River Dinner Cruise',
          description: 'Enjoy a gourmet dinner with live music while cruising on the Seine River.',
          imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
          price: '$120.00',
          duration: '2.5 hours',
          rating: 4.7,
          reviewCount: 2156,
          location: 'Paris, France',
          productUrl: 'https://www.viator.com/tours/Paris/Seine-Dinner-Cruise',
          productCode: 'SEINE789',
          labels: ['Dinner', 'Cruise']
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Error searching Viator experiences:', err);
      setError('Failed to search for experiences. Please try again.');
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
            Search thousands of tours, activities, and attractions from Viator. Add them to your itinerary or book directly.
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
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-r-none"
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none"
                  disabled={isSearching}
                >
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
              experiences={searchResults}
              tripId={tripId}
              categories={['Skip-the-Line', 'Walking Tour', 'Dinner', 'Cruise', 'Guided Tour']}
            />
          </div>
        ) : (
          !isSearching && (
            <div className="mb-6 rounded-lg bg-surface-subtle p-10 text-center">
              <Palmtree className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Search for experiences</h3>
              <p className="text-secondary-text">
                Search by destination, activity type, or specific attraction to find the perfect experiences for your trip.
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