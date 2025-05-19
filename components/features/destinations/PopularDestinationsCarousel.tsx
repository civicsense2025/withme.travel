'use client';

import { useState, useEffect } from 'react';
import { PopularDestinationCard } from '@/components/destinations/PopularDestinationCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  continent: string | null;
  description: string | null;
  byline?: string | null;
  highlights?: string | null;
  image_url?: string | null;
  emoji?: string | null;
  image_metadata?: any;
  cuisine_rating?: number | null;
  nightlife_rating?: number | null;
  cultural_attractions?: number | null;
  outdoor_activities?: number | null;
  beach_quality?: number | null;
  best_season?: string | null;
  avg_cost_per_day?: number | null;
  safety_rating?: number | null;
  slug?: string | null;
  [key: string]: any;
}

interface PopularDestinationsCarouselProps {
  onSelect: (city: { city: string; country: string; emoji?: string }) => void;
}

// Helper function to get country emoji from country code
const countryCodeToEmoji = (countryCode?: string): string => {
  if (!countryCode) return '🌍';

  try {
    // Convert country code to emoji flag
    const codePoints = [...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌍';
  }
};

export function PopularDestinationsCarousel({ onSelect }: PopularDestinationsCarouselProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/destinations/popular')
      .then((res) => res.json())
      .then((data) => setDestinations(data.destinations || []))
      .catch(() => setError('Failed to load popular destinations'))
      .finally(() => setLoading(false));
  }, []);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  // Handle clicking on the destination card to add it to cities
  const handleDestinationSelect = () => {
    if (!destinations.length) return;

    const destination = destinations[currentIndex];
    const cityName = destination.city || destination.name || '';
    const countryName = destination.country || '';
    const emoji = destination.emoji || undefined;

    if (cityName) {
      onSelect({ city: cityName, country: countryName, emoji });
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-muted-foreground animate-pulse">
        Loading popular destinations…
      </div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (destinations.length === 0) return null;

  const destination = destinations[currentIndex];

  // Use name as primary identifier, fallback to city if needed
  const displayName = destination.name || '';
  const cityName = destination.city || displayName;
  const countryName = destination.country || '';
  const emoji = destination.emoji || undefined;

  // Handle highlights as a string
  const highlightsText = destination.highlights || '';

  // Convert string highlights to array for the DestinationCard if needed
  const highlightsArray = highlightsText ? [highlightsText] : null;

  // Defensive: ensure all required props for DestinationCard
  const cardProps = {
    ...destination,
    name: displayName, // Use name as the primary display
    city: cityName,
    country: countryName,
    continent: destination.continent || '',
    description: destination.description || '',
    cuisine_rating: Number(destination.cuisine_rating) || 0,
    nightlife_rating: Number(destination.nightlife_rating) || 0,
    cultural_attractions: Number(destination.cultural_attractions) || 0,
    outdoor_activities: Number(destination.outdoor_activities) || 0,
    beach_quality: Number(destination.beach_quality) || 0,
    safety_rating: Number(destination.safety_rating) || 0,
    image_url: destination.image_url || undefined,
    best_season: destination.best_season || undefined,
    byline: destination.byline || undefined,
    avg_cost_per_day: destination.avg_cost_per_day ?? undefined,
    // Don't pass slug to avoid navigation issues
  };

  return (
    <div className="space-y-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrev}
          disabled={destinations.length <= 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          {currentIndex + 1} / {destinations.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          disabled={destinations.length <= 1}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full max-w-xl cursor-pointer">
        <PopularDestinationCard
          destination={{
            ...cardProps,
            highlights: highlightsArray,
          }}
          onClick={() => {
            if (cityName) {
              onSelect({ city: cityName, country: countryName, emoji });
            }
          }}
        />
      </div>
      {highlightsText && (
        <div className="mt-4 p-4 bg-muted rounded-lg w-full max-w-xl">
          <h4 className="font-semibold mb-2">Highlights</h4>
          <div
            className="text-muted-foreground text-sm"
            dangerouslySetInnerHTML={{ __html: highlightsText }}
          />
        </div>
      )}
    </div>
  );
}
