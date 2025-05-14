'use client';

import { useState } from 'react';
import TripsClientPage from '../trips-client';
import { PopularDestinations } from '@/components/destinations/popular-destinations';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TripTabsWrapper } from './TripTabsWrapper';

// Types
interface Trip {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  status: string | null;
  destination_id: string | null;
  destination_name: string | null;
  cover_image_url: string | null;
  created_by: string;
  is_public: boolean | null;
  privacy_setting: string | null;
  description: string | null;
}

interface TripMember {
  role: string;
  joined_at: string | null;
  trip: Trip;
}

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
  // Render destinations based on user profile if available
  const getDestinationParams = () => {
    if (!userProfile) return {};
    
    return {
      interests: userProfile.interests || [],
      homeLocation: userProfile.home_location_name || null
    };
  };
  
  // Define tab content
  const tabs = [
    {
      value: 'planned',
      label: 'Planned Trips',
      content: (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Link href="/trips/create">
              <Button className="flex items-center rounded-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Trip
              </Button>
            </Link>
          </div>
          
          <TripsClientPage initialTrips={initialTrips} userId={userId} isGuest={isGuest} />
        </div>
      ),
    },
    {
      value: 'groups',
      label: 'Groups',
      content: (
        <div className="text-center p-8 bg-card rounded-xl border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Your Travel Groups</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md mx-auto">
            Connect with friends and plan trips together. Create or join a group to get started.
          </p>
          <Link href="/groups">
            <Button size="lg" className="rounded-full px-8">
              Explore Groups
            </Button>
          </Link>
        </div>
      ),
    },
    {
      value: 'saved',
      label: 'Saved',
      content: (
        <div className="text-center p-8 bg-card rounded-xl border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Saved Trips & Destinations</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md mx-auto">
            Keep track of places you want to visit and trips you've saved for inspiration.
          </p>
          <Link href="/saved">
            <Button size="lg" className="rounded-full px-8">
              View Saved Items
            </Button>
          </Link>
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-8">
      <TripTabsWrapper tabs={tabs} defaultValue="planned" />
      
      {/* Popular Destinations Section */}
      <div className="pt-4 border-t">
        <PopularDestinations {...getDestinationParams()} />
      </div>
    </div>
  );
} 