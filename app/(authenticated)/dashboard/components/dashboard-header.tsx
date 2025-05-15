'use client';

import Link from 'next/link';
import { Settings, MapPin, Calendar, Globe, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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
  // Get initial for avatar fallback
  const initial = userName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex flex-col items-center justify-center text-center mb-12 relative">
      {/* Settings button - positioned absolutely to maintain clean centered layout */}
      <div className="absolute right-0 top-0">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Settings</span>
          </Link>
        </Button>
      </div>

      {/* Avatar with border */}
      <Avatar className="h-24 w-24 border-4 border-background shadow-md mb-4">
        <AvatarImage src={avatarUrl || undefined} alt={userName} />
        <AvatarFallback className="text-xl">{initial}</AvatarFallback>
      </Avatar>
      
      {/* User name with welcome message */}
      <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {userName}</h1>
      <p className="text-muted-foreground mb-6 text-sm flex items-center justify-center">
        <UserIcon className="h-4 w-4 mr-1.5 inline" />
        Your personal travel organizer
      </p>

      {/* Stats cards */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl">
        <Card className="bg-travel-purple/10 border-none">
          <CardContent className="flex flex-col items-center py-3 px-6">
            <span className="text-2xl font-bold text-travel-purple">{travelStats.visitedCount}</span>
            <span className="text-xs text-muted-foreground">Visited</span>
          </CardContent>
        </Card>
        
        <Card className="bg-travel-blue/10 border-none">
          <CardContent className="flex flex-col items-center py-3 px-6">
            <span className="text-2xl font-bold text-travel-blue">{travelStats.plannedCount}</span>
            <span className="text-xs text-muted-foreground">Planned</span>
          </CardContent>
        </Card>
        
        <Card className="bg-travel-pink/10 border-none">
          <CardContent className="flex flex-col items-center py-3 px-6">
            <span className="text-2xl font-bold text-travel-pink">{travelStats.wishlistCount}</span>
            <span className="text-xs text-muted-foreground">Wishlist</span>
          </CardContent>
        </Card>
        
        <Card className="bg-travel-mint/10 border-none">
          <CardContent className="flex flex-col items-center py-3 px-6">
            <span className="text-2xl font-bold text-travel-mint">{travelStats.countriesCount}</span>
            <span className="text-xs text-muted-foreground">Countries</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
