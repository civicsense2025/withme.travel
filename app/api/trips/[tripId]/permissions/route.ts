import { createApiClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server"
import { DB_TABLES, DB_FIELDS, DB_ENUMS, TripRole, RequestStatus } from "@/utils/constants/database"
import { 
  errorResponse, 
  successResponse, 
  validateInput, 
  ApiError 
} from "@/lib/api-utils"
import { requireAuth, withAuth } from "@/lib/auth-middleware"
import { checkTripAccess, getTripPermissions, ensureTripAccess } from "@/lib/trip-access"
import { rateLimit } from "@/lib/rate-limit"
import { z } from 'zod'

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

// Validation schema for permission request
const permissionRequestSchema = z.object({
  role: z.enum([
    DB_ENUMS.TRIP_ROLES.ADMIN, 
    DB_ENUMS.TRIP_ROLES.EDITOR, 
    DB_ENUMS.TRIP_ROLES.CONTRIBUTOR, 
    DB_ENUMS.TRIP_ROLES.VIEWER
  ]).optional().default(DB_ENUMS.TRIP_ROLES.EDITOR),
  message: z.string().optional()
});

/**
 * Get all permission requests for a trip
 * @param request The HTTP request
 * @param context The context containing route parameters
 * @returns A JSON response with the list of permission requests
 */
export async function GET(request: NextRequest, context: { params: { tripId: string } }) {
  // Apply rate limiting based on IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `get_permission_requests_${ip}`;
  const rateLimitResponse = await rateLimit.applyLimit(request, rateLimitKey, 60, 60);
  if (rateLimitResponse) return rateLimitResponse;

  return withAuth(async (user) => {
    const { tripId } = context.params;
    if (!tripId) return errorResponse("Trip ID is required", 400);

    const supabase = createClient();
    
    // Check if user is an admin or editor of this trip
    const accessResponse = await ensureTripAccess(
      user.id, 
      tripId, 
      [DB_ENUMS.TRIP_ROLES.ADMIN, DB_ENUMS.TRIP_ROLES.EDITOR]
    );
    
    if (accessResponse) return accessResponse;
    
    try {
      // Get all pending permission requests for this trip
      const { data: requests, error } = await supabase
        .from(DB_TABLES.PERMISSION_REQUESTS)
        .select(`
          *,
          user:user_id(id, name, email, avatar_url)
        `)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.STATUS, DB_ENUMS.REQUEST_STATUSES.PENDING);

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return successResponse({ requests });
    } catch (error) {
      console.error(`Error fetching permissions for trip ${tripId}:`, error);
      return errorResponse(
        error instanceof ApiError ? error.message : "Failed to fetch permissions",
        error instanceof ApiError ? error.status : 500
      );
    }
  });
}

/**
 * Create a new permission request for a trip
 * @param request The HTTP request containing role and message
 * @param context The context containing route parameters
 * @returns A JSON response with the created request or error
 */
export async function POST(request: Request, context: { params: { tripId: string } }) {
  return withAuth(async (user) => {
    const { tripId } = context.params;
    if (!tripId) return errorResponse("Trip ID is required", 400);

    try {
      const supabase = createClient();
      
      // Check if user is already a member of this trip
      const { data: existingMember, error: checkError } = await supabase
        .from(DB_TABLES.TRIP_MEMBERS)
        .select()
        .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
        .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, user.id)
        .maybeSingle();

      if (existingMember) {
        return errorResponse("You are already a member of this trip", 400);
      }

      // Validate request body
      const requestBody = await request.json();
      const { role, message } = await validateInput(requestBody, permissionRequestSchema);

      // Check if request already exists
      const { data: existingRequest, error: requestError } = await supabase
        .from(DB_TABLES.PERMISSION_REQUESTS)
        .select()
        .eq(DB_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.USER_ID, user.id)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.STATUS, DB_ENUMS.REQUEST_STATUSES.PENDING)
        .maybeSingle();

      if (existingRequest) {
        return errorResponse("You already have a pending request for this trip", 400);
      }

      // Create permission request
      const { data, error } = await supabase
        .from(DB_TABLES.PERMISSION_REQUESTS)
        .insert([{
          [DB_FIELDS.PERMISSION_REQUESTS.TRIP_ID]: tripId,
          [DB_FIELDS.PERMISSION_REQUESTS.USER_ID]: user.id,
          [DB_FIELDS.PERMISSION_REQUESTS.ROLE]: role,
          [DB_FIELDS.PERMISSION_REQUESTS.MESSAGE]: message,
          [DB_FIELDS.PERMISSION_REQUESTS.STATUS]: DB_ENUMS.REQUEST_STATUSES.PENDING
        }])
        .select();

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return successResponse({ request: data[0] }, 201);
    } catch (error) {
      console.error(`Error creating permission request for trip ${tripId}:`, error);
      return errorResponse(
        error instanceof ApiError ? error.message : "Failed to create permission request",
        error instanceof ApiError ? error.status : 500
      );
    }
  });
}

// Schema for updating a permission request status
const updateStatusSchema = z.object({
  status: z.enum([
    DB_ENUMS.REQUEST_STATUSES.APPROVED, 
    DB_ENUMS.REQUEST_STATUSES.REJECTED
  ])
});

/**
 * Update a permission request status (approve/reject)
 * @param request The HTTP request containing the new status
 * @param context The context containing route parameters
 * @returns A JSON response indicating success or error
 */
export async function PATCH(request: NextRequest, context: { params: { tripId: string, requestId: string } }) {
  return withAuth(async (user) => {
    const { tripId, requestId } = context.params;
    
    if (!tripId || !requestId) {
      return errorResponse("Trip ID and Request ID are required", 400);
    }

    try {
      const supabase = createClient();
      
      // Validate request body
      const requestBody = await request.json();
      const { status } = await validateInput(requestBody, updateStatusSchema);

      // Verify user is admin of the trip
      const accessResponse = await ensureTripAccess(
        user.id, 
        tripId, 
        [DB_ENUMS.TRIP_ROLES.ADMIN]
      );
      
      if (accessResponse) return accessResponse;

      // Get the request to update
      const { data: permRequest, error: fetchError } = await supabase
        .from(DB_TABLES.PERMISSION_REQUESTS)
        .select(DB_FIELDS.PERMISSION_REQUESTS.ID)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.ID, requestId)
        .eq(DB_FIELDS.PERMISSION_REQUESTS.TRIP_ID, tripId)
        .single();

      if (fetchError || !permRequest) {
        return errorResponse("Permission request not found", 404);
      }

      // Update status
      const { error } = await supabase
        .from(DB_TABLES.PERMISSION_REQUESTS)
        .update({ [DB_FIELDS.PERMISSION_REQUESTS.STATUS]: status })
        .eq(DB_FIELDS.PERMISSION_REQUESTS.ID, requestId);

      if (error) {
        throw new ApiError(`Failed to update request status: ${error.message}`, 500);
      }

      // If approved, add user to trip members
      if (status === DB_ENUMS.REQUEST_STATUSES.APPROVED) {
        // Get the full request details
        const { data: fullRequest, error: fullRequestError } = await supabase
          .from(DB_TABLES.PERMISSION_REQUESTS)
          .select('*')
          .eq(DB_FIELDS.PERMISSION_REQUESTS.ID, requestId)
          .single();

        if (fullRequestError || !fullRequest) {
          return errorResponse("Failed to get request details", 500);
        }

        // Add user as a trip member
        const { error: addError } = await supabase
          .from(DB_TABLES.TRIP_MEMBERS)
          .insert({
            [DB_FIELDS.TRIP_MEMBERS.TRIP_ID]: tripId,
            [DB_FIELDS.TRIP_MEMBERS.USER_ID]: fullRequest.user_id,
            [DB_FIELDS.TRIP_MEMBERS.ROLE]: fullRequest.role,
            [DB_FIELDS.TRIP_MEMBERS.INVITED_BY]: user.id,
            [DB_FIELDS.TRIP_MEMBERS.JOINED_AT]: new Date().toISOString()
          });

        if (addError) {
          throw new ApiError(`Failed to add member to trip: ${addError.message}`, 500);
        }
      }

      return successResponse({ success: true, status });
    } catch (error) {
      console.error(`Error updating permission request for trip ${tripId}:`, error);
      return errorResponse(
        error instanceof ApiError ? error.message : "Failed to update permission request",
        error instanceof ApiError ? error.status : 500
      );
    }
  });
}

/**
 * Get detailed permissions for the current user on a trip
 * @param request The HTTP request
 * @param context The context containing route parameters
 * @returns A JSON response with the user's permissions
 */
export async function GET_TRIP_PERMISSIONS(
  request: Request,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  return withAuth(async (user) => {
    const { tripId } = params;
    if (!tripId) return errorResponse("Trip ID is required", 400);

    try {
      // Get detailed permissions for this user on the trip
      const permissions = await getTripPermissions(user.id, tripId);
      return successResponse({ permissions });
    } catch (error) {
      console.error(`Error fetching user permissions for trip ${tripId}:`, error);
      return errorResponse(
        error instanceof ApiError ? error.message : "Failed to fetch permissions",
        error instanceof ApiError ? error.status : 500
      );
    }
  });
} 