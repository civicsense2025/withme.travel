import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/tables';
import { API_ROUTES } from '@/utils/constants/routes';
import { z } from 'zod';
import { getErrorMessage } from '@/utils/error-handling';
import { success, failure } from '@/utils/result';
import { GroupPlanSchema } from '@/types/schemas';

// --- Types ---
interface GroupPlan {
  id: string;
  group_id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  destination_id?: string | null;
  destination_name?: string | null;
  options?: Record<string, any> | null;
  created_by: string;
  // ...add more fields as needed
}

interface GroupPlanResponse {
  plan: GroupPlan;
  success: true;
}

interface ErrorResponse {
  error: string;
  code?: string;
  success: false;
}

// Schema for create plan request
const CreatePlanRequestSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  destination_id: z.string().uuid().optional().nullable(),
  destination_name: z.string().optional().nullable(),
  options: z.record(z.any()).optional().nullable(),
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
    // Safely access the group ID from params
    const groupId = params.groupId;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Create the Supabase client - must be awaited
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of the group
    const { data: memberData, error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('user_id, role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }

    // Get group plans
    const { data, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group plans:', error);
      return NextResponse.json({ error: 'Failed to fetch group plans' }, { status: 500 });
    }

    // Validate response data
    const result = GroupPlansResponseSchema.safeParse({ data });

    if (!result.success) {
      console.error('Invalid group plans data:', result.error);
      return NextResponse.json(
        { error: 'Invalid group plans data format', details: result.error.format() },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data.data });
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
    // Safely access the group ID from params
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

    // Create the Supabase client - must be awaited
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of the group
    const { data: memberData, error: memberError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('user_id, role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }

    // Create new plan
    const { data, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .insert({
        group_id: groupId,
        name: planData.name,
        description: planData.description,
        start_date: planData.start_date,
        end_date: planData.end_date,
        destination_id: planData.destination_id,
        destination_name: planData.destination_name,
        options: planData.options,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group plan:', error);
      return NextResponse.json({ error: 'Failed to create group plan' }, { status: 500 });
    }

    // Validate created plan
    const validPlan = GroupPlanSchema.safeParse(data);

    if (!validPlan.success) {
      console.error('Invalid created plan data:', validPlan.error);
      return NextResponse.json({ error: 'Created plan has invalid format' }, { status: 500 });
    }

    return NextResponse.json({ data: validPlan.data }, { status: 201 });
  } catch (error) {
    console.error('Error processing create plan request:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
