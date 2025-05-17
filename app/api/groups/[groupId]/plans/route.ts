import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/tables';
import { API_ROUTES } from '@/utils/constants/routes';
import { z } from 'zod';
import { getErrorMessage } from '@/utils/error-handling';
import { success, failure } from '@/utils/result';
import { GroupPlanSchema } from '@/types/schemas';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/utils/constants/database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    // Access the group ID from params directly
    const groupId = params.groupId;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Create the Supabase client with awaited cookies
    const cookieStore = await cookies();
    const supabase = await createRouteHandlerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Get guest token if user is not authenticated
    const guestTokenCookie = cookieStore.get('guest_token');
    const guestToken = guestTokenCookie?.value;

    if ((!user || authError) && !guestToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // If user is authenticated, check if they are a member of the group
    if (user) {
      const { data: memberData, error: memberError } = await supabase
        .from(TABLES.GROUP_MEMBERS) // TODO: Add group_members to Database type for type safety
        .select('user_id, role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
      }
    } 
    // If guest user, check if they have access to the group
    else if (guestToken) {
      const { data: guestGroupAccess, error: guestAccessError } = await supabase
        .from('group_guest_members')
        .select('guest_token, role')
        .eq('group_id', groupId)
        .eq('guest_token', guestToken)
        .single();

      if (guestAccessError || !guestGroupAccess) {
        return NextResponse.json({ error: 'You do not have access to this group' }, { status: 403 });
      }

      const guestRole = (guestGroupAccess as unknown as { role: string }).role;
      console.log('Guest has group access with role:', guestRole);
    }

    // Get group plans
    const { data, error } = await supabase
      .from(TABLES.GROUP_PLANS) // TODO: Add group_plans to Database type for type safety
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
    // Log request information
    console.log('Creating group plan - Request received:', {
      groupId: params.groupId,
      method: request.method,
      url: request.url,
    });

    // Access the group ID from params directly
    const groupId = params.groupId;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    
    const validationResult = CreatePlanRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.format());
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const planData = validationResult.data;
    console.log('Validated plan data:', planData);

    // Create the Supabase client using route handler client
    console.log('Creating Supabase client...');
    const supabase = await createRouteHandlerClient();
    
    // Verify authentication
    console.log('Checking authentication...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check for guest token if no authenticated user
    const cookieStore = await cookies();
    const guestTokenCookie = cookieStore.get('guest_token');
    const guestToken = guestTokenCookie?.value;

    if ((!user || authError) && !guestToken) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: authError?.message || 'No authenticated user or guest token found' 
      }, { status: 401 });
    }

    // For authenticated users
    if (user) {
      console.log('Authenticated user:', user.id);

      // Check if user is a member of the group
      console.log('Checking group membership...');
      const { data: memberData, error: memberError } = await supabase
        .from(TABLES.GROUP_MEMBERS) // TODO: Add group_members to Database type for type safety
        .select('user_id, role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error('Group membership check error:', memberError);
        return NextResponse.json({ 
          error: 'You are not a member of this group',
          details: memberError?.message || 'No membership record found'
        }, { status: 403 });
      }

      console.log('User is group member with role:', memberData.role);

      // Create new plan for authenticated user
      console.log('Creating group plan...');
      const { data, error } = await supabase
        .from(TABLES.GROUP_PLANS) // TODO: Add group_plans to Database type for type safety
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
        return NextResponse.json({ 
          error: 'Failed to create group plan', 
          details: error,
          code: error.code,
          message: error.message,
          hint: error.hint || 'No hint available'
        }, { status: 500 });
      }

      console.log('Group plan created successfully:', data.id);
      return NextResponse.json({ data }, { status: 201 });
    } 
    // For guest users
    else if (guestToken) {
      console.log('Guest user with token:', guestToken);

      // Check if guest has access to the group
      console.log('Checking guest group access...');
      const { data: guestGroupAccess, error: guestAccessError } = await supabase
        .from('group_guest_members')
        .select('guest_token, role')
        .eq('group_id', groupId)
        .eq('guest_token', guestToken)
        .single();

      if (
        guestAccessError ||
        !guestGroupAccess ||
        typeof guestGroupAccess !== 'object' ||
        !('role' in guestGroupAccess)
      ) {
        console.error('Guest access check error:', guestAccessError);
        return NextResponse.json({ 
          error: 'You do not have access to this group',
          details: guestAccessError?.message || 'No guest access record found'
        }, { status: 403 });
      }

      const guestRole = (guestGroupAccess as unknown as { role: string }).role;
      console.log('Guest has group access with role:', guestRole);

      // Create new plan for guest user
      console.log('Creating group plan as guest...');
      const { data, error } = await supabase
        .from(TABLES.GROUP_PLANS) // TODO: Add group_plans to Database type for type safety
        .insert({
          group_id: groupId,
          name: planData.name,
          description: planData.description,
          start_date: planData.start_date,
          end_date: planData.end_date,
          destination_id: planData.destination_id,
          destination_name: planData.destination_name,
          options: planData.options,
          guest_token: guestToken,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group plan as guest:', error);
        return NextResponse.json({ 
          error: 'Failed to create group plan', 
          details: error,
          code: error.code,
          message: error.message,
          hint: error.hint || 'No hint available'
        }, { status: 500 });
      }

      console.log('Group plan created successfully by guest:', data.id);
      return NextResponse.json({ data }, { status: 201 });
    }

    // This shouldn't happen due to earlier checks
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  } catch (error) {
    console.error('Error processing create plan request:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error),
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
