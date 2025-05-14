'use client';

import Link from 'next/link';
import { Settings, MapPin, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TravelStats {
  visitedCount: number;
  plannedCount: number;
  wishlistCount: number;
  countriesCount: number;
}

interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string | null;
  travelStats: TravelStats;
}

export function DashboardHeader({ userName, avatarUrl, travelStats }: DashboardHeaderProps) {
  // Format the travel journey text
  const travelJourneyText = `${travelStats.visitedCount} destinations visited · ${travelStats.countriesCount} countries explored`;

  // Get initial for avatar fallback
  const initial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-muted">
          <AvatarImage src={avatarUrl || undefined} alt={userName} />
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{userName}'s Travel Organizer</h1>
          <p className="text-muted-foreground mt-1 flex items-center">
            <Globe className="h-4 w-4 mr-1 inline" />
            {travelJourneyText}
          </p>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link href="/settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </Button>
    </div>
  );
}
