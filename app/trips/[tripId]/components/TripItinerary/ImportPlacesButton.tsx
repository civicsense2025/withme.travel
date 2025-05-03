'use client';

import { useEffect, useState } from 'react';
import ImportMapButton from '../../import-map-button';
import { useTripData } from '../../context/trip-data-provider';
import { TRIP_ROLES } from '@/utils/constants/status';

export function ImportPlacesButton() {
  const { tripData } = useTripData();
  const [mounted, setMounted] = useState(false);

  // Make sure we're fully mounted on client side before rendering
  // to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!tripData || !tripData.trip) return null;

  // Find the current user's member record to determine role
  const currentUser = tripData.members.find(
    (member) => member.profile?.id === tripData.trip?.created_by
  );

  // Check if user can edit based on role (admin or editor)
  const canEdit = currentUser?.role === TRIP_ROLES.ADMIN || currentUser?.role === TRIP_ROLES.EDITOR;

  // Only render the import button if the user can edit the trip
  return canEdit ? (
    <div className="trip-itinerary-actions">
      <ImportMapButton tripId={tripData.trip.id} canEdit={canEdit} />
    </div>
  ) : null;
}
