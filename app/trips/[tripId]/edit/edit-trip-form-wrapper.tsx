'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { TripFocusContainer } from '@/components/trips/trip-focus-container';

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

  const handleSave = async (data: TripFormData) => {
    console.log('Save data:', data);

    // After successful save, redirect back to trip page
    router.push(`/trips/${tripId}`);

    return Promise.resolve();
  };

  const handleClose = () => {
    router.push(`/trips/${tripId}`);
  };

  return (
    <TripFocusContainer tripId={tripId} canEdit={true}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Trip</h1>
        <EditTripForm
          trip={trip}
          initialDestinationName={initialDestinationName}
          onSave={handleSave}
          onClose={handleClose}
        />
      </div>
    </TripFocusContainer>
  );
}
