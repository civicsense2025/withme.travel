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
import { handleError, Result, Group, PaginationMeta, PaginatedResult, getPaginationValues } from './_shared';
import { z } from 'zod';

// Group-specific schemas
const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
  visibility: z.enum(['public', 'private', 'unlisted']).default('private'),
  created_by: z.string().optional(),
  archived: z.boolean().optional()
});

const groupMemberSchema = z.object({
  group_id: z.string().min(1, "Group ID is required"),
  user_id: z.string().min(1, "User ID is required"),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
  status: z.enum(['active', 'pending', 'invited']).default('active')
});

const groupPlanSchema = z.object({
  group_id: z.string().min(1, "Group ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  meta: z.record(z.any()).optional().nullable(),
  created_by: z.string().min(1, "Creator ID is required")
});

const groupPlanItemSchema = z.object({
  plan_id: z.string().min(1, "Plan ID is required"),
  group_id: z.string().min(1, "Group ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  order: z.number().int().default(0),
  type: z.string().default('generic'),
  status: z.enum(['draft', 'active', 'completed']).default('draft'),
  meta: z.record(z.any()).optional().nullable(),
  created_by: z.string().min(1, "Creator ID is required")
});

const groupIdeaSchema = z.object({
  group_id: z.string().min(1, "Group ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  created_by: z.string().min(1, "Creator ID is required"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  meta: z.record(z.any()).optional().nullable(),
  votes_up: z.number().int().default(0),
  votes_down: z.number().int().default(0)
});

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all groups with advanced filtering, pagination, and performance optimizations.
 * @param params - Query parameters
 * @returns Result containing an array of groups
 */
export async function listGroups(params: {
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
  visibility?: ('public' | 'private' | 'unlisted')[];
  includeMembers?: boolean;
  includeTripCount?: boolean;
  includeArchivedGroups?: boolean;
  orderBy?: 'name' | 'created_at' | 'updated_at' | 'member_count';
  orderDirection?: 'asc' | 'desc';
} = {}): Promise<Result<{ groups: Group[]; total: number }>> {
  try {
    const {
      search = '',
      page,
      limit: rawLimit,
      offset: rawOffset,
      visibility = ['public', 'private', 'unlisted'],
      includeMembers = false,
      includeTripCount = false,
      includeArchivedGroups = false,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = params;
    
    // Calculate pagination values
    const { limit, offset } = getPaginationValues({
      page,
      limit: rawLimit,
      offset: rawOffset
    });
    
    const supabase = await createRouteHandlerClient();
    
    // Build the select query with requested relations
    let select = '*';
    if (includeMembers) {
      select += ', group_members (user_id, role, status)';
    }
    if (includeTripCount) {
      select += ', trip_count:group_trips(count)';
    }
    
    // Build the query with filters
    let query = supabase
      .from(TABLES.GROUPS)
      .select(select, { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (visibility && visibility.length > 0) {
      query = query.in('visibility', visibility);
    }
    
    if (!includeArchivedGroups) {
      query = query.eq('archived', false);
    }
    
    // Apply ordering
    if (orderBy === 'member_count') {
      // For member_count, we need a more complex query with a join
      // This is a simplified version - in real world, you might need a view or RPC
      query = query.order('id', { ascending: orderDirection === 'asc' });
    } else {
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) return { success: false, error: error.message };
    
    return { 
      success: true, 
      data: { 
        groups: data || [], 
        total: count || 0 
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch groups');
  }
}

/**
 * Search for groups with efficient query building and pagination.
 */
export async function searchGroups(params: {
  query: string;
  userId?: string;
  tags?: string[];
  visibility?: ('public' | 'private' | 'unlisted')[];
  limit?: number;
  page?: number;
  includeMembers?: boolean;
}): Promise<Result<{ groups: Group[]; total: number }>> {
  try {
    const {
      query,
      userId,
      tags = [],
      visibility = ['public'],
      limit = 20,
      page = 1,
      includeMembers = false
    } = params;
    
    const offset = (page - 1) * limit;
    const supabase = await createRouteHandlerClient();
    
    // Build the select query
    let select = '*';
    if (includeMembers) {
      select += ', group_members(user_id, role, status)';
    }
    
    // Start building the query
    let dbQuery = supabase
      .from(TABLES.GROUPS)
      .select(select, { count: 'exact' });
      
    // Add filters progressively
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    if (userId) {
      dbQuery = dbQuery.eq('group_members.user_id', userId);
    }
    
    if (visibility.length > 0) {
      dbQuery = dbQuery.in('visibility', visibility);
    }
    
    if (tags.length > 0) {
      // Assuming tags are stored in a tags column as an array
      // This creates a condition like: tags && ARRAY['tag1', 'tag2']
      dbQuery = dbQuery.contains('tags', tags);
    }
    
    // Apply pagination
    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) return { success: false, error: error.message };
    
    return { 
      success: true, 
      data: { 
        groups: data || [], 
        total: count || 0 
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to search groups');
  }
}

/**
 * List all groups for a specific user with optional filtering.
 * @param userId - The user's unique identifier
 * @param params - Query parameters
 * @returns Result containing an array of groups
 */
export async function getUserGroups(
  userId: string,
  params: {
    search?: string;
    limit?: number;
    page?: number;
    includeMembers?: boolean;
    includeTripCount?: boolean;
    includeArchived?: boolean;
    memberStatus?: string[];
  } = {}
): Promise<Result<{ groups: Group[]; total: number }>> {
  try {
    const {
      search = '',
      limit: rawLimit = 50,
      page = 1,
      includeMembers = true,
      includeTripCount = false,
      includeArchived = false,
      memberStatus = ['active']
    } = params;
    
    const limit = rawLimit;
    const offset = (page - 1) * limit;
    
    const supabase = await createRouteHandlerClient();

    // Build the select query with requested relations
    let select = '*';
    if (includeMembers) {
      select += ', group_members (user_id, role, status)';
    }
    if (includeTripCount) {
      select += ', trip_count:group_trips(count)';
    }

    // Build the query with filters
    let query = supabase
      .from(TABLES.GROUPS)
      .select(select, { count: 'exact' })
      .eq('group_members.user_id', userId);
      
    if (memberStatus.length > 0) {
      query = query.in('group_members.status', memberStatus);
    }
    
    if (!includeArchived) {
      query = query.eq('archived', false);
    }

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) return { success: false, error: error.message };
    
    return { 
      success: true, 
      data: { 
        groups: data || [], 
        total: count || 0 
      } 
    };
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
          joined_at,
          profiles:user_id (
            name,
            avatar_url,
            email
          )
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
        ),
        group_plans (
          id,
          title,
          status,
          created_at,
          created_by
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
 * Create a new group with validation.
 * @param data - The group data
 * @returns Result containing the created group
 */
export async function createGroup(data: Partial<Group>): Promise<Result<Group>> {
  try {
    // Validate input data
    const validationResult = groupSchema.safeParse(data);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid group data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    const { data: newGroup, error } = await supabase
      .from(TABLES.GROUPS)
      .insert(validationResult.data)
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
    // Validate input data
    const validationResult = groupSchema.safeParse({
      ...data,
      created_by: userId
    });
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid group data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();

    // Try to use the create_group RPC function first
    try {
      const { data: newGroup, error } = await supabase.rpc('create_group', {
        p_name: data.name || '',
        p_description: data.description || null,
        p_emoji: data.emoji || null,
        p_visibility: data.visibility || 'private',
        p_user_id: userId
      });

      if (!error) {
        return { success: true, data: newGroup };
      }

      // Fall through to direct insert if RPC failed
      console.warn('RPC error, falling back to direct insert:', error);
    } catch (rpcError) {
      console.warn('RPC error, falling back to direct insert:', rpcError);
    }

    // Direct insert as fallback (wrapped in a transaction)
    // First, create the group
    const { data: newGroup, error: insertError } = await supabase
      .from(TABLES.GROUPS)
      .insert({
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || null,
        visibility: data.visibility || 'private',
        created_by: userId,
        archived: false
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .insert({
        group_id: newGroup.id,
        user_id: userId,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString()
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
            joined_at: new Date().toISOString()
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
    if (!guestToken) {
      return { success: false, error: 'Guest token is required' };
    }
    
    // Validate input data
    const validationResult = groupSchema
      .omit({ created_by: true })
      .safeParse(data);
      
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid group data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();

    // Insert guest group
    const { data: group, error } = await supabase
      .from(TABLES.GROUPS)
      .insert({
        name: data.name,
        description: data.description || null,
        emoji: data.emoji || null,
        visibility: data.visibility || 'private',
        is_guest_group: true  // Add a flag to indicate this is a guest group
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
          .insert({ 
            group_id: group.id, 
            guest_token: guestToken,
            role: 'admin',
            joined_at: new Date().toISOString()
          });
      }
    }

    return { success: true, data: group };
  } catch (error) {
    return handleError(error, 'Failed to create guest group');
  }
}

/**
 * Update an existing group with validation.
 * @param groupId - The group's unique identifier
 * @param data - Partial group data to update
 * @param options - Additional options
 * @returns Result containing the updated group
 */
export async function updateGroup(
  groupId: string, 
  data: Partial<Group>,
  options: {
    checkPermission?: boolean;
    userId?: string;
  } = {}
): Promise<Result<Group>> {
  try {
    const { checkPermission = false, userId } = options;
    
    // Validate partial input data
    const validationResult = groupSchema.partial().safeParse(data);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid group data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    
    // Check permission if requested
    if (checkPermission && userId) {
      const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
      if (!permissionResult.success || !permissionResult.data) {
        return { 
          success: false, 
          error: 'You do not have permission to update this group',
          code: 'PERMISSION_DENIED'
        };
      }
    }

    // Add updated_at timestamp
    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString()
    };

    const { data: updatedGroup, error } = await supabase
      .from(TABLES.GROUPS)
      .update(updateData)
      .eq('id', groupId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    if (!updatedGroup) return { success: false, error: 'Group not found' };
    
    return { success: true, data: updatedGroup };
  } catch (error) {
    return handleError(error, 'Failed to update group');
  }
}

/**
 * Delete a group by ID.
 * @param groupId - The group's unique identifier
 * @param options - Additional options
 * @returns Result indicating success or failure
 */
export async function deleteGroup(
  groupId: string,
  options: {
    checkPermission?: boolean;
    userId?: string;
    hardDelete?: boolean;
  } = {}
): Promise<Result<null>> {
  try {
    const { checkPermission = false, userId, hardDelete = false } = options;
    const supabase = await createRouteHandlerClient();
    
    // Check permission if requested
    if (checkPermission && userId) {
      const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
      if (!permissionResult.success || !permissionResult.data) {
        return { 
          success: false, 
          error: 'You do not have permission to delete this group',
          code: 'PERMISSION_DENIED'
        };
      }
    }
    
    if (hardDelete) {
      // Hard delete - completely remove the group and all related data
      // First, delete dependent records
      await supabase.from(TABLES.GROUP_MEMBERS).delete().eq('group_id', groupId);
      await supabase.from(TABLES.GROUP_PLANS).delete().eq('group_id', groupId);
      await supabase.from(TABLES.GROUP_PLAN_ITEMS).delete().eq('group_id', groupId);
      await supabase.from(TABLES.GROUP_PLAN_IDEAS).delete().eq('group_id', groupId);
      await supabase.from(TABLES.GROUP_TRIPS).delete().eq('group_id', groupId);
      
      // Then delete the group
      const { error } = await supabase.from(TABLES.GROUPS).delete().eq('id', groupId);
      if (error) return { success: false, error: error.message };
    } else {
      // Soft delete - just mark as archived
      const { error } = await supabase
        .from(TABLES.GROUPS)
        .update({ 
          archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);
        
      if (error) return { success: false, error: error.message };
    }
    
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
 * List all members of a group with pagination and optional filtering.
 * @param groupId - The group's unique identifier
 * @param options - List options
 * @returns Result containing an array of group members
 */
export async function listGroupMembers(
  groupId: string,
  options: {
    limit?: number;
    page?: number;
    includeInactive?: boolean;
    roles?: string[];
    search?: string;
  } = {}
): Promise<Result<{ members: any[]; total: number }>> {
  try {
    const { 
      limit = 50, 
      page = 1,
      includeInactive = false,
      roles = [],
      search = ''
    } = options;
    
    const offset = (page - 1) * limit;
    const supabase = await createRouteHandlerClient();
    
    // Build the query
    let query = supabase
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
        `,
        { count: 'exact' }
      )
      .eq('group_id', groupId);
    
// Add filters
if (!includeInactive) {
  query = query.eq('status', 'active');
}

if (roles.length > 0) {
  query = query.in('role', roles);
}

if (search) {
  query = query.or(`profiles.name.ilike.%${search}%,profiles.email.ilike.%${search}%`);
}

// Apply pagination
query = query
  .order('joined_at', { ascending: false })
  .range(offset, offset + limit - 1);

// Execute the query
const { data, error, count } = await query;

if (error) return { success: false, error: error.message };

return { 
  success: true, 
  data: { 
    members: data || [], 
    total: count || 0 
  } 
};
} catch (error) {
return handleError(error, 'Failed to fetch group members');
}
}

/**
* Add a member to a group with validation.
* @param groupId - The group's unique identifier
* @param userId - The user's unique identifier
* @param role - The role to assign to the user
* @param options - Additional options
* @returns Result containing the added member
*/
export async function addGroupMember(
groupId: string,
userId: string,
role: string = 'member',
options: {
status?: string;
addedByUserId?: string;
sendNotification?: boolean;
} = {}
): Promise<Result<any>> {
try {
const { 
  status = 'active', 
  addedByUserId,
  sendNotification = true 
} = options;

// Validate input data
const validationResult = groupMemberSchema.safeParse({
  group_id: groupId,
  user_id: userId,
  role,
  status
});

if (!validationResult.success) {
  return { 
    success: false, 
    error: 'Invalid member data', 
    details: validationResult.error.format() 
  };
}

const supabase = await createRouteHandlerClient();

// Check if member already exists
const { data: existingMember } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .select('*')
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .maybeSingle();
  
if (existingMember) {
  // Member exists, update their role and status
  const { data, error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .update({ 
      role, 
      status,
      updated_at: new Date().toISOString() 
    })
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .select();
    
  if (error) return { success: false, error: error.message };
  
  return { 
    success: true, 
    data: data?.[0] ?? null,
    metadata: { updated: true } 
  };
}

// Insert new member
const memberData = {
  group_id: groupId,
  user_id: userId,
  role,
  status,
  joined_at: new Date().toISOString(),
  added_by: addedByUserId
};

const { data, error } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .insert(memberData)
  .select();

if (error) return { success: false, error: error.message };

// Send notification if requested
if (sendNotification && status === 'active') {
  try {
    // Send notification logic here - this is just a placeholder
    // You would typically call a notification service/API
    await sendGroupMemberNotification(groupId, userId, 'added', addedByUserId);
  } catch (notifError) {
    console.error('Failed to send member notification:', notifError);
    // Continue despite notification error
  }
}

return { success: true, data: data?.[0] ?? null };
} catch (error) {
return handleError(error, 'Failed to add group member');
}
}

/**
* Send a notification about group membership changes.
* This is a placeholder function - you would implement your notification system.
*/
async function sendGroupMemberNotification(
groupId: string,
userId: string,
action: string,
actorId?: string
): Promise<void> {
// Placeholder for notification logic
console.log(`Notification: User ${userId} was ${action} to group ${groupId} by ${actorId || 'system'}`);

// In a real implementation, you would call your notification API/service here
}

/**
* Remove a member from a group.
* @param groupId - The group's unique identifier
* @param userId - The user's unique identifier
* @param options - Additional options
* @returns Result indicating success or failure
*/
export async function removeGroupMember(
groupId: string,
userId: string,
options: {
removedByUserId?: string;
sendNotification?: boolean;
checkAdminCount?: boolean;
} = {}
): Promise<Result<null>> {
try {
const { 
  removedByUserId,
  sendNotification = true,
  checkAdminCount = true
} = options;

const supabase = await createRouteHandlerClient();

// Check if the user is an admin and if they're the last admin
if (checkAdminCount) {
  const { data: memberInfo } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
    
  if (memberInfo?.role === 'admin') {
    // Count admins
    const { count, error: countError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('role', 'admin')
      .eq('status', 'active');
      
    if (countError) return { success: false, error: countError.message };
    
    if (count === 1) {
      return { 
        success: false, 
        error: 'Cannot remove the last admin from the group',
        code: 'LAST_ADMIN'
      };
    }
  }
}

// Remove the member
const { error } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .delete()
  .eq('group_id', groupId)
  .eq('user_id', userId);

if (error) return { success: false, error: error.message };

// Send notification if requested
if (sendNotification) {
  try {
    await sendGroupMemberNotification(groupId, userId, 'removed', removedByUserId);
  } catch (notifError) {
    console.error('Failed to send member notification:', notifError);
    // Continue despite notification error
  }
}

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
* @param options - Additional options
* @returns Result indicating success or failure
*/
export async function updateGroupMemberRole(
groupId: string,
userId: string,
role: string,
options: {
updatedByUserId?: string;
checkAdminCount?: boolean;
} = {}
): Promise<Result<any>> {
try {
const { updatedByUserId, checkAdminCount = true } = options;

// Validate role
if (!['admin', 'member', 'viewer'].includes(role)) {
  return { success: false, error: 'Invalid role' };
}

const supabase = await createRouteHandlerClient();

// If changing from admin, check if they're the last admin
if (checkAdminCount && role !== 'admin') {
  const { data: memberInfo } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
    
  if (memberInfo?.role === 'admin') {
    // Count admins
    const { count, error: countError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('role', 'admin')
      .eq('status', 'active');
      
    if (countError) return { success: false, error: countError.message };
    
    if (count === 1) {
      return { 
        success: false, 
        error: 'Cannot change role of the last admin',
        code: 'LAST_ADMIN'
      };
    }
  }
}

// Update the member's role
const { data, error } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .update({ 
    role,
    updated_at: new Date().toISOString(),
    updated_by: updatedByUserId
  })
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .select();

if (error) return { success: false, error: error.message };

// If changing to admin and this user is the creator, update the group's created_by
if (role === 'admin') {
  await supabase
    .from(TABLES.GROUPS)
    .update({ created_by: userId })
    .eq('id', groupId)
    .is('created_by', null);
}

return { success: true, data: data?.[0] ?? null };
} catch (error) {
return handleError(error, 'Failed to update group member role');
}
}

/**
* Transfer group ownership with transaction support
*/
export async function transferGroupOwnership(
groupId: string,
currentOwnerId: string,
newOwnerId: string
): Promise<Result<{ success: boolean }>> {
try {
const supabase = await createRouteHandlerClient();

// Try to use a database function for atomic transaction
try {
  const { data, error } = await supabase.rpc('transfer_group_ownership', {
    p_group_id: groupId,
    p_current_owner_id: currentOwnerId,
    p_new_owner_id: newOwnerId
  });
  
  if (!error) {
    return { success: true, data: { success: true }};
  }
  
  // If RPC fails, fall back to client-side transaction
  console.warn('RPC failed, using client-side transaction:', error);
} catch (rpcError) {
  console.warn('RPC error, using client-side transaction:', rpcError);
}

// Start a client-side transaction
// First, verify current owner
const { data: ownerCheck, error: ownerError } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .select('role')
  .eq('group_id', groupId)
  .eq('user_id', currentOwnerId)
  .eq('role', 'admin')
  .single();
  
if (ownerError || !ownerCheck) {
  return { 
    success: false, 
    error: 'Current user is not the group admin' 
  };
}

// Check if new owner is a member
const { data: memberCheck, error: memberError } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .select('role')
  .eq('group_id', groupId)
  .eq('user_id', newOwnerId)
  .single();
  
if (memberError) {
  return { 
    success: false, 
    error: 'New owner is not a group member' 
  };
}

// Update new owner to admin
const { error: updateNewError } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .update({ 
    role: 'admin',
    updated_at: new Date().toISOString()
  })
  .eq('group_id', groupId)
  .eq('user_id', newOwnerId);
  
if (updateNewError) {
  return { success: false, error: updateNewError.message };
}

// Update previous owner to member
const { error: updatePrevError } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .update({ 
    role: 'member',
    updated_at: new Date().toISOString()
  })
  .eq('group_id', groupId)
  .eq('user_id', currentOwnerId);
  
if (updatePrevError) {
  // Rollback - revert new owner to previous role
  await supabase
    .from(TABLES.GROUP_MEMBERS)
    .update({ 
      role: memberCheck.role,
      updated_at: new Date().toISOString()
    })
    .eq('group_id', groupId)
    .eq('user_id', newOwnerId);
    
  return { success: false, error: updatePrevError.message };
}

// Update group created_by field
const { error: updateGroupError } = await supabase
  .from(TABLES.GROUPS)
  .update({ 
    created_by: newOwnerId,
    updated_at: new Date().toISOString()
  })
  .eq('id', groupId);
  
if (updateGroupError) {
  // This is less critical, so we don't roll back if just this part fails
  console.warn('Failed to update group created_by field:', updateGroupError);
}

return { success: true, data: { success: true }};
} catch (error) {
return handleError(error, 'Failed to transfer group ownership');
}
}

// ============================================================================
// GROUP PLANS FUNCTIONS
// ============================================================================

/**
* List all plans for a group with pagination and filtering.
* @param groupId - The group's unique identifier
* @param options - List options
* @returns Result containing an array of group plans
*/
export async function listGroupPlans(
groupId: string,
options: {
limit?: number;
page?: number;
status?: string[];
includeItems?: boolean;
search?: string;
} = {}
): Promise<Result<{ plans: any[]; total: number }>> {
try {
const { 
  limit = 20, 
  page = 1,
  status = ['draft', 'active', 'completed'],
  includeItems = false,
  search = ''
} = options;

const offset = (page - 1) * limit;
const supabase = await createRouteHandlerClient();

// Build the select query
let select = '*';
if (includeItems) {
  select += ', items:group_plan_items (*)';
}

// Build the query
let query = supabase
  .from(TABLES.GROUP_PLANS)
  .select(select, { count: 'exact' })
  .eq('group_id', groupId);

// Add filters
if (status.length > 0) {
  query = query.in('status', status);
}

if (search) {
  query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
}

// Apply pagination
query = query
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// Execute the query
const { data, error, count } = await query;

if (error) return { success: false, error: error.message };

return { 
  success: true, 
  data: { 
    plans: data || [], 
    total: count || 0 
  } 
};
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
    items:group_plan_items (*),
    created_by_user:created_by (
      name,
      avatar_url
    )
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
* Create a new plan for a group with validation.
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
// Validate input data
const validationResult = groupPlanSchema.safeParse({
  ...data,
  group_id: groupId,
  created_by: userId
});

if (!validationResult.success) {
  return { 
    success: false, 
    error: 'Invalid plan data', 
    details: validationResult.error.format() 
  };
}

const supabase = await createRouteHandlerClient();

// Insert the plan
const { data: newPlan, error } = await supabase
  .from(TABLES.GROUP_PLANS)
  .insert(validationResult.data)
  .select()
  .single();

if (error) return { success: false, error: error.message };

// If there are items to add, create them
if (data.items && Array.isArray(data.items) && data.items.length > 0) {
  try {
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

    // Validate items
    const itemsValidationResult = z.array(
      groupPlanItemSchema.omit({ plan_id: true })
    ).safeParse(planItems);
    
    if (!itemsValidationResult.success) {
      console.warn('Invalid plan items:', itemsValidationResult.error);
      return { 
        success: true, 
        data: newPlan,
        warnings: ['Some plan items were invalid and were not created']
      };
    }
    
    // Insert items
    const { error: itemsError } = await supabase
      .from(TABLES.GROUP_PLAN_ITEMS)
      .insert(itemsValidationResult.data);

    if (itemsError) {
      console.warn('Failed to create plan items:', itemsError);
      return { 
        success: true, 
        data: newPlan,
        warnings: ['Failed to create plan items']
      };
    }
  } catch (itemsError) {
    console.warn('Error creating plan items:', itemsError);
    return { 
      success: true, 
      data: newPlan,
      warnings: ['Error creating plan items']
    };
  }
}

return { success: true, data: newPlan };
} catch (error) {
return handleError(error, 'Failed to create group plan');
}
}

/**
* Update an existing group plan with validation.
* @param groupId - The group's unique identifier
* @param planId - The plan's unique identifier
* @param data - The updated plan data
* @param options - Additional options
* @returns Result containing the updated plan
*/
export async function updateGroupPlan(
groupId: string,
planId: string,
data: any,
options: {
userId?: string;
checkPermission?: boolean;
} = {}
): Promise<Result<any>> {
try {
const { userId, checkPermission = false } = options;

// Check permission if requested
if (checkPermission && userId) {
  const { data: plan } = await getGroupPlan(groupId, planId);
  if (plan.created_by !== userId) {
    // Check if user is a group admin
    const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
    if (!permissionResult.success || !permissionResult.data) {
      return { 
        success: false, 
        error: 'You do not have permission to update this plan',
        code: 'PERMISSION_DENIED'
      };
    }
  }
}

// Validate partial input data
const validationResult = groupPlanSchema
  .omit({ group_id: true, created_by: true })
  .partial()
  .safeParse(data);
  
if (!validationResult.success) {
  return { 
    success: false, 
    error: 'Invalid plan data', 
    details: validationResult.error.format() 
  };
}

const supabase = await createRouteHandlerClient();

// Update the plan
const { data: updatedPlan, error } = await supabase
  .from(TABLES.GROUP_PLANS)
  .update({
    ...validationResult.data,
    updated_at: new Date().toISOString(),
    updated_by: userId
  })
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
* @param options - Additional options
* @returns Result indicating success or failure
*/
export async function deleteGroupPlan(
groupId: string,
planId: string,
options: {
userId?: string;
checkPermission?: boolean;
} = {}
): Promise<Result<null>> {
try {
const { userId, checkPermission = false } = options;

// Check permission if requested
if (checkPermission && userId) {
  const { data: plan } = await getGroupPlan(groupId, planId);
  if (plan.created_by !== userId) {
    // Check if user is a group admin
    const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
    if (!permissionResult.success || !permissionResult.data) {
      return { 
        success: false, 
        error: 'You do not have permission to delete this plan',
        code: 'PERMISSION_DENIED'
      };
    }
  }
}

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
if (!Array.isArray(items)) {
  return { success: false, error: 'Items must be an array' };
}

const supabase = await createRouteHandlerClient();

// Check if plan exists and belongs to group
const { data: plan, error: planError } = await supabase
  .from(TABLES.GROUP_PLANS)
  .select('id')
  .eq('id', planId)
  .eq('group_id', groupId)
  .single();
  
if (planError || !plan) {
  return { success: false, error: 'Plan not found or does not belong to this group' };
}

// Process each item - if it has an ID, update it; otherwise create new item
const results = await Promise.all(
  items.map(async (item: any, index: number) => {
    if (item.id) {
      // Update existing item
      // Validate partial data
      const validationResult = groupPlanItemSchema
        .omit({ plan_id: true, group_id: true, created_by: true })
        .partial()
        .safeParse(item);
        
      if (!validationResult.success) {
        console.warn(`Invalid item data for item ${index}:`, validationResult.error);
        return null;
      }
      
      const { data, error } = await supabase
        .from(TABLES.GROUP_PLAN_ITEMS)
        .update({
          ...validationResult.data,
          order: item.order ?? index,
          updated_at: new Date().toISOString(),
          updated_by: userId
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
      // Validate data
      const validationResult = groupPlanItemSchema.safeParse({
        plan_id: planId,
        group_id: groupId,
        title: item.title,
        description: item.description || null,
        order: item.order ?? index,
        type: item.type || 'generic',
        status: item.status || 'draft',
        meta: item.meta || {},
        created_by: userId,
      });
      
      if (!validationResult.success) {
        console.warn(`Invalid new item data for item ${index}:`, validationResult.error);
        return null;
      }
      
      const { data, error } = await supabase
        .from(TABLES.GROUP_PLAN_ITEMS)
        .insert(validationResult.data)
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

// Update plan's updated_at timestamp
await supabase
  .from(TABLES.GROUP_PLANS)
  .update({ 
    updated_at: new Date().toISOString(),
    updated_by: userId
  })
  .eq('id', planId);

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

// Update plan's updated_at timestamp
await supabase
  .from(TABLES.GROUP_PLANS)
  .update({ updated_at: new Date().toISOString() })
  .eq('id', planId);
  
return { success: true, data: null };
} catch (error) {
return handleError(error, 'Failed to delete plan item');
}
}

// ============================================================================
// GROUP IDEAS FUNCTIONS
// ============================================================================

/**
* List all ideas for a group with pagination and filtering.
* @param groupId - The group's unique identifier
* @param options - List options
* @returns Result containing an array of group ideas
*/
export async function listGroupIdeas(
groupId: string,
options: {
limit?: number;
page?: number;
type?: string[];
sortBy?: 'created_at' | 'votes_up' | 'title';
sortDirection?: 'asc' | 'desc';
search?: string;
} = {}
): Promise<Result<{ ideas: any[]; total: number }>> {
try {
const { 
  limit = 20, 
  page = 1,
  type = [],
  sortBy = 'created_at',
  sortDirection = 'desc',
  search = ''
} = options;

const offset = (page - 1) * limit;
const supabase = await createRouteHandlerClient();

// Build the query
let query = supabase
  .from(TABLES.GROUP_PLAN_IDEAS)
  .select(
    `
    *,
    created_by_user:created_by (
      name,
      avatar_url
    ),
    user_votes:group_plan_idea_votes (
      user_id,
      vote_type
    )
    `,
    { count: 'exact' }
  )
  .eq('group_id', groupId);

// Add filters
if (type.length > 0) {
  query = query.in('type', type);
}

if (search) {
  query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
}

// Apply sorting
if (sortBy === 'votes_up') {
  query = query.order('votes_up', { ascending: sortDirection === 'asc' });
} else if (sortBy === 'title') {
  query = query.order('title', { ascending: sortDirection === 'asc' });
} else {
  query = query.order('created_at', { ascending: sortDirection === 'asc' });
}

// Apply pagination
query = query.range(offset, offset + limit - 1);

// Execute the query
const { data, error, count } = await query;

if (error) return { success: false, error: error.message };

return { 
  success: true, 
  data: { 
    ideas: data || [], 
    total: count || 0 
  } 
};
} catch (error) {
return handleError(error, 'Failed to fetch group ideas');
}
}

/**
* Create a new idea for a group with validation.
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
// Validate input data
const validationResult = groupIdeaSchema.safeParse({
  ...data,
  group_id: groupId,
  created_by: userId
});

if (!validationResult.success) {
  return { 
    success: false, 
    error: 'Invalid idea data', 
    details: validationResult.error.format() 
  };
}

const supabase = await createRouteHandlerClient();

const { data: newIdea, error } = await supabase
  .from(TABLES.GROUP_PLAN_IDEAS)
  .insert(validationResult.data)
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
  .select(
    `
    *,
    created_by_user:created_by (
      name,
      avatar_url
    ),
    votes:group_plan_idea_votes (
      user_id,
      vote_type
    )
    `
  )
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
* Update an existing group idea with validation.
* @param groupId - The group's unique identifier
* @param ideaId - The idea's unique identifier
* @param data - The idea data to update
* @param options - Additional options
* @returns Result containing the updated idea
*/
export async function updateGroupIdea(
groupId: string,
ideaId: string,
data: any,
options: {
userId?: string;
checkPermission?: boolean;
} = {}
): Promise<Result<any>> {
try {
const { userId, checkPermission = false } = options;

// Check permission if requested
if (checkPermission && userId) {
  const { data: idea } = await getGroupIdea(groupId, ideaId);
  if (idea.created_by !== userId) {
    // Check if user is a group admin
    const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
    if (!permissionResult.success || !permissionResult.data) {
      return { 
        success: false, 
        error: 'You do not have permission to update this idea',
        code: 'PERMISSION_DENIED'
      };
    }
  }
}

// Validate partial input data
const validationResult = groupIdeaSchema
  .omit({ group_id: true, created_by: true, votes_up: true, votes_down: true })
  .partial()
  .safeParse(data);
  
if (!validationResult.success) {
  return { 
    success: false, 
    error: 'Invalid idea data', 
    details: validationResult.error.format() 
  };
}

const supabase = await createRouteHandlerClient();

const { data: updatedIdea, error } = await supabase
  .from(TABLES.GROUP_PLAN_IDEAS)
  .update({
    ...validationResult.data,
    updated_at: new Date().toISOString(),
    updated_by: userId
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
* @param options - Additional options
* @returns Result indicating success or failure
*/
export async function deleteGroupIdea(
groupId: string,
ideaId: string,
options: {
userId?: string;
checkPermission?: boolean;
} = {}
): Promise<Result<null>> {
try {
const { userId, checkPermission = false } = options;

// Check permission if requested
if (checkPermission && userId) {
  const { data: idea } = await getGroupIdea(groupId, ideaId);
  if (idea.created_by !== userId) {
    // Check if user is a group admin
    const permissionResult = await checkGroupMemberRole(groupId, userId, ['admin']);
    if (!permissionResult.success || !permissionResult.data) {
      return { 
        success: false, 
        error: 'You do not have permission to delete this idea',
        code: 'PERMISSION_DENIED'
      };
    }
  }
}

const supabase = await createRouteHandlerClient();

// First, delete all votes for this idea
await supabase
  .from(TABLES.GROUP_PLAN_IDEA_VOTES)
  .delete()
  .eq('idea_id', ideaId);

// Then delete the idea
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

let voteResult;

if (existingVote) {
  // User already voted, check if it's the same vote
  if (existingVote.vote_type === voteType) {
    // Same vote, remove it (toggle off)
    const { error: deleteError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .delete()
      .eq('id', existingVote.id);
      
    if (deleteError) return { success: false, error: deleteError.message };
    
    voteResult = { action: 'removed', vote_type: voteType };
  } else {
    // Different vote, update it
    const { data, error: updateError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEA_VOTES)
      .update({ vote_type: voteType })
      .eq('id', existingVote.id)
      .select()
      .single();
      
    if (updateError) return { success: false, error: updateError.message };
    
    voteResult = { action: 'changed', vote: data };
  }
} else {
  // No existing vote, insert new one
  const { data, error: insertError } = await supabase
    .from(TABLES.GROUP_PLAN_IDEA_VOTES)
    .insert({
      idea_id: ideaId,
      user_id: userId,
      vote_type: voteType,
      group_id: groupId,
    })
    .select()
    .single();
    
  if (insertError) return { success: false, error: insertError.message };
  
  voteResult = { action: 'added', vote: data };
}

// Update the vote count on the idea
await updateGroupIdeaVoteCount(ideaId);

// Get the updated idea with new vote counts
const { data: updatedIdea } = await getGroupIdea(groupId, ideaId);

return { 
  success: true, 
  data: { 
    ...voteResult,
    idea: updatedIdea
  } 
};
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
    updated_at: new Date().toISOString()
  })
  .eq('id', ideaId);
} catch (error) {
console.error('Error updating vote count:', error);
}
}

// ============================================================================
// GROUP TRIPS FUNCTIONS
// ============================================================================

/**
* List all trips associated with a group.
* @param groupId - The group's unique identifier
* @param options - List options
* @returns Result containing an array of trips
*/
export async function listGroupTrips(
groupId: string,
options: {
limit?: number;
page?: number;
includeDetails?: boolean;
sortBy?: 'added_at' | 'start_date' | 'end_date' | 'name';
sortDirection?: 'asc' | 'desc';
upcoming?: boolean;
} = {}
): Promise<Result<{ trips: any[]; total: number }>> {
try {
const { 
  limit = 20, 
  page = 1,
  includeDetails = true,
  sortBy = 'added_at',
  sortDirection = 'desc',
  upcoming = false
} = options;

const offset = (page - 1) * limit;
const supabase = await createRouteHandlerClient();

// Build the select query
let select = '*';
if (includeDetails) {
  select = `
    *,
    trip:trip_id (
      id,
      name,
      start_date,
      end_date,
      destination_id,
      created_by,
      image_url,
      destinations:destination_id (
        name,
        country_code
      )
    )
  `;
}

// Build the query
let query = supabase
  .from(TABLES.GROUP_TRIPS)
  .select(select, { count: 'exact' })
  .eq('group_id', groupId);

// Apply filters for upcoming trips
if (upcoming) {
  const today = new Date().toISOString().split('T')[0];
  query = query.gte('trip.end_date', today);
}

// Apply sorting
if (sortBy === 'start_date') {
  query = query.order('trip.start_date', { ascending: sortDirection === 'asc' });
} else if (sortBy === 'end_date') {
  query = query.order('trip.end_date', { ascending: sortDirection === 'asc' });
} else if (sortBy === 'name') {
  query = query.order('trip.name', { ascending: sortDirection === 'asc' });
} else {
  query = query.order('added_at', { ascending: sortDirection === 'asc' });
}

// Apply pagination
query = query.range(offset, offset + limit - 1);

// Execute the query
const { data, error, count } = await query;

if (error) return { success: false, error: error.message };

return { 
  success: true, 
  data: { 
    trips: data || [], 
    total: count || 0 
  } 
};
} catch (error) {
return handleError(error, 'Failed to fetch group trips');
}
}

/**
* Add a trip to a group.
* @param groupId - The group's unique identifier
* @param tripId - The trip's unique identifier
* @param userId - The user adding the trip
* @returns Result containing the added trip association
*/
export async function addTripToGroup(
groupId: string,
tripId: string,
userId: string
): Promise<Result<any>> {
try {
const supabase = await createRouteHandlerClient();

// Check if the trip is already in the group
const { data: existing, error: checkError } = await supabase
  .from(TABLES.GROUP_TRIPS)
  .select('*')
  .eq('group_id', groupId)
  .eq('trip_id', tripId)
  .maybeSingle();
  
if (checkError) return { success: false, error: checkError.message };

if (existing) {
  return { 
    success: false, 
    error: 'Trip is already in this group',
    code: 'ALREADY_EXISTS' 
  };
}

// Add the trip to the group
const { data, error } = await supabase
  .from(TABLES.GROUP_TRIPS)
  .insert({
    group_id: groupId,
    trip_id: tripId,
    added_by: userId,
    added_at: new Date().toISOString()
  })
  .select(`
    *,
    trip:trip_id (
      id,
      name,
      start_date,
      end_date,
      destination_id,
      created_by,
      image_url
    )
  `)
  .single();
  
if (error) return { success: false, error: error.message };

return { success: true, data };
} catch (error) {
return handleError(error, 'Failed to add trip to group');
}
}

/**
* Remove a trip from a group.
* @param groupId - The group's unique identifier
* @param tripId - The trip's unique identifier
* @returns Result indicating success or failure
*/
export async function removeTripFromGroup(
groupId: string,
tripId: string
): Promise<Result<null>> {
try {
const supabase = await createRouteHandlerClient();

const { error } = await supabase
  .from(TABLES.GROUP_TRIPS)
  .delete()
  .eq('group_id', groupId)
  .eq('trip_id', tripId);
  
if (error) return { success: false, error: error.message };

return { success: true, data: null };
} catch (error) {
return handleError(error, 'Failed to remove trip from group');
}
}

// ============================================================================
// GROUP INVITATIONS & JOIN REQUESTS
// ============================================================================

/**
* Generate an invitation code for a group.
* @param groupId - The group's unique identifier
* @param options - Invitation options
* @returns Result containing the invitation code
*/
export async function generateGroupInviteCode(
groupId: string,
options: {
expiresInDays?: number;
maxUses?: number;
createdBy?: string;
} = {}
): Promise<Result<{ code: string; expiresAt: string }>> {
try {
const { 
  expiresInDays = 7, 
  maxUses = 10,
  createdBy
} = options;

const supabase = await createRouteHandlerClient();

// Generate a random code
const code = Math.random().toString(36).substring(2, 10).toUpperCase();

// Calculate expiration date
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + expiresInDays);

// Insert the invitation
const { data, error } = await supabase
  .from('group_invitations')
  .insert({
    group_id: groupId,
    code,
    expires_at: expiresAt.toISOString(),
    max_uses: maxUses,
    used_count: 0,
    created_by: createdBy
  })
  .select()
  .single();
  
if (error) return { success: false, error: error.message };

return { 
  success: true, 
  data: {
    code,
    expiresAt: expiresAt.toISOString()
  }
};
} catch (error) {
return handleError(error, 'Failed to generate invitation code');
}
}

/**
* Join a group using an invitation code.
* @param code - The invitation code
* @param userId - The user's unique identifier
* @returns Result containing the group joined
*/
export async function joinGroupWithCode(
code: string,
userId: string
): Promise<Result<any>> {
try {
const supabase = await createRouteHandlerClient();

// Look up the invitation
const { data: invitation, error: inviteError } = await supabase
  .from('group_invitations')
  .select('*')
  .eq('code', code)
  .single();
  
if (inviteError) {
  return { 
    success: false, 
    error: 'Invalid invitation code',
    code: 'INVALID_CODE'
  };
}

// Check if the invitation is expired
if (new Date(invitation.expires_at) < new Date()) {
  return { 
    success: false, 
    error: 'Invitation code has expired',
    code: 'EXPIRED_CODE'
  };
}

// Check if the invitation has reached max uses
if (invitation.used_count >= invitation.max_uses) {
  return { 
    success: false, 
    error: 'Invitation code has reached maximum uses',
    code: 'MAX_USES_REACHED'
  };
}

// Check if user is already a member
const { data: existingMember } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .select('*')
  .eq('group_id', invitation.group_id)
  .eq('user_id', userId)
  .maybeSingle();
  
if (existingMember) {
  // If user is already a member but status is not active, update it
  if (existingMember.status !== 'active') {
    await supabase
      .from(TABLES.GROUP_MEMBERS)
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('group_id', invitation.group_id)
      .eq('user_id', userId);
  }
  
  // Still increment the used count for tracking
  await supabase
    .from('group_invitations')
    .update({ 
      used_count: invitation.used_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', invitation.id);
  
  // Get the group details
  const { data: group } = await getGroup(invitation.group_id);
  
  return { 
    success: true, 
    data: group,
    metadata: { alreadyMember: true }
  };
}

// Add user to the group
const { error: memberError } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .insert({
    group_id: invitation.group_id,
    user_id: userId,
    role: 'member',
    status: 'active',
    joined_at: new Date().toISOString(),
    invitation_code: code
  });
  
if (memberError) {
  return { success: false, error: memberError.message };
}

// Increment the used count
await supabase
  .from('group_invitations')
  .update({ 
    used_count: invitation.used_count + 1,
    updated_at: new Date().toISOString()
  })
  .eq('id', invitation.id);

// Get the group details
const { data: group } = await getGroup(invitation.group_id);

return { success: true, data: group };
} catch (error) {
return handleError(error, 'Failed to join group with code');
}
}

/**
* Send a join request to a group.
* @param groupId - The group's unique identifier
* @param userId - The user's unique identifier
* @param message - Optional message with the request
* @returns Result indicating success or failure
*/
export async function requestToJoinGroup(
groupId: string,
userId: string,
message: string = ''
): Promise<Result<any>> {
try {
const supabase = await createRouteHandlerClient();

// Check if user already has a pending request
const { data: existingRequest } = await supabase
  .from('group_join_requests')
  .select('*')
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .eq('status', 'pending')
  .maybeSingle();
  
if (existingRequest) {
  return { 
    success: false, 
    error: 'You already have a pending request to join this group',
    code: 'PENDING_REQUEST'
  };
}

// Check if user is already a member
const { data: existingMember } = await supabase
  .from(TABLES.GROUP_MEMBERS)
  .select('*')
  .eq('group_id', groupId)
  .eq('user_id', userId)
  .maybeSingle();
  
if (existingMember) {
  return { 
    success: false, 
    error: 'You are already a member of this group',
    code: 'ALREADY_MEMBER'
  };
}

// Create the join request
const { data, error } = await supabase
  .from('group_join_requests')
  .insert({
    group_id: groupId,
    user_id: userId,
    message,
    status: 'pending',
    created_at: new Date().toISOString()
  })
  .select()
  .single();
  
if (error) return { success: false, error: error.message };

return { success: true, data };
} catch (error) {
return handleError(error, 'Failed to request to join group');
}
}

/**
* Handle a group join request (approve or reject).
* @param requestId - The join request's unique identifier
* @param action - The action to take ('approve' or 'reject')
* @param adminId - The ID of the admin handling the request
* @returns Result indicating success or failure
*/
export async function handleJoinRequest(
requestId: string,
action: 'approve' | 'reject',
adminId: string
): Promise<Result<any>> {
try {
const supabase = await createRouteHandlerClient();

// Get the request
const { data: request, error: requestError } = await supabase
  .from('group_join_requests')
  .select('*')
  .eq('id', requestId)
  .single();
  
if (requestError || !request) {
  return { success: false, error: 'Join request not found' };
}

// Check if the request is still pending
if (request.status !== 'pending') {
  return { 
    success: false, 
    error: 'This request has already been processed',
    code: 'ALREADY_PROCESSED'
  };
}

// Check if admin has permission
const permissionResult = await checkGroupMemberRole(
  request.group_id, 
  adminId, 
  ['admin']
);

if (!permissionResult.success || !permissionResult.data) {
  return { 
    success: false, 
    error: 'You do not have permission to handle join requests',
    code: 'PERMISSION_DENIED'
  };
}

// Update request status
await supabase
  .from('group_join_requests')
  .update({ 
    status: action,
    handled_by: adminId,
    handled_at: new Date().toISOString()
  })
  .eq('id', requestId);

if (action === 'approve') {
  // Add user to the group
  const { error: memberError } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .insert({
      group_id: request.group_id,
      user_id: request.user_id,
      role: 'member',
      status: 'active',
      joined_at: new Date().toISOString(),
      added_by: adminId
    });
    
  if (memberError) {
    return { success: false, error: memberError.message };
  }
}

return { 
  success: true, 
  data: { action, userId: request.user_id, groupId: request.group_id } 
};
} catch (error) {
return handleError(error, 'Failed to handle join request');
}
}

/**
* Type guard to check if an object is a Group
*/
export function isGroup(obj: any): obj is Group {
return obj && 
typeof obj.id === 'string' && 
typeof obj.name === 'string' &&
typeof obj.visibility === 'string';
}