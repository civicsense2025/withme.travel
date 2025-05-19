'use client';
import { TripCard } from '@/components/ui/features/trips/molecules/TripCard';

import { TripRole } from '@/utils/constants/status';
// import type { Database } from '@/types/database.types';
// type TripRole = Database['public']['Enums']['trip_role'];

import Link from 'next/link';
// Trip interface
interface Trip {
  id: string;
  name: string;
  created_by: string;
  destination_id?: string;
  destination_name?: string;
  start_date?: string;
  end_date?: string;
  date_flexibility?: string;
  travelers_count?: number;
  vibe?: string;
  budget?: string;
  is_public: boolean;
  slug?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at?: string;

  // Fields added by the API
  title?: string;
  description?: string;
  cover_image?: string;
  members?: number;
  role: TripRole | null;
}

export function TripsList({ trips }: { trips: Trip[] }) {
  if (!trips || trips.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">You haven't created any trips yet.</p>
        <p className="mt-2">
          <Link href="/trips/create" className="underline hover:text-primary">
            Create your first trip
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard 
          key={trip.id} 
          id={trip.id}
          name={trip.name}
          destination={trip.destination_name}
          startDate={trip.start_date}
          endDate={trip.end_date}
          coverImageUrl={trip.cover_image_url}
          memberCount={trip.members}
          isPublic={trip.is_public}
        />
      ))}
    </div>
  );
}
