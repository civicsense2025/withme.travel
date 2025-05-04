import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-middleware';
import { ensureTripAccess } from '@/lib/trip-access';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// Class for API errors with status code
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

// Input validation helper
async function validateInput<T>(data: any, schema: z.ZodSchema<T>): Promise<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(`Validation error: ${error.errors[0].message}`, 400);
    }
    throw error;
  }
}

// Define response interface for permission checks
export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: string | null;
}

// Use ENUMS directly
const permissionRequestSchema = z.object({
  role: z.enum(['admin', 'editor', 'contributor', 'viewer']).optional().default('editor'),
  message: z.string().optional(),
});

/**
 * Get all permission requests for a trip
 * @param request The HTTP request
 * @param context The context containing route parameters
 * @returns A JSON response with the list of permission requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `get_permission_requests_${ip}`;
    const rateLimitResponse = await rateLimit.applyLimit(request, rateLimitKey, 60, 60);
    if (rateLimitResponse) return rateLimitResponse;

    const { tripId } = await params;
    if (!tripId) return errorResponse('Trip ID is required', 400);

    const supabase = await createRouteHandlerClient();

    return await withAuth(async (user) => {
      try {
        const accessResponse = await ensureTripAccess(user.id, tripId, ['admin', 'editor']);
        if (accessResponse) return accessResponse;

        const { data: requests, error } = await supabase
          .from('permission_requests')
          .select(
            `
            *,
            user:user_id(id, name, email, avatar_url)
          `
          )
          .eq('trip_id', tripId)
          .eq('status', 'pending');

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
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    if (!tripId) {
      return errorResponse('Trip ID is required', 400);
    }

    const supabase = await createRouteHandlerClient();

    return await withAuth(async (user) => {
      try {
        const accessResponse = await ensureTripAccess(user.id, tripId, ['admin', 'editor']);
        if (accessResponse) return accessResponse;

        const { data: existingMember, error: checkError } = await supabase
          .from('trip_members')
          .select('id')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkError) throw new ApiError(checkError.message, 500);
        if (existingMember) {
          return errorResponse('You are already a member of this trip', 400);
        }

        const requestBody = await request.json();
        const { role, message } = await validateInput(requestBody, permissionRequestSchema);

        const { data: existingRequest, error: requestError } = await supabase
          .from('permission_requests')
          .select('id')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (requestError) throw new ApiError(requestError.message, 500);
        if (existingRequest) {
          return errorResponse('You already have a pending request for this trip', 400);
        }

        const { data, error } = await supabase
          .from('permission_requests')
          .insert([
            {
              trip_id: tripId,
              user_id: user.id,
              role: role,
              message: message,
              status: 'pending',
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    if (!tripId) {
      return errorResponse('Trip ID is required', 400);
    }

    // Implementation for PATCH method
    return successResponse({ message: 'Permission updated successfully' });
  } catch (error) {
    console.error(`[Permissions PATCH Top-Level Error]:`, error);
    return errorResponse('An unexpected error occurred', 500);
  }
}
