'use client';

import Link from 'next/link';
import { PlusCircle, MapPin, CalendarCheck, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TravelStats {
  visitedCount: number;
  plannedCount: number;
  wishlistCount: number;
  countriesCount: number;
}

interface QuickActionsSidebarProps {
  travelStats: TravelStats;
}

export function QuickActionsSidebar({ travelStats }: QuickActionsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          <CardDescription>Tools to enhance your travel experience</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link
            href="/trips/create"
            className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-purple/10 hover:bg-travel-purple/20 transition-colors"
            legacyBehavior>
            <PlusCircle className="mr-3 h-5 w-5 text-travel-purple" />
            <span className="font-medium">Plan a new trip</span>
          </Link>

          <Link
            href="/destinations"
            className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-blue/10 hover:bg-travel-blue/20 transition-colors"
            legacyBehavior>
            <MapPin className="mr-3 h-5 w-5 text-travel-blue" />
            <span className="font-medium">Explore destinations</span>
          </Link>

          <Link
            href="/itineraries"
            className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-pink/10 hover:bg-travel-pink/20 transition-colors"
            legacyBehavior>
            <CalendarCheck className="mr-3 h-5 w-5 text-travel-pink" />
            <span className="font-medium">Browse itineraries</span>
          </Link>

          <Link
            href="/travel-map"
            className="w-full flex items-center px-4 py-3 rounded-lg bg-travel-mint/10 hover:bg-travel-mint/20 transition-colors"
            legacyBehavior>
            <Globe className="mr-3 h-5 w-5 text-travel-mint" />
            <span className="font-medium">Your travel map</span>
          </Link>
        </CardContent>
      </Card>
      {/* Travel Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Travel Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-travel-purple">{travelStats.visitedCount}</p>
              <p className="text-sm text-muted-foreground">Destinations</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-travel-blue">{travelStats.plannedCount}</p>
              <p className="text-sm text-muted-foreground">Planned Trips</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-travel-pink">{travelStats.wishlistCount}</p>
              <p className="text-sm text-muted-foreground">Wishlist</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-travel-mint">{travelStats.countriesCount}</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
