'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast'
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { TRIP_ROLES } from '@/utils/constants/status';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

// Import the client wrapper instead of using dynamic import with ssr: false
import EditTripFormWrapper from './edit-trip-form-wrapper';

// Define field constants for use in queries
const TRIP_MEMBERS_TABLE = 'trip_members';
const USER_ID_FIELD = 'user_id';
const TRIP_ID_FIELD = 'trip_id';
const ROLE_FIELD = 'role';
const ID_FIELD = 'id';

// Force dynamic rendering for this page since it uses auth
export const dynamicParams = true;

// Define a type specifically for the data structure returned by this page's query
interface FetchedTripData {
  id: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  cover_image_url: string | null;
  // -se imported enum type or literal union type for privacy_setting
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null;
  // Type for the joined destination data (since it's a single record)
  destinations: {
    id: string;
    name: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
  } | null;
  // Type for the joined tags data
  trip_tags: Array<{
    tags: {
      id: string;
      name: string;
    } | null;
  }> | null;
}

// Define the expected shape of the page props
interface PageProps {
  params: Promise<{
    tripId: string;
  }>;
}

// Define a separate interface that matches what the form wrapper needs
interface TripData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  destination_id: string | null;
  cover_image_url: string | null;
  privacy_setting: 'private' | 'shared_with_link' | 'public';
  tags: string[];
}

export default function EditTripPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const router = useRouter();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) return;

      try {
        setIsLoading(true);
        const supabase = getBrowserClient();

        const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();

        if (error) throw error;

        setTrip(data);
      } catch (error) {
        console.error('Error fetching trip:', error);
        toast({
          title: 'Error',
          description: 'Failed to load trip details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, toast]);

  // Handle trip update
  const handleUpdateTrip = async (updatedTrip: any) => {
    try {
      const supabase = getBrowserClient();

      const { error } = await supabase.from('trips').update(updatedTrip).eq('id', tripId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Trip updated successfully',
      });

      // Navigate back to trip page
      router.push(`/trips/${tripId}`);
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trip details',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center">Loading trip details...</div>;
  }

  if (!trip) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
        <p>The trip you're looking for doesn't exist or you don't have permission to edit it.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Trip</h1>

      {/* This is just a placeholder - actual form component would be imported */}
      <div className="bg-muted p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trip Name</label>
            <input type="text" className="w-full p-2 border rounded-md" defaultValue={trip.name} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              defaultValue={trip.destination}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                defaultValue={trip.start_date}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                defaultValue={trip.end_date}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              onClick={() => router.push(`/trips/${tripId}`)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-travel-purple text-white rounded-md hover:bg-travel-purple/90"
              onClick={() => {
                // Simulate form submission
                const updatedTrip = {
                  ...trip,
                  name: trip.name || 'Updated Trip',
                };
                handleUpdateTrip(updatedTrip);
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
