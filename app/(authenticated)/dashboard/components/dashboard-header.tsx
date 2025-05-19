'use client';

import Link from 'next/link';
import { Settings, MapPin, Calendar, Globe, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
          <Link href="/settings" className="flex items-center gap-2" legacyBehavior>
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
      {/* Stats row - compact, single line */}
      <div className="flex items-center justify-center gap-6 md:gap-10 py-2">
        <StatItem label="Visited" value={travelStats.visitedCount} color="purple" />
        <Separator orientation="vertical" className="mx-2 h-8" />
        <StatItem label="Planned" value={travelStats.plannedCount} color="blue" />
        <Separator orientation="vertical" className="mx-2 h-8" />
        <StatItem label="Wishlist" value={travelStats.wishlistCount} color="pink" />
        <Separator orientation="vertical" className="mx-2 h-8" />
        <StatItem label="Countries" value={travelStats.countriesCount} color="mint" />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'purple' | 'blue' | 'pink' | 'mint';
}) {
  const colorMap = {
    purple: 'text-travel-purple',
    blue: 'text-travel-blue',
    pink: 'text-travel-pink',
    mint: 'text-travel-mint',
  };
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className={`font-semibold text-lg md:text-xl ${colorMap[color]}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
