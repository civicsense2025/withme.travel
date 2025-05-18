import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getErrorMessage } from '@/utils/error-handling';
import { GroupPlanSchema } from '@/types/schemas';
import { listGroupPlans, createGroupPlan, checkGroupMemberRole } from '@/lib/api/groups';

// Schema for create plan request
const CreatePlanRequestSchema = z.object({
  title: z.string().min(1, 'Plan title is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  meta: z.record(z.any()).optional().nullable(),
  items: z.array(z.any()).optional(),
});

// Schema for group plan response
const GroupPlansResponseSchema = z.object({
  data: z.array(GroupPlanSchema),
});

/**
 * GET handler for retrieving all plans for a group
 */
export async function GET(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    // Access the group ID from params directly
    const groupId = params.groupId;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Create the Supabase client
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Get guest token if user is not authenticated
    const cookieStore = await cookies();
    const guestTokenCookie = cookieStore.get('guest_token');
    const guestToken = guestTokenCookie?.value;

    if ((!user || authError) && !guestToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // If user is authenticated, check if they are a member of the group
    if (user) {
      const memberResult = await checkGroupMemberRole(groupId, user.id, [
        'owner',
        'admin',
        'member',
      ]);

      if (!memberResult.success || !memberResult.data) {
        return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
      }
    }
    // TODO: Handle guest access check through a centralized function
    else if (guestToken) {
      // For now, we'll let this pass and let the API function handle the check
      console.log('Using guest token for access:', guestToken);
    }

    // Get group plans using centralized API
    const plansResult = await listGroupPlans(groupId);

    if (!plansResult.success) {
      return NextResponse.json({ error: plansResult.error }, { status: 500 });
    }

    return NextResponse.json({ data: plansResult.data });
  } catch (error) {
    console.error('Error processing group plans request:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

/**
 * POST handler for creating a new plan
 */
export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    // Access the group ID from params directly
    const groupId = params.groupId;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreatePlanRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const planData = validationResult.data;

    // Create the Supabase client
    const supabase = await createRouteHandlerClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check for guest token if no authenticated user
    const cookieStore = await cookies();
    const guestTokenCookie = cookieStore.get('guest_token');
    const guestToken = guestTokenCookie?.value;

    if ((!user || authError) && !guestToken) {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // For authenticated users
    if (user) {
      // Check if user is a member of the group
      const memberResult = await checkGroupMemberRole(groupId, user.id, [
        'owner',
        'admin',
        'member',
      ]);

      if (!memberResult.success || !memberResult.data) {
        return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
      }

      // Create new plan using centralized API
      const createResult = await createGroupPlan(groupId, planData, user.id);

      if (!createResult.success) {
        return NextResponse.json({ error: createResult.error }, { status: 500 });
      }

      return NextResponse.json({ data: createResult.data }, { status: 201 });
    }
    // TODO: Add guest group plan creation using centralized API
    else if (guestToken) {
      return NextResponse.json(
        { error: 'Guest plan creation not yet implemented' },
        { status: 501 }
      );
    }

    return NextResponse.json({ error: 'Unexpected authentication state' }, { status: 500 });
  } catch (error) {
    console.error('Error creating group plan:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
