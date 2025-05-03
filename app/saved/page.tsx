'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Bookmark, Map, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { LikeButton } from '@/components/like-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useLikes } from '@/hooks/use-likes';

export default function SavedPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Saved Items</h1>
      <p className="text-lg text-muted-foreground">This feature is coming soon. Stay tuned!</p>
    </div>
  );
}

function DestinationCard({ destination, onUnlike }: { destination: any; onUnlike?: () => void }) {
  // Get country code for flag emoji
  const getCountryFlag = (countryName: string) => {
    // This is a simplified version - in production you'd want a more robust mapping
    const countryFlags: Record<string, string> = {
      Japan: '🇯🇵',
      Italy: '🇮🇹',
      France: '🇫🇷',
      Spain: '🇪🇸',
      'United States': '🇺🇸',
      Thailand: '🇹🇭',
      Mexico: '🇲🇽',
      Brazil: '🇧🇷',
      UK: '🇬🇧',
      Greece: '🇬🇷',
    };

    return countryFlags[countryName] || '🏳️';
  };

  // Get tags for this destination
  const getTags = () => {
    const tags = [];
    if (destination.cuisine_rating >= 4) tags.push('food');
    if (destination.nightlife_rating >= 4) tags.push('nightlife');
    if (destination.cultural_attractions >= 4) tags.push('history');
    if (destination.outdoor_activities >= 4) tags.push('outdoors');
    if (destination.beach_quality >= 4) tags.push('beach');
    return tags.slice(0, 3);
  };

  const tags = getTags();

  return (
    <Link
      href={`/destinations/${destination.city ? destination.city.toLowerCase().replace(/\s+/g, '-') : `destination-${destination.id}`}`}
    >
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border">
        <div className="relative h-48 w-full bg-travel-purple/10">
          <div className="absolute top-3 right-3 z-10">
            <LikeButton
              itemId={destination.id}
              itemType="destination"
              size="sm"
              className="shadow-sm"
              onClick={(isLiked) => { if (!isLiked && onUnlike) onUnlike(); }}
            />
          </div>
          <Image
            src={
              destination.image_url ||
              `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(destination.name || destination.city)}`
            }
            alt={destination.name || destination.city}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getCountryFlag(destination.country)}</span>
            <h3 className="text-xl font-bold">{destination.city.toLowerCase()}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-sm px-4 py-1.5 rounded-full ${
                  tag === 'food'
                    ? 'bg-travel-mint/80 text-travel-mint-foreground'
                    : tag === 'nightlife'
                      ? 'bg-travel-peach/80 text-travel-peach-foreground'
                      : tag === 'history'
                        ? 'bg-travel-blue/80 text-travel-blue-foreground'
                        : tag === 'outdoors'
                          ? 'bg-travel-purple/80 text-travel-purple-foreground'
                          : 'bg-travel-yellow/80 text-travel-yellow-foreground'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {destination.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {destination.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// Placeholder components for itineraries and attractions
// These will be implemented when those features are ready
function ItineraryCard({ itinerary, onUnlike }: { itinerary: any; onUnlike?: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-travel-blue/20">
        <div className="absolute top-3 right-3 z-10">
          <LikeButton
            itemId={itinerary.id}
            itemType="itinerary"
            size="sm"
            className="shadow-sm"
            onClick={(isLiked) => { if (!isLiked && onUnlike) onUnlike(); }}
          />
        </div>
        {/* Placeholder image */}
        <div className="flex items-center justify-center h-full">
          <FileText className="h-16 w-16 text-travel-blue" />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">Itinerary (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">Itinerary details will be displayed here</p>
      </CardContent>
    </Card>
  );
}

function AttractionCard({ attraction, onUnlike }: { attraction: any; onUnlike?: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-travel-yellow/20">
        <div className="absolute top-3 right-3 z-10">
          <LikeButton
            itemId={attraction.id}
            itemType="attraction"
            size="sm"
            className="shadow-sm"
            onClick={(isLiked) => { if (!isLiked && onUnlike) onUnlike(); }}
          />
        </div>
        {/* Placeholder image */}
        <div className="flex items-center justify-center h-full">
          <MapPin className="h-16 w-16 text-travel-yellow" />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">Attraction (Coming Soon)</h3>
        <p className="text-sm text-muted-foreground">Attraction details will be displayed here</p>
      </CardContent>
    </Card>
  );
}