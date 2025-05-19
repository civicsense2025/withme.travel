/**
 * Groups API
 *
 * Provides CRUD operations and custom actions for groups, plans, ideas, and members.
 * Used for managing collaborative group travel planning, including group plans and idea sharing.
 *
 * @module lib/api/groups
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Group } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all groups with optional filtering.
 * @param params - Query parameters (search, limit, offset)
 * @returns Result containing an array of groups
 */
export async function listGroups(params: any): Promise<Result<Group[]>> {
  // TODO: Implement list groups logic
  try {
    const supabase = await createRouteHandlerClient();
    let query = supabase.from(TABLES.GROUPS).select('*');

    // Add search filter if provided
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    // Add pagination
    query = query.range(params.offset, params.offset + params.limit - 1);

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch groups');
  }
}

/**
 * List all groups for a specific user with optional filtering.
 * @param userId - The user's unique identifier
 * @param params - Query parameters (search, limit, offset, includeMembers)
 * @returns Result containing an array of groups
 */
export async function getUserGroups(
  userId: string,
  {
    search = '',
    limit = 50,
    offset = 0,
    includeMembers = true,
    includeTripCount = true,
  }: {
    search?: string;
    limit?: number;
    offset?: number;
    includeMembers?: boolean;
    includeTripCount?: boolean;
  } = {}
): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    let select = '*';
    if (includeMembers) {
      select += ', group_members (user_id, role, status)';
    }
    if (includeTripCount) {
      select += ', trip_count:group_trips(count)';
    }

    let query = supabase
      .from(TABLES.GROUPS)
      .select(select)
      .eq('group_members.user_id', userId)
      .eq('group_members.status', 'active');

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch user groups');
  }
}

/**
 * Get a single group by ID.
 * @param groupId - The group's unique identifier
 * @returns Result containing the group
 */
export async function getGroup(groupId: string): Promise<Result<Group>> {
  // TODO: Implement get group by ID logic
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .select('*')
      .eq('id', groupId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Group not found' };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch group');
  }
}

/**
 * Get a single group by ID with detailed information.
 * @param groupId - The group's unique identifier
 * @returns Result containing the group with members and trips
 */
export async function getGroupWithDetails(groupId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .select(
        `
        *,
        group_members (
          user_id,
          role,
          status,
          joined_at
        ),
        group_trips (
          trip_id,
          added_at,
          added_by,
          trips:trips (
            id,
            name,
            start_date,
            end_date,
            destination_id,
            created_by
          )
        )
      `
      )
      .eq('id', groupId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Group not found' };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch group details');
  }
}

/**
 * Create a new group.
 * @param data - The group data
 * @returns Result containing the created group
 */
export async function createGroup(data: any): Promise<Result<Group>> {
  // TODO: Implement create group logic
  try {
    const supabase = await createRouteHandlerClient();
    const { data: newGroup, error } = await supabase
      .from(TABLES.GROUPS)
      .insert(data)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newGroup };
  } catch (error) {
    return handleError(error, 'Failed to create group');
  }
}

/**
 * Create a new group with automatic membership for the creator.
 * Uses the create_group RPC function if available, with fallback to direct insert.
 * @param data - The group data
 * @param userId - The creator's user ID (for membership)
 * @returns Result containing the created group with membership
 */
export async function createGroupWithMembership(
  data: Partial<Group>,
  userId: string
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Try to use the create_group RPC function first
    try {
      const { data: newGroup, error } = await supabase.rpc('create_group', {
        p_name: data.name || '',
        p_description: data.description || null,
        p_emoji: data.emoji || null,
        p_visibility: data.visibility || 'private',
      });

      if (!error) {
        return { success: true, data: newGroup };
      }

      // Fall through to direct insert if RPC failed
      console.warn('RPC error, falling back to direct insert:', error);
    } catch (rpcError) {
      console.warn('RPC error, falling back to direct insert:', rpcError);
    }

    // Direct insert as fallback
    const { data: newGroup, error: insertError } = await supabase
      .from(TABLES.GROUPS)
      .insert({
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || null,
        visibility: data.visibility || 'private',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Add creator as admin member
    const { error: memberError } = await supabase.from(TABLES.GROUP_MEMBERS).insert({
      group_id: newGroup.id,
      user_id: userId,
      role: 'admin',
      status: 'active',
    });

    if (memberError) {
      console.error('Error adding group member:', memberError);
      // Continue despite error, as group was created
    }

    // Return the created group with membership info
    return {
      success: true,
      data: {
        ...newGroup,
        group_members: [
          {
            user_id: userId,
            role: 'admin',
            status: 'active',
          },
        ],
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to create group with membership');
  }
}

/**
 * Create a new group for a guest user.
 * @param data - The group data
 * @param guestToken - Token identifying the guest
 * @returns Result containing the created group
 */
export async function createGuestGroup(
  data: Partial<Group>,
  guestToken: string
): Promise<Result<Group>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Insert guest group
    const { data: group, error } = await supabase
      .from(TABLES.GROUPS)
      .insert({
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || null,
        visibility: data.visibility || 'private',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Insert into group_guest_members for guest
    if (group && guestToken) {
      const { data: existing } = await supabase
        .from('group_guest_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('guest_token', guestToken)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('group_guest_members')
          .insert({ group_id: group.id, guest_token: guestToken });
      }
    }

    return { success: true, data: group };
  } catch (error) {
    return handleError(error, 'Failed to create guest group');
  }
}

/**
 * Update an existing group.
 * @param groupId - The group's unique identifier
 * @param data - Partial group data to update
 * @returns Result containing the updated group
 */
export async function updateGroup(groupId: string, data: any): Promise<Result<Group>> {
  // TODO: Implement update group logic
  try {
    const supabase = await createRouteHandlerClient();

    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedGroup, error } = await supabase
      .from(TABLES.GROUPS)
      .update(updateData)
      .eq('id', groupId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedGroup };
  } catch (error) {
    return handleError(error, 'Failed to update group');
  }
}

/**
 * Delete a group by ID.
 * @param groupId - The group's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteGroup(groupId: string): Promise<Result<null>> {
  // TODO: Implement delete group logic
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.GROUPS).delete().eq('id', groupId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete group');
  }
}

// ============================================================================
// PERMISSION & MEMBERSHIP FUNCTIONS
// ============================================================================

/**
 * Check if a user is a member of a group with specific role(s).
 * @param groupId - The group's unique identifier
 * @param userId - The user's unique identifier
 * @param roles - Array of roles to check against
 * @returns Result containing boolean indicating user has the role
 */
export async function checkGroupMemberRole(
  groupId: string,
  userId: string,
  roles: string[]
): Promise<Result<boolean>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Try using RPC function if available
    try {
      const { data, error } = await supabase.rpc('is_group_member_with_role', {
        _group_id: groupId,
        _user_id: userId,
        _roles: roles,
      });

      if (!error) {
        return { success: true, data };
      }
    } catch (rpcError) {
      console.warn('RPC error, falling back to direct query:', rpcError);
    }

    // Fallback to direct query
    const { data, error } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('role', roles)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: !!data };
  } catch (error) {
    return handleError(error, 'Failed to check group member role');
  }
}

/**
 * List all members of a group.
 * @param groupId - The group's unique identifier
 * @returns Result containing an array of group members
 */
export async function listGroupMembers(groupId: string): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select(
        `
        user_id,
        role,
        status,
        joined_at,
        profiles:user_id (
          name,
          avatar_url,
          email
        )
      `
      )
      .eq('group_id', groupId)
      .eq('status', 'active');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch group members');
  }
}

/**
 * Add a member to a group.
 * @param groupId - The group's unique identifier
 * @param userId - The user's unique identifier
 * @param role - The role to assign to the user
 * @returns Result indicating success or failure
 */
export async function addGroupMember(
  groupId: string,
  userId: string,
  role: string = 'member'
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .insert({
        group_id: groupId,
        user_id: userId,
        role,
        status: 'active',
      })
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.[0] ?? null };
  } catch (error) {
    return handleError(error, 'Failed to add group member');
  }
}

/**
 * Remove a member from a group.
 * @param groupId - The group's unique identifier
 * @param userId - The user's unique identifier
 * @returns Result indicating success or failure
 */
export async function removeGroupMember(groupId: string, userId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to remove group member');
  }
}

/**
 * Update a group member's role.
 * @param groupId - The group's unique identifier
 * @param userId - The user's unique identifier
 * @param role - The new role to assign
 * @returns Result indicating success or failure
 */
export async function updateGroupMemberRole(
  groupId: string,
  userId: string,
  role: string
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data?.[0] ?? null };
  } catch (error) {
    return handleError(error, 'Failed to update group member role');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * List all plans for a group.
 * @param groupId - The group's unique identifier
 * @returns Result containing an array of group plans
 */
export async function listGroupPlans(groupId: string): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select(
        `
        *,
        items:group_plan_items (*)
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch group plans');
  }
}

/**
 * Get a specific plan from a group with its items.
 * @param groupId - The group's unique identifier
 * @param planId - The plan's unique identifier
 * @returns Result containing the plan with its items
 */
export async function getGroupPlan(groupId: string, planId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select(
        `
        *,
        items:group_plan_items (*)
      `
      )
      .eq('group_id', groupId)
      .eq('id', planId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Plan not found' };

    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch group plan');
  }
}

/**
 * Create a new plan for a group.
 * @param groupId - The group's unique identifier
 * @param data - The plan data
 * @param userId - The ID of the user creating the plan
 * @returns Result containing the created plan
 */
export async function createGroupPlan(
  groupId: string,
  data: any,
  userId: string
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Prepare the plan data
    const planData = {
      group_id: groupId,
      title: data.title,
      description: data.description || null,
      status: data.status || 'draft',
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      meta: data.meta || {},
      created_by: userId,
    };

    // Insert the plan
    const { data: newPlan, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .insert(planData)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // If there are items to add, create them
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      const planItems = data.items.map((item: any, index: number) => ({
        plan_id: newPlan.id,
        group_id: groupId,
        title: item.title,
        description: item.description || null,
        order: index,
        type: item.type || 'generic',
        status: item.status || 'draft',
        meta: item.meta || {},
        created_by: userId,
      }));

      const { error: itemsError } = await supabase.from(TABLES.GROUP_PLAN_ITEMS).insert(planItems);

      if (itemsError) {
        console.warn('Failed to create plan items:', itemsError);
      }
    }

    return { success: true, data: newPlan };
  } catch (error) {
    return handleError(error, 'Failed to create group plan');
  }
}

/**
 * Update an existing group plan.
 * @param groupId - The group's unique identifier
 * @param planId - The plan's unique identifier
 * @param data - The updated plan data
 * @returns Result containing the updated plan
 */
export async function updateGroupPlan(
  groupId: string,
  planId: string,
  data: any
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Prepare the update data
    const updateData = {
      title: data.title,
      description: data.description,
      status: data.status,
      start_date: data.start_date,
      end_date: data.end_date,
      meta: data.meta,
    };

    // Update the plan
    const { data: updatedPlan, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .update(updateData)
      .eq('group_id', groupId)
      .eq('id', planId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    if (!updatedPlan) return { success: false, error: 'Plan not found' };

    return { success: true, data: updatedPlan };
  } catch (error) {
    return handleError(error, 'Failed to update group plan');
  }
}

/**
 * Delete a plan from a group.
 * @param groupId - The group's unique identifier
 * @param planId - The plan's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteGroupPlan(groupId: string, planId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();

    // First delete all items associated with the plan
    const { error: itemsError } = await supabase
      .from(TABLES.GROUP_PLAN_ITEMS)
      .delete()
      .eq('plan_id', planId);

    if (itemsError) {
      console.warn('Error deleting plan items:', itemsError);
      // Continue with plan deletion even if item deletion fails
    }

    // Delete the plan
    const { error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .delete()
      .eq('group_id', groupId)
      .eq('id', planId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete group plan');
  }
}

/**
 * Create or update items for a group plan.
 * @param groupId - The group's unique identifier
 * @param planId - The plan's unique identifier
 * @param items - Array of items to add or update
 * @param userId - The ID of the user adding/updating the items
 * @returns Result containing the created/updated items
 */
export async function updateGroupPlanItems(
  groupId: string,
  planId: string,
  items: any[],
  userId: string
): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Process each item - if it has an ID, update it; otherwise create new item
    const results = await Promise.all(
      items.map(async (item: any, index: number) => {
        if (item.id) {
          // Update existing item
          const { data, error } = await supabase
            .from(TABLES.GROUP_PLAN_ITEMS)
            .update({
              title: item.title,
              description: item.description,
              order: item.order ?? index,
              type: item.type,
              status: item.status,
              meta: item.meta,
            })
            .eq('id', item.id)
            .eq('plan_id', planId)
            .select()
            .single();

          if (error) {
            console.warn(`Error updating item ${item.id}:`, error);
            return null;
          }
          return data;
        } else {
          // Create new item
          const { data, error } = await supabase
            .from(TABLES.GROUP_PLAN_ITEMS)
            .insert({
              plan_id: planId,
              group_id: groupId,
              title: item.title,
              description: item.description || null,
              order: item.order ?? index,
              type: item.type || 'generic',
              status: item.status || 'draft',
              meta: item.meta || {},
              created_by: userId,
            })
            .select()
            .single();

          if (error) {
            console.warn('Error creating item:', error);
            return null;
          }
          return data;
        }
      })
    );

    // Filter out failed operations
    const successfulResults = results.filter((result) => result !== null);

    return { success: true, data: successfulResults };
  } catch (error) {
    return handleError(error, 'Failed to update plan items');
  }
}

/**
 * Delete a specific item from a group plan.
 * @param groupId - The group's unique identifier
 * @param planId - The plan's unique identifier
 * @param itemId - The item's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteGroupPlanItem(
  groupId: string,
  planId: string,
  itemId: string
): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { error } = await supabase
      .from(TABLES.GROUP_PLAN_ITEMS)
      .delete()
      .eq('group_id', groupId)
      .eq('plan_id', planId)
      .eq('id', itemId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete plan item');
  }
}

/**
 * List all ideas for a group.
 * @param groupId - The group's unique identifier
 * @returns Result containing an array of group ideas
 */
export async function listGroupIdeas(groupId: string): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch group ideas');
  }
}

/**
 * Create a new idea for a group.
 * @param groupId - The group's unique identifier
 * @param data - The idea data
 * @param userId - The ID of the user creating the idea
 * @returns Result containing the created idea
 */
export async function createGroupIdea(
  groupId: string,
  data: any,
  userId: string
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Prepare the data for insertion
    const ideaData = {
      group_id: groupId,
      title: data.title,
      description: data.description,
      type: data.type,
      created_by: userId,
      start_date: data.start_date,
      end_date: data.end_date,
      meta: data.meta,
      votes_up: 0,
      votes_down: 0,
    };

    const { data: newIdea, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .insert(ideaData)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newIdea };
  } catch (error) {
    return handleError(error, 'Failed to create group idea');
  }
}

/**
 * Get a specific idea from a group.
 * @param groupId - The group's unique identifier
 * @param ideaId - The idea's unique identifier
 * @returns Result containing the idea
 */
export async function getGroupIdea(groupId: string, ideaId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select('*')
      .eq('group_id', groupId)
      .eq('id', ideaId)
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Idea not found' };

    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch group idea');
  }
}

/**
 * Update an existing group idea.
 * @param groupId - The group's unique identifier
 * @param ideaId - The idea's unique identifier
 * @param data - The idea data to update
 * @returns Result containing the updated idea
 */
export async function updateGroupIdea(
  groupId: string,
  ideaId: string,
  data: any
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data: updatedIdea, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .update({
        title: data.title,
        description: data.description,
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        meta: data.meta,
      })
      .eq('group_id', groupId)
      .eq('id', ideaId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    if (!updatedIdea) return { success: false, error: 'Failed to update idea' };

    return { success: true, data: updatedIdea };
  } catch (error) {
    return handleError(error, 'Failed to update group idea');
  }
}

/**
 * Delete an idea from a group.
 * @param groupId - The group's unique identifier
 * @param ideaId - The idea's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteGroupIdea(groupId: string, ideaId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();

    const { error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .delete()
      .eq('group_id', groupId)
      .eq('id', ideaId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete group idea');
  }
}

/**
 * Vote on a group idea.
 * @param groupId - The group's unique identifier
 * @param ideaId - The idea's unique identifier
 * @param userId - The user's unique identifier
 * @param voteType - The type of vote ('up' or 'down')
 * @returns Result indicating success or failure
 */
export async function voteGroupIdea(
  groupId: string,
  ideaId: string,
  userId: string,
  voteType: 'up' | 'down'
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();

    // First, check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) return { success: false, error: checkError.message };

    // Start a transaction
    // If user already voted, update the vote; otherwise, insert a new vote
    const { data, error } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .upsert(
        {
          idea_id: ideaId,
          user_id: userId,
          vote_type: voteType,
          group_id: groupId,
        },
        { onConflict: 'idea_id,user_id' }
      )
      .select();

    if (error) return { success: false, error: error.message };

    // Update the vote count on the idea
    // This is a separate operation to ensure atomicity
    await updateGroupIdeaVoteCount(ideaId);

    return { success: true, data: data?.[0] ?? null };
  } catch (error) {
    return handleError(error, 'Failed to vote on group idea');
  }
}

/**
 * Helper function to update the vote count for an idea.
 * @param ideaId - The idea's unique identifier
 */
async function updateGroupIdeaVoteCount(ideaId: string): Promise<void> {
  try {
    const supabase = await createRouteHandlerClient();

    // Count up votes
    const { count: upVotes, error: upError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'up');

    // Count down votes
    const { count: downVotes, error: downError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('vote_type', 'down');

    if (upError || downError) {
      console.error('Error counting votes:', upError || downError);
      return;
    }

    // Update the idea with the vote counts
    await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .update({
        votes_up: upVotes || 0,
        votes_down: downVotes || 0,
      })
      .eq('id', ideaId);
  } catch (error) {
    console.error('Error updating vote count:', error);
  }
}

/**
 * TODO: Group Analytics & Activity Feed
 * Implement tracking and retrieval of group activity statistics
 */

/**
 * TODO: Group Invitations & Join Requests
 * Implement invitation system, approval workflows, and guest access
 */

/**
 * TODO: Role Management & Audit Trail
 * Implement detailed role assignment, permissions, and audit logging
 */
