'use client';

import { MapPin, Calendar, Globe, BookmarkCheck } from 'lucide-react';

interface TravelStats {
  visitedCount: number;
  plannedCount: number;
  wishlistCount: number;
  countriesCount: number;
}

interface TravelStatCardsProps {
  travelStats: TravelStats;
}

export function TravelStatCards({ travelStats }: TravelStatCardsProps) {
  const { visitedCount, plannedCount, wishlistCount, countriesCount } = travelStats;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Visited</h3>
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-bold">{visitedCount}</p>
        <p className="text-xs text-muted-foreground">destinations</p>
      </div>

      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Planned</h3>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-bold">{plannedCount}</p>
        <p className="text-xs text-muted-foreground">trips</p>
      </div>

      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Wishlist</h3>
          <BookmarkCheck className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-bold">{wishlistCount}</p>
        <p className="text-xs text-muted-foreground">destinations</p>
      </div>

      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Countries</h3>
          <Globe className="h-4 w-4 text-primary" />
        </div>
        <p className="text-2xl font-bold">{countriesCount}</p>
        <p className="text-xs text-muted-foreground">visited</p>
      </div>
    </div>
  );
}
