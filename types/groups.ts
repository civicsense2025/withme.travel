import { GroupMemberStatus, GroupVisibility } from '@/utils/constants/status';

/**
 * Represents a travel group
 */
export interface Group {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
  created_by: string;
  visibility: GroupVisibility;
  created_at: string;
  updated_at: string;

  // Relationships
  group_members?: GroupMember[];
  trip_count?: number;
  created_by_profile?: Profile;
}

/**
 * Represents a member in a travel group
 */
export interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joined_at: string;
  updated_at: string;

  // Relationships
  user?: Profile;
}

/**
 * Represents a user profile (simplified for group context)
 */
export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

/**
 * Represents a trip associated with a group
 */
export interface GroupTrip {
  group_id: string;
  trip_id: string;
  added_by: string;
  added_at: string;

  // Relationships
  trip?: Trip;
  added_by_profile?: Profile;
}

/**
 * Represents a trip (simplified for group context)
 */
export interface Trip {
  id: string;
  name: string;
  destination_id?: string;
  start_date?: string;
  end_date?: string;
  created_by: string;

  // Relationships
  destination?: Destination;
}

/**
 * Represents a destination (simplified for group context)
 */
export interface Destination {
  id: string;
  name: string;
  country?: string;
  image_url?: string;
}

export type GroupMemberRole = 'owner' | 'admin' | 'member' | 'guest';
