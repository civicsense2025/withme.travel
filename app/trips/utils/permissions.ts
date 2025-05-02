import { createClient } from '@/utils/supabase/client';
import { TripRole, TABLES } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import useSWR from 'swr';

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: TripRole | null;
}

/**
 * Server-side function to check trip permissions
 */
export async function checkTripPermissions(tripId: string): Promise<PermissionCheck> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      canView: false,
      canEdit: false,
      canManage: false,
      canAddMembers: false,
      canDeleteTrip: false,
      isCreator: false,
      role: null,
    };
  }

  // Check if user is a member
  const { data: membership } = await supabase
    .from(Tables.TRIP_MEMBERS)
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', user.id)
    .single();

  // Check if user is the creator
  const { data: trip } = await supabase
    .from(Tables.TRIPS)
    .select('created_by, is_public')
    .eq('id', tripId)
    .single();

  const role = membership?.role;
  const isCreator = trip?.created_by === user.id;
  const isPublic = trip?.is_public || false;

  return {
    canView: !!role || isCreator || isPublic,
    canEdit: (!!role && [TripRole.ADMIN, TripRole.EDITOR].includes(role as TripRole)) || isCreator,
    canManage: (!!role && [TripRole.ADMIN].includes(role as TripRole)) || isCreator,
    canAddMembers: (!!role && [TripRole.ADMIN].includes(role as TripRole)) || isCreator,
    canDeleteTrip: isCreator,
    isCreator,
    role: role as TripRole | null,
  };
}

/**
 * Client-side hook for checking trip permissions
 */
export function useTripPermissions(tripId: string) {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
    return response.json();
  };

  const { data, error, mutate } = useSWR(
    tripId ? `/api/trips/${tripId}/permissions` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const defaultPermissions: PermissionCheck = {
    canView: false,
    canEdit: false,
    canManage: false,
    canAddMembers: false,
    canDeleteTrip: false,
    isCreator: false,
    role: null,
  };

  return {
    permissions: data?.permissions || defaultPermissions,
    isLoading: !data && !error,
    error,
    refetch: mutate,
  };
}

/**
 * Helper to check if a user can perform an action on an item
 * This handles special cases like user being the creator of an item vs. trip permissions
 */
export function canModifyItem(
  itemCreatorId: string | null,
  userPermissions: PermissionCheck,
  userId: string | null
): boolean {
  // If user is the creator of the trip, they can do anything
  if (userPermissions.isCreator) return true;

  // If user is the creator of the item, they can modify it regardless of role
  // (as long as they have at least view access to the trip)
  if (userId && itemCreatorId === userId && userPermissions.canView) return true;

  // Otherwise, check if user has edit permissions for the trip
  return userPermissions.canEdit;
}

/**
 * Get the display-friendly role name
 */
export function getRoleName(role: string | null): string {
  if (!role) return 'Viewer';

  switch (role) {
    case TripRole.ADMIN:
      return 'Admin';
    case TripRole.EDITOR:
      return 'Editor';
    case TripRole.CONTRIBUTOR:
      return 'Contributor';
    case TripRole.VIEWER:
      return 'Viewer';
    default:
      return 'Viewer';
  }
}
