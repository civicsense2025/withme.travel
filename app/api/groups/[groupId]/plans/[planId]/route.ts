/**
 * Group Plan API Routes
 *
 * Handles operations for a specific plan within a group:
 * - GET: Fetch a specific plan with its items
 * - PUT: Update a plan
 * - DELETE: Remove a plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import {
  getGroupPlan,
  updateGroupPlan,
  updateGroupPlanItems,
  deleteGroupPlan,
  deleteGroupPlanItem,
  checkGroupMemberRole,
} from '@/lib/api/groups';

// Validation schema for updating a plan
const updatePlanSchema = z.object({
  title: z.string().min(1, 'Plan title is required'),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  meta: z.record(z.any()).optional(),
});

// Validation schema for plan items
const planItemsSchema = z.array(
  z.object({
    id: z.string().optional(), // Optional for new items
    title: z.string().min(1, 'Item title is required'),
    description: z.string().optional().nullable(),
    order: z.number().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    meta: z.record(z.any()).optional(),
  })
);

/**
 * GET /api/groups/[groupId]/plans/[planId]
 * Fetch a specific plan from a group with its items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string; planId: string } }
) {
  try {
    const { groupId, planId } = params;

    if (!groupId || !planId) {
      return NextResponse.json(
        {
          error: 'Group ID and Plan ID are required',
        },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Check if the user is a member of the group
    const memberResult = await checkGroupMemberRole(groupId, user.id, ['owner', 'admin', 'member']);

    if (!memberResult.success) {
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }

    if (!memberResult.data) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Fetch the plan with items
    const result = await getGroupPlan(groupId, planId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Plan not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in GET /api/groups/[groupId]/plans/[planId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PUT /api/groups/[groupId]/plans/[planId]
 * Update a specific plan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { groupId: string; planId: string } }
) {
  try {
    const { groupId, planId } = params;

    if (!groupId || !planId) {
      return NextResponse.json(
        {
          error: 'Group ID and Plan ID are required',
        },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Check if the user is a member of the group
    const memberResult = await checkGroupMemberRole(groupId, user.id, ['owner', 'admin', 'member']);

    if (!memberResult.success) {
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }

    if (!memberResult.data) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Check what kind of update this is (plan update or items update)
    const url = new URL(request.url);
    const updateType = url.searchParams.get('type') || 'plan';

    if (updateType === 'items') {
      // Validate items array
      try {
        planItemsSchema.parse(body);
      } catch (validationError) {
        return NextResponse.json(
          { error: 'Invalid plan items data', details: validationError },
          { status: 400 }
        );
      }

      // Update plan items
      const result = await updateGroupPlanItems(groupId, planId, body, user.id);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ data: result.data });
    } else {
      // Regular plan update
      try {
        updatePlanSchema.parse(body);
      } catch (validationError) {
        return NextResponse.json(
          { error: 'Invalid plan data', details: validationError },
          { status: 400 }
        );
      }

      // Update the plan
      const result = await updateGroupPlan(groupId, planId, body);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ data: result.data });
    }
  } catch (error) {
    console.error('Error in PUT /api/groups/[groupId]/plans/[planId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * DELETE /api/groups/[groupId]/plans/[planId]
 * Delete a specific plan or a plan item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string; planId: string } }
) {
  try {
    const { groupId, planId } = params;

    if (!groupId || !planId) {
      return NextResponse.json(
        {
          error: 'Group ID and Plan ID are required',
        },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Check if the user has admin rights
    const memberResult = await checkGroupMemberRole(groupId, user.id, ['owner', 'admin']);

    if (!memberResult.success) {
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }

    if (!memberResult.data) {
      return NextResponse.json(
        { error: 'You do not have permission to delete plans' },
        { status: 403 }
      );
    }

    // Check if we're deleting an item or the whole plan
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');

    if (itemId) {
      // Delete specific item
      const result = await deleteGroupPlanItem(groupId, planId, itemId);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      // Delete the plan
      const result = await deleteGroupPlan(groupId, planId);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/groups/[groupId]/plans/[planId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
