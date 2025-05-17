/**
 * Trip Members API
 *
 * Provides CRUD operations and custom actions for trip members, including inviting, importing, checking access, updating roles, and removing members.
 * Used for managing collaborative trip membership and permissions.
 *
 * @module lib/api/tripMembers
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result } from './_shared';

// (Add imports and Zod schemas here)

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all members of a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of trip members with profiles
 */
export async function listTripMembers(tripId: string): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('*, profiles:profiles!trip_members_user_id_fkey(*)')
      .eq('trip_id', tripId);
    if (error) return { success: false, error: error.message };
    const members = (data ?? []).map((member: any) => ({
      ...member,
      profile: member.profiles,
      profiles: member.profiles,
    }));
    return { success: true, data: members };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip members');
  }
}

/**
 * Get a single trip member by trip and member ID.
 * @param tripId - The trip's unique identifier
 * @param memberId - The member's unique identifier
 * @returns Result containing the trip member
 */
export async function getTripMember(tripId: string, memberId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('*, profiles:profiles!trip_members_user_id_fkey(*)')
      .eq('trip_id', tripId)
      .eq('user_id', memberId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Member not found' };
    return { success: true, data: { ...data, profile: data.profiles, profiles: data.profiles } };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip member');
  }
}

/**
 * Add a new member to a trip.
 * @param tripId - The trip's unique identifier
 * @param data - The member data (user_id, role, etc.)
 * @returns Result containing the added member
 */
export async function addTripMember(tripId: string, data: any): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const insertData = { ...data, trip_id: tripId };
    const { data: newMember, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .insert(insertData)
      .select('*, profiles:profiles!trip_members_user_id_fkey(*)')
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: { ...newMember, profile: newMember.profiles, profiles: newMember.profiles } };
  } catch (error) {
    return handleError(error, 'Failed to add trip member');
  }
}

/**
 * Update an existing trip member.
 * @param tripId - The trip's unique identifier
 * @param memberId - The member's unique identifier
 * @param data - Partial member data to update
 * @returns Result containing the updated member
 */
export async function updateTripMember(tripId: string, memberId: string, data: any): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedMember, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .update(data)
      .eq('trip_id', tripId)
      .eq('user_id', memberId)
      .select('*, profiles:profiles!trip_members_user_id_fkey(*)')
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: { ...updatedMember, profile: updatedMember.profiles, profiles: updatedMember.profiles } };
  } catch (error) {
    return handleError(error, 'Failed to update trip member');
  }
}

/**
 * Remove a member from a trip.
 * @param tripId - The trip's unique identifier
 * @param memberId - The member's unique identifier
 * @returns Result indicating success or failure
 */
export async function removeTripMember(tripId: string, memberId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', memberId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to remove trip member');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Invite a user to join a trip by email.
 * @param tripId - The trip's unique identifier
 * @param email - The email address to invite
 * @returns Result indicating success or failure
 */
export async function inviteTripMember(tripId: string, email: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    // TODO: Validate email, check if already a member or invited
    const { error } = await supabase
      .from(TABLES.TRIP_INVITATIONS as 'trip_invitations')
      .insert({ trip_id: tripId, email });
    if (error) return { success: false, error: error.message };
    // TODO: Send invitation email
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to invite trip member');
  }
}

/**
 * Import multiple members to a trip (bulk add or invite).
 * @param tripId - The trip's unique identifier
 * @param members - Array of member data to import (email, role, etc.)
 * @returns Result indicating success or failure
 */
export async function importTripMembers(tripId: string, members: any[]): Promise<Result<{ added: number; invited: number }>> {
  try {
    const supabase = await createRouteHandlerClient();
    let added = 0;
    let invited = 0;
    for (const member of members) {
      // Check if user exists
      const { data: user } = await supabase
        .from(TABLES.PROFILES as 'profiles')
        .select('id')
        .eq('email', member.email)
        .single();
      if (user) {
        // Add as member
        const { error } = await supabase
          .from(TABLES.TRIP_MEMBERS as 'trip_members')
          .insert({ trip_id: tripId, user_id: user.id, role: member.role || 'viewer' });
        if (!error) added++;
      } else {
        // Invite
        const { error } = await supabase
          .from(TABLES.TRIP_INVITATIONS as 'trip_invitations')
          .insert({ trip_id: tripId, email: member.email, role: member.role || 'viewer' });
        if (!error) invited++;
        // TODO: Send invitation email
      }
    }
    return { success: true, data: { added, invited } };
  } catch (error) {
    return handleError(error, 'Failed to import trip members');
  }
}

/**
 * Check a user's access to a trip (member or invited).
 * @param tripId - The trip's unique identifier
 * @param userId - The user's unique identifier
 * @param email - The user's email (for invitation check)
 * @returns Result indicating access status
 */
export async function checkTripMemberAccess(tripId: string, userId: string, email?: string): Promise<Result<{ isMember: boolean; isInvited: boolean }>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Check membership
    const { data: member } = await supabase
      .from(TABLES.TRIP_MEMBERS as 'trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();
    if (member) return { success: true, data: { isMember: true, isInvited: false } };
    // Check invitation by email if provided
    if (email) {
      const { data: invitation } = await supabase
        .from(TABLES.TRIP_INVITATIONS as 'trip_invitations')
        .select('id')
        .eq('trip_id', tripId)
        .eq('email', email)
        .single();
      if (invitation) return { success: true, data: { isMember: false, isInvited: true } };
    }
    return { success: true, data: { isMember: false, isInvited: false } };
  } catch (error) {
    return handleError(error, 'Failed to check trip member access');
  }
}

/**
 * Update a trip member's role.
 * @param tripId - The trip's unique identifier
 * @param memberId - The member's unique identifier
 * @param role - The new role for the member
 * @returns Result containing the updated member
 */
export async function updateTripMemberRole(tripId: string, memberId: string, role: string) {}
// (Add more as needed) 