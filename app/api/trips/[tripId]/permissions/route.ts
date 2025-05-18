import { NextRequest, NextResponse } from 'next/server';
import {
  listPermissionRequests,
  createPermissionRequest,
  updatePermissionRequest,
} from '@/lib/api/permissions';
import { z } from 'zod';

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

// Schema for role updates
const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'editor', 'contributor', 'viewer']),
});

const patchSchema = z.object({
  requestId: z.string(),
  role: z.enum(['admin', 'editor', 'contributor', 'viewer']).optional(),
  message: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
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
    const { tripId } = await params;
    if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    const result = await listPermissionRequests(tripId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ requests: result.data });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
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
    if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    const requestBody = await request.json();
    const validation = permissionRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { role, message } = validation.data;
    // Map role to requested_role for PermissionRequest
    const result = await createPermissionRequest(tripId, { requested_role: role, message });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ request: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    if (!tripId) return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    const body = await request.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { requestId, role, message, status } = validation.data;
    // Map role to requested_role if present
    const updateData: any = {};
    if (role) updateData.requested_role = role;
    if (message) updateData.message = message;
    if (status) updateData.status = status;
    const result = await updatePermissionRequest(tripId, requestId, updateData);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ request: result.data });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
