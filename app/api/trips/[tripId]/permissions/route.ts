import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
// Removed problematic constant imports
// import { DB_TABLES, DB_FIELDS, DB_ENUMS, type TripRole } from '@/utils/constants/database';
import { errorResponse, successResponse, validateInput, ApiError } from '@/lib/api-utils';
import { requireAuth, withAuth } from '@/lib/auth-middleware';
import { checkTripAccess, getTripPermissions, ensureTripAccess } from '@/lib/trip-access';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// --- Local Constant Definitions (Workaround) ---
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';
const LOCAL_TABLES = {
  PERMISSION_REQUESTS: 'permission_requests',
  TRIP_MEMBERS: 'trip_members',
};
const LOCAL_FIELDS = {
  PERMISSION_REQUESTS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    STATUS: 'status',
    ROLE: 'role', // Field name is ROLE
    MESSAGE: 'message',
  },
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    INVITED_BY: 'invited_by',
    JOINED_AT: 'joined_at',
  },
};
const LOCAL_ENUMS = {
  TRIP_ROLE: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    CONTRIBUTOR: 'contributor',
    VIEWER: 'viewer',
  } as const,
  ACCESS_REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  } as const,
};
// --- End Local Definitions ---

// Define response interface for permission checks
export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: TripRole | null;
}

// Use LOCAL_ENUMS
const permissionRequestSchema = z.object({
  role: z
    .enum([
      LOCAL_ENUMS.TRIP_ROLE.ADMIN,
      LOCAL_ENUMS.TRIP_ROLE.EDITOR,
      LOCAL_ENUMS.TRIP_ROLE.CONTRIBUTOR,
      LOCAL_ENUMS.TRIP_ROLE.VIEWER,
    ])
    .optional()
    .default(LOCAL_ENUMS.TRIP_ROLE.EDITOR),
  message: z.string().optional(),
});

/**
 * Get all permission requests for a trip
 * @param request The HTTP request
 * @param context The context containing route parameters
 * @returns A JSON response with the list of permission requests
 */
export async function GET(request: NextRequest, context: { params: Promise<{ tripId: string }> }) {
  try {
    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `get_permission_requests_${ip}`;
    const rateLimitResponse = await rateLimit.applyLimit(request, rateLimitKey, 60, 60);
    if (rateLimitResponse) return rateLimitResponse;

    const { tripId } = await context.params;
    if (!tripId) return errorResponse('Trip ID is required', 400);

    return await withAuth(async (user) => {
      try {
        const supabase = await createServerSupabaseClient();
        const accessResponse = await ensureTripAccess(user.id, tripId, [
          LOCAL_ENUMS.TRIP_ROLE.ADMIN,
          LOCAL_ENUMS.TRIP_ROLE.EDITOR,
        ]);
        if (accessResponse) return accessResponse;

        const { data: requests, error } = await supabase
          .from(LOCAL_TABLES.PERMISSION_REQUESTS)
          .select(
            `
            *,
            user:user_id(id, name, email, avatar_url)
          `
          )
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.STATUS, LOCAL_ENUMS.ACCESS_REQUEST_STATUS.PENDING);

        if (error) {
          throw new ApiError(error.message, 500);
        }

        return successResponse({ requests });
      } catch (error) {
        console.error(`[Permissions GET Handler Error] Trip ${tripId}:`, error);
        return errorResponse(
          error instanceof ApiError ? error.message : 'Failed to fetch permissions',
          error instanceof ApiError ? error.status : 500
        );
      }
    });
  } catch (error) {
    console.error(`[Permissions GET Top-Level Error]:`, error);
    return errorResponse('An unexpected error occurred', 500);
  }
}

/**
 * Create a new permission request for a trip
 * @param request The HTTP request containing role and message
 * @param context The context containing route parameters
 * @returns A JSON response with the created request or error
 */
export async function POST(request: NextRequest, context: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await context.params;
    if (!tripId) return errorResponse('Trip ID is required', 400);

    return await withAuth(async (user) => {
      try {
        const supabase = await createServerSupabaseClient();

        // Check if user is already a member of this trip
        const { data: existingMember, error: checkError } = await supabase
          .from(LOCAL_TABLES.TRIP_MEMBERS)
          .select()
          .eq(LOCAL_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
          .eq(LOCAL_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
          .maybeSingle();

        if (checkError) throw new ApiError(checkError.message, 500);
        if (existingMember) {
          return errorResponse('You are already a member of this trip', 400);
        }

        // Validate request body
        const requestBody = await request.json();
        const { role, message } = await validateInput(requestBody, permissionRequestSchema);

        // Check if request already exists
        const { data: existingRequest, error: requestError } = await supabase
          .from(LOCAL_TABLES.PERMISSION_REQUESTS)
          .select()
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.USER_ID, user.id)
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.STATUS, LOCAL_ENUMS.ACCESS_REQUEST_STATUS.PENDING)
          .maybeSingle();

        if (requestError) throw new ApiError(requestError.message, 500);
        if (existingRequest) {
          return errorResponse('You already have a pending request for this trip', 400);
        }

        // Create permission request
        const { data, error } = await supabase
          .from(LOCAL_TABLES.PERMISSION_REQUESTS)
          .insert([
            {
              [LOCAL_FIELDS.PERMISSION_REQUESTS.TRIP_ID]: tripId,
              [LOCAL_FIELDS.PERMISSION_REQUESTS.USER_ID]: user.id,
              [LOCAL_FIELDS.PERMISSION_REQUESTS.ROLE]: role,
              [LOCAL_FIELDS.PERMISSION_REQUESTS.MESSAGE]: message,
              [LOCAL_FIELDS.PERMISSION_REQUESTS.STATUS]: LOCAL_ENUMS.ACCESS_REQUEST_STATUS.PENDING,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new ApiError(error.message, 500);
        }

        return successResponse({ request: data }, 201);
      } catch (error) {
        console.error(`[Permissions POST Handler Error] Trip ${tripId}:`, error);
        return errorResponse(
          error instanceof ApiError ? error.message : 'Failed to create permission request',
          error instanceof ApiError ? error.status : 500
        );
      }
    });
  } catch (error) {
    console.error(`[Permissions POST Top-Level Error]:`, error);
    return errorResponse('An unexpected error occurred', 500);
  }
}

// Use LOCAL_ENUMS
const updateStatusSchema = z.object({
  status: z.enum([
    LOCAL_ENUMS.ACCESS_REQUEST_STATUS.APPROVED,
    LOCAL_ENUMS.ACCESS_REQUEST_STATUS.REJECTED,
  ]),
});

/**
 * Update a permission request status (approve/reject)
 * @param request The HTTP request containing the new status
 * @param context The context containing route parameters
 * @returns A JSON response indicating success or error
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ tripId: string; requestId: string }> }
) {
  try {
    const { tripId, requestId } = await context.params;
    if (!tripId || !requestId) {
      return errorResponse('Trip ID and Request ID are required', 400);
    }

    return await withAuth(async (user) => {
      try {
        const supabase = await createServerSupabaseClient();

        // Validate request body
        const requestBody = await request.json();
        const { status } = await validateInput(requestBody, updateStatusSchema);

        // Verify user is admin of the trip
        const accessResponse = await ensureTripAccess(user.id, tripId, [
          LOCAL_ENUMS.TRIP_ROLE.ADMIN,
        ]);

        if (accessResponse) return accessResponse;

        // Get the request to update
        const { data: permRequest, error: fetchError } = await supabase
          .from(LOCAL_TABLES.PERMISSION_REQUESTS)
          .select(LOCAL_FIELDS.PERMISSION_REQUESTS.ID)
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.ID, requestId)
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            return errorResponse('Permission request not found', 404);
          }
          throw new ApiError(`Failed to fetch permission request: ${fetchError.message}`, 500);
        }
        if (!permRequest) {
          return errorResponse('Permission request not found', 404);
        }

        // Update status
        const { error } = await supabase
          .from(LOCAL_TABLES.PERMISSION_REQUESTS)
          .update({ [LOCAL_FIELDS.PERMISSION_REQUESTS.STATUS]: status })
          .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.ID, requestId);

        if (error) {
          throw new ApiError(`Failed to update request status: ${error.message}`, 500);
        }

        // If approved, add user to trip members
        if (status === LOCAL_ENUMS.ACCESS_REQUEST_STATUS.APPROVED) {
          const { data: fullRequest, error: fullRequestError } = await supabase
            .from(LOCAL_TABLES.PERMISSION_REQUESTS)
            .select('*')
            .eq(LOCAL_FIELDS.PERMISSION_REQUESTS.ID, requestId)
            .single();

          if (fullRequestError || !fullRequest) {
            console.error(
              `[Permissions PATCH] Failed to re-fetch request ${requestId} after status update.`
            );
            throw new ApiError('Failed to retrieve request details after update', 500);
          }

          const { error: addError } = await supabase.from(LOCAL_TABLES.TRIP_MEMBERS).insert({
            [LOCAL_FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
            [LOCAL_FIELDS.TRIP_MEMBERS.USER_ID]: fullRequest.user_id,
            [LOCAL_FIELDS.TRIP_MEMBERS.ROLE]: fullRequest.role,
            [LOCAL_FIELDS.TRIP_MEMBERS.INVITED_BY]: user.id,
            [LOCAL_FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString(),
          });

          if (addError) {
            if (addError.code === '23505') {
              console.warn(
                `[Permissions PATCH] User ${fullRequest.user_id} already a member of trip ${tripId}. Ignoring insert error.`
              );
            } else {
              throw new ApiError(`Failed to add member to trip: ${addError.message}`, 500);
            }
          }
        }

        return successResponse({ success: true, status });
      } catch (error) {
        console.error(
          `[Permissions PATCH Handler Error] Trip ${tripId}, Request ${requestId}:`,
          error
        );
        return errorResponse(
          error instanceof ApiError ? error.message : 'Failed to update permission request',
          error instanceof ApiError ? error.status : 500
        );
      }
    });
  } catch (error) {
    console.error(`[Permissions PATCH Top-Level Error]:`, error);
    return errorResponse('An unexpected error occurred', 500);
  }
}
