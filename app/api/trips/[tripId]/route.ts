import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { NextResponse, NextRequest } from 'next/server';
import { API_ROUTES } from '@/utils/constants/routes';
import { z } from 'zod';
import { isBefore, parseISO, differenceInCalendarDays } from 'date-fns';
import { rateLimit, type RateLimitResult } from '@/lib/rate-limit';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import { createServerSupabaseClient } from '@/utils/supabase/server';

// Define trip roles based on ENUMS
const TRIP_ROLES = DB_ENUMS.TRIP_ROLES;

// Determine if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Constants and configuration for API handlers
 */
// Maximum number of requests allowed per time window
const MAX_REQUESTS_PER_WINDOW = 100;
// Time window in seconds for rate limiting
const RATE_LIMIT_WINDOW_SEC = 60;

/**
 * Custom error class for API errors that can be easily serialized
 */
class TripApiError extends ApiError {
  constructor(message: string, status = 400, details?: any) {
    super(message, status, details);
  }
}

// Define privacy enum values explicitly for Zod validation
const privacySettingEnum = z.enum(['private', 'shared_with_link', 'public']);

type TripPrivacySetting = z.infer<typeof privacySettingEnum>;

// Schema for date validation with proper formatting
const dateSchema = z
  .string()
  .refine(
    (date) => {
      if (!date) return true;
      try {
        parseISO(date);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD).' }
  )
  .nullable()
  .optional();

// Schema for validating date ranges when both dates are present
const dateRangeRefinement = (data: { start_date?: string | null; end_date?: string | null }) => {
  if (data.start_date && data.end_date) {
    try {
      const start = parseISO(data.start_date);
      const end = parseISO(data.end_date);
      return !isBefore(end, start);
    } catch {
      return false;
    }
  }
  return true;
};

// Enhanced schema for trip updates with additional validations
const updateTripSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100)
      .optional()
      .refine((name) => !name || name.trim().length > 0, 'Name cannot be empty'),
    start_date: dateSchema,
    end_date: dateSchema,
    destination_id: z.string().uuid('Invalid destination ID format').nullable().optional(),
    cover_image_url: z
      .string()
      .url('Must be a valid URL')
      .nullable()
      .optional()
      .refine((url) => !url || url.startsWith('https://'), 'Cover image URL must use HTTPS'),
    budget: z
      .number()
      .nonnegative('Budget must be a positive number or zero')
      .optional()
      .nullable(),
    cover_image_position_y: z
      .number()
      .min(0, 'Position must be between 0 and 100')
      .max(100, 'Position must be between 0 and 100')
      .optional()
      .nullable(),
    description: z
      .string()
      .max(1000, 'Description must be less than 1000 characters')
      .optional()
      .nullable(),
    privacy_setting: privacySettingEnum.optional(),
    playlist_url: z
      .union([
        z
          .string()
          .url('Must be a valid playlist URL')
          .refine(
            (url) => {
              // Restrict to known music streaming services
              const validDomains = [
                'spotify.com',
                'music.apple.com',
                'youtube.com',
                'youtu.be',
                'soundcloud.com',
                'tidal.com',
              ];
              try {
                const urlObj = new URL(url);
                return validDomains.some((domain) => urlObj.hostname.includes(domain));
              } catch {
                return false;
              }
            },
            { message: 'Playlist URL must be from a supported music platform' }
          ),
        z.string().max(0), // Empty string is valid
        z.null(),
      ])
      .optional(),
  })
  .strict()
  // Add refinement for date range validation
  .refine(dateRangeRefinement, {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

// Type definitions mirroring TripPageClientProps structure needed
interface MemberProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface TripMemberFromSSR {
  id: string; // member id
  trip_id: string;
  user_id: string;
  role: (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];
  joined_at: string;
  profiles: MemberProfile | null;
}

interface DisplayItineraryItem {
  // Define based on expected fields
  id: string;
  trip_id: string;
  section_id: string | null;
  day_number: number | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration: number | null;
  title: string | null;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  item_type: string | null;
  category: string | null;
  status: string | null;
  estimated_cost: number | null;
  currency: string | null;
  notes: string | null;
  source_url: string | null;
  confirmation_number: string | null;
  created_at: string;
  updated_at: string;
  // Add any other fields needed like votes, attachments etc.
}

interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: DisplayItineraryItem[]; // Add items here
}

interface ManualDbExpense {
  // Define based on expected fields
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string;
  date: string;
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

interface Tag {
  id: string;
  name: string;
}

// --- Add checkTripAccess back --- //
/**
 * Check if user has permission to access a trip
 * @param supabase Supabase client instance
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @param requiredRoles Optional role requirement (if specific role is needed)
 * @returns Object with hasAccess flag and role if found
 */
async function checkTripAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
  tripId: string,
  requiredRoles?: Array<(typeof TRIP_ROLES)[keyof typeof TRIP_ROLES]>
): Promise<{
  hasAccess: boolean;
  role?: (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];
}> {
  // Check if user is a member of the trip
  const { data: member, error: memberError } = await supabase
    .from(Tables.TRIP_MEMBERS)
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) {
    throw new TripApiError(`Error checking trip membership: ${memberError.message}`, 500);
  }

  if (!member) {
    return { hasAccess: false }; // Not a member, deny access (public check handled separately if needed)
  }

  const userRole = member.role as (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];

  // If specific roles are required, check if the user has one of them
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return { hasAccess: false, role: userRole }; // Has a role, but not the required one
    }
  }

  // If no specific roles required, or if user has a required role
  return { hasAccess: true, role: userRole };
}
// --- End checkTripAccess --- //

/**
 * GET trip details with enhanced validation, rate limiting, and error handling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { tripId } = await params;
  console.log(`[API /trips/${tripId}] GET handler started`); // Log start

  try {
    // Rate limit check (using correct rateLimit.limit)
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_GET_${ip}_${tripId}`;
    const limitResult: RateLimitResult = await rateLimit.limit(
      limitKey,
      MAX_REQUESTS_PER_WINDOW,
      RATE_LIMIT_WINDOW_SEC
    );

    if (!limitResult.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': limitResult.reset.toString(),
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
        },
      });
    }

    // Get user session and trip data concurrently
    const [{ data: userData, error: authError }, { data: trip, error: tripError }] =
      await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from(Tables.TRIPS)
          .select('*, destination:destinations(*), tags:trip_tags(tags(*))')
          .eq('id', tripId)
          .single(),
      ]);

    // --- Logging Auth --- //
    console.log(`[API /trips/${tripId}] Auth Check Result:`, {
      userId: userData?.user?.id,
      authError: authError ? authError.message : null,
    });
    // --- End Logging --- //

    const user = userData?.user;

    if (tripError) {
      console.error('Error fetching trip:', tripError);
      if (tripError.code === 'PGRST116') {
        return formatErrorResponse(new TripApiError('Trip not found', 404));
      }
      return formatErrorResponse(new TripApiError('Failed to fetch trip data', 500));
    }

    // --- Access Logic --- //
    let hasAccess = false;
    let userRole: (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES] | undefined = undefined;

    if (user) {
      // If user is logged in, check membership
      const { data: member, error: memberError } = await supabase
        .from(Tables.TRIP_MEMBERS)
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) {
        console.error(`[API /trips/${tripId}] Error fetching membership:`, memberError);
        // Decide if this should block access or just log
      }

      if (member) {
        console.log(`[API /trips/${tripId}] User ${user.id} is a member with role: ${member.role}`);
        hasAccess = true;
        userRole = member.role as (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];
      }
    } else {
      console.log(`[API /trips/${tripId}] No authenticated user found.`);
    }

    // If not logged in or not a member, check if trip is public
    if (!hasAccess && trip.privacy_setting === DB_ENUMS.TRIP_PRIVACY_SETTING.PUBLIC) {
      console.log(`[API /trips/${tripId}] Granting access via public setting.`);
      hasAccess = true;
      // userRole remains undefined for anonymous public access
    }
    // --- End Access Logic --- //

    if (!hasAccess) {
      // --- Logging Access Denied --- //
      console.log(
        `[API /trips/${tripId}] Access Denied. User: ${user?.id}, Role: ${userRole}, Public: ${trip.privacy_setting === DB_ENUMS.TRIP_PRIVACY_SETTING.PUBLIC}`
      );
      // --- End Logging --- //
      return formatErrorResponse(new TripApiError('Access denied', 403));
    }

    console.log(`[API /trips/${tripId}] Access Granted. User: ${user?.id}, Role: ${userRole}`);
    // Prepare response data
    const responseData = {
      ...trip,
      tags: trip.tags?.map((t: any) => t.tags) || [],
      userRole: userRole,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('GET /api/trips/[tripId] error:', error);
    return formatErrorResponse(error);
  }
}

// --- PATCH Handler ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { tripId } = await params;

  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_PATCH_${ip}_${tripId}`;
    const limitResult: RateLimitResult = await rateLimit.limit(
      limitKey,
      MAX_REQUESTS_PER_WINDOW,
      RATE_LIMIT_WINDOW_SEC
    );

    if (!limitResult.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': limitResult.reset.toString(),
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
        },
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new TripApiError('Unauthorized', 401));
    }

    // Check access using the helper function
    const access = await checkTripAccess(supabase, user.id, tripId, [
      DB_ENUMS.TRIP_ROLES.ADMIN,
      DB_ENUMS.TRIP_ROLES.EDITOR,
    ]);

    if (!access.hasAccess) {
      return formatErrorResponse(new TripApiError('Permission denied to update trip', 403));
    }

    const body = await request.json();
    const validation = updateTripSchema.safeParse(body);

    if (!validation.success) {
      console.warn('Update trip validation failed:', validation.error.flatten());
      return formatErrorResponse(
        new TripApiError('Invalid input', 400, validation.error.flatten())
      );
    }

    const updateData = validation.data;

    // Additional logic for tags if needed...

    const { data: updatedTrip, error: updateError } = await supabase
      .from(Tables.TRIPS)
      .update(updateData)
      .eq('id', tripId)
      .select('*, destination:destinations(*), tags:trip_tags(tags(*))')
      .single();

    if (updateError) {
      console.error('Error updating trip:', updateError);
      return formatErrorResponse(new TripApiError('Failed to update trip', 500));
    }

    // Prepare response data
    const responseData = {
      ...updatedTrip,
      tags: updatedTrip.tags?.map((t: any) => t.tags) || [], // Flatten tags
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('PATCH /api/trips/[tripId] error:', error);
    return formatErrorResponse(error);
  }
}

// --- DELETE Handler ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { tripId } = await params;

  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_DELETE_${ip}_${tripId}`;
    const limitResult: RateLimitResult = await rateLimit.limit(
      limitKey,
      MAX_REQUESTS_PER_WINDOW,
      RATE_LIMIT_WINDOW_SEC
    );

    if (!limitResult.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': limitResult.reset.toString(),
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
        },
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return formatErrorResponse(new TripApiError('Unauthorized', 401));
    }

    // Check access using the helper function
    const access = await checkTripAccess(supabase, user.id, tripId, [DB_ENUMS.TRIP_ROLES.ADMIN]);

    if (!access.hasAccess) {
      return formatErrorResponse(new TripApiError('Permission denied to delete trip', 403));
    }

    // Add logic to delete related data (members, items, etc.) first if needed

    const { error: deleteError } = await supabase.from(Tables.TRIPS).delete().eq('id', tripId);

    if (deleteError) {
      console.error('Error deleting trip:', deleteError);
      return formatErrorResponse(new TripApiError('Failed to delete trip', 500));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/trips/[tripId] error:', error);
    return formatErrorResponse(error);
  }
}
