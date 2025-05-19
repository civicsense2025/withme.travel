'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast'
// import { TripFocusContainer } from '@/components/trips/trip-focus-container';

// Dynamically import the client component with no SSR
const EditTripForm = dynamic(
  () => import('@/app/trips/components/EditTripForm').then((mod) => mod.EditTripForm),
  { ssr: false }
);

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

interface TripFormData {
  name: string;
  privacy_setting: 'private' | 'shared_with_link' | 'public';
  cover_image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  destination_id?: string | null;
  tags?: string[] | null;
  cities?: Array<{
    id: string;
    name: string;
    country: string;
    [key: string]: any;
  }>;
}

interface EditTripFormWrapperProps {
  trip: TripData;
  initialDestinationName?: string;
  tripId: string;
}

export default function EditTripFormWrapper({
  trip,
  initialDestinationName,
  tripId,
}: EditTripFormWrapperProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data: TripFormData) => {
    setIsLoading(true);
    try {
      console.log('Save data:', data);

      // Step 1: Update the trip details
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          destination_id: data.destination_id,
          cover_image_url: data.cover_image_url,
          privacy_setting: data.privacy_setting,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update trip details');
      }

      // Step 2: Update trip cities if provided
      if (data.cities && data.cities.length > 0) {
        // Fetch current cities first to determine which ones to add/remove
        const citiesResponse = await fetch(`/api/trips/${tripId}/cities`);
        const citiesData = await citiesResponse.json();
        const currentCities = citiesData.cities || [];

        // Get current city IDs
        const currentCityIds = currentCities.map((tc: any) => tc.city_id);

        // Get new city IDs
        const newCityIds = data.cities.map((city) => city.id);

        // Find city IDs to add (in new but not in current)
        const cityIdsToAdd = newCityIds.filter((id: string) => !currentCityIds.includes(id));

        // Find city IDs to remove (in current but not in new)
        const cityIdsToRemove = currentCityIds.filter((id: string) => !newCityIds.includes(id));

        // Remove cities that are no longer in the list
        for (const cityId of cityIdsToRemove) {
          await fetch(`/api/trips/${tripId}/cities/${cityId}`, {
            method: 'DELETE',
          });
        }

        // Add new cities to the trip
        for (const cityId of cityIdsToAdd) {
          const cityToAdd = data.cities.find((city) => city.id === cityId);
          if (cityToAdd) {
            await fetch(`/api/trips/${tripId}/cities`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                city_id: cityId,
                position: newCityIds.indexOf(cityId), // Use the position from the array
              }),
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Trip updated successfully',
      });

      // After successful save, redirect back to trip page
      router.push(`/trips/${tripId}`);
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to save trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push(`/trips/${tripId}`);
  };

  return (
    <div className="w-full">
      {/* TripFocusContainer is temporarily disabled but kept in the codebase */}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
        <EditTripForm
          trip={trip}
          initialDestinationName={initialDestinationName}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
