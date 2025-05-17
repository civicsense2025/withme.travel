'use client';

import { useState } from 'react';
import TripsClientPage from '../trips-client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TripTabsWrapper } from './TripTabsWrapper';
import { TripMember } from '@/lib/api';

// Types for userProfile which is not exported from lib/api
interface UserProfile {
  id: string;
  interests?: string[];
  home_location_name?: string | null;
  travel_personality?: string | null;
  [key: string]: any; // For other profile fields
}

interface TripTabsProps {
  initialTrips: TripMember[];
  userId?: string;
  isGuest?: boolean;
  userProfile?: UserProfile | null;
}

export function TripTabs({ initialTrips, userId = '', isGuest = false, userProfile }: TripTabsProps) {
  // Define tab content
  const tabs = [
    {
      value: 'planned',
      label: 'Planned Trips',
      content: (
        <>
          <div className="space-y-6">
            <TripsClientPage initialTrips={initialTrips} userId={userId} isGuest={isGuest} />
          </div>
        </>
      ),
    },
    {
      value: 'groups',
      label: 'Groups',
      content: (
        <div className="text-center p-8 bg-card rounded-xl border shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Your Groups</h3>
          <p className="text-muted-foreground mb-4">
            Create or join groups to plan trips together with friends and family.
          </p>
          <Link href="/groups">
            <Button variant="outline">View Groups</Button>
          </Link>
        </div>
      ),
    },
    {
      value: 'saved',
      label: 'Saved',
      content: (
        <div className="text-center p-8 bg-card rounded-xl border shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Saved Items</h3>
          <p className="text-muted-foreground mb-4">
            View destinations, trips, and other items you've saved for later.
          </p>
          <Link href="/saved">
            <Button variant="outline">View Saved Items</Button>
          </Link>
        </div>
      ),
    },
  ];
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <TripTabsWrapper tabs={tabs} defaultValue="planned" />
    </div>
  );
} 