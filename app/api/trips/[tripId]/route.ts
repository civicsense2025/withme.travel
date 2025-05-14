import type { Database } from '@/types/database.types';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { type CookieOptions } from '@supabase/ssr';
import { API_ROUTES } from '@/utils/constants/routes';
import { z } from 'zod';
import { isBefore, parseISO, differenceInCalendarDays } from 'date-fns';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, type RateLimitResult } from '@/lib/rate-limit';
import { ApiError, formatErrorResponse } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES } from '@/utils/constants/tables';

// Define trip roles and privacy settings constants
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

const TRIP_PRIVACY_SETTING = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

// Determine if running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Constants and configuration for API handlers
 */
// Maximum number of requests allowed per time window
const MAX_REQUESTS_PER_WINDOW = 20;
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
      .nullable()
      .transform((value) => (value === null ? null : value?.toString())),
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

/**
 * Check if a user has access to a trip with optional role requirements
 * @param supabase Supabase client
 * @param userId User ID to check access for
 * @param tripId Trip ID to check access to
 * @param requiredRoles Optional array of roles that are allowed access
 * @returns Object with hasAccess boolean and optional role if access granted
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
  try {
    // Check if user is a member of this trip
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking trip membership:', membershipError);
      return { hasAccess: false };
    }

    // If user is a member with a specific role requirement
    if (membership && requiredRoles) {
      const role = membership.role as keyof typeof TRIP_ROLES;
      const hasRequiredRole = requiredRoles.includes(TRIP_ROLES[role]);
      return {
        hasAccess: hasRequiredRole,
        role: hasRequiredRole ? TRIP_ROLES[role] : undefined,
      };
    }

    // If user is a member with any role (no specific role requirement)
    if (membership) {
      const role = membership.role as keyof typeof TRIP_ROLES;
      return {
        hasAccess: true,
        role: TRIP_ROLES[role],
      };
    }

    // If not a member, check if user is the creator of the trip
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('created_by, privacy_setting')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip details:', tripError);
      return { hasAccess: false };
    }

    // If user is the creator, they have admin access
    if (trip.created_by === userId) {
      const adminRole = TRIP_ROLES.ADMIN;
      const hasRequiredRole = !requiredRoles || requiredRoles.includes(adminRole);
      return {
        hasAccess: hasRequiredRole,
        role: hasRequiredRole ? adminRole : undefined,
      };
    }

    // If trip is public, provide limited access
    if (trip.privacy_setting === TRIP_PRIVACY_SETTING.PUBLIC) {
      // For public trips, only allow viewer access
      const viewerRole = TRIP_ROLES.VIEWER;
      const hasViewerAccess = !requiredRoles || requiredRoles.includes(viewerRole);
      return {
        hasAccess: hasViewerAccess,
        role: hasViewerAccess ? viewerRole : undefined,
      };
    }

    // Default: no access
    return { hasAccess: false };
  } catch (error) {
    console.error('Error in checkTripAccess:', error);
    return { hasAccess: false };
  }
}

// Create a reusable async function for cookie handlers
async function createCookieHandlers() {
  const cookieStore = await cookies();
  return {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (e) {
        /* ignore */
      }
    },
    remove(name: string, options: CookieOptions) {
      try {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      } catch (e) {
        /* ignore */
      }
    },
  };
}

// Expose the createRouteHandlerClient as createApiRouteClient for code readability
async function createApiRouteClient() {
  return await createRouteHandlerClient();
}

/**
 * GET trip details with enhanced validation, rate limiting, and error handling
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const responseHeaders = new Headers({
    /* ... headers ... */
  });

  try {
    const supabase = await createApiRouteClient();

    // Rate limit check using the apply method correctly
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_GET_${ip}_${tripId}`;

    const response = await rateLimit.apply(request, limitKey, async () => {
      // Get user session and trip data concurrently
      const [{ data: userData, error: authError }, tripResponse] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from(TABLES.TRIPS)
          .select('*, destination:destinations(*), tags:trip_tags(tags(*))')
          .eq('id', tripId),
      ]);

      // --- Logging Auth --- //
      console.log(`[API /trips/${tripId}] Auth Check Result:`, {
        userId: userData?.user?.id,
        authError: authError ? authError.message : null,
      });
      // --- End Logging --- //

      const user = userData?.user;

      // Handle the case where multiple or no trips were returned
      if (tripResponse.error) {
        console.error('Error fetching trip:', tripResponse.error);
        return formatErrorResponse(new TripApiError('Failed to fetch trip data', 500));
      }

      if (!tripResponse.data || tripResponse.data.length === 0) {
        console.error('Trip not found:', tripId);
        return formatErrorResponse(new TripApiError('Trip not found', 404));
      }

      // Take the first trip if multiple were returned
      const trip = tripResponse.data[0];
      console.log(`[API /trips/${tripId}] Found trip: ${trip.name}`);
      console.log(`[API /trips/${tripId}] Trip created_by: ${trip.created_by}`);

      // --- Access Logic --- //
      let hasAccess = false;
      let userRole: (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES] | undefined = undefined;

      if (user) {
        // If user is logged in, check membership
        const { data: member, error: memberError } = await supabase
          .from(TABLES.TRIP_MEMBERS)
          .select('role')
          .eq('trip_id', tripId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) {
          console.error(`[API /trips/${tripId}] Error fetching membership:`, memberError);
        }

        if (member) {
          console.log(
            `[API /trips/${tripId}] User ${user.id} is a member with role: ${member.role}`
          );
          hasAccess = true;
          userRole = member.role as (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];
        } else {
          console.log(
            `[API /trips/${tripId}] User ${user.id} is NOT a member. Checking creator...`
          );
        }

        // If not a member, check if user is the creator
        if (!hasAccess) {
          if (trip.created_by === user.id) {
            console.log(
              `[API /trips/${tripId}] User ${user.id} is the creator (created_by matches)`
            );
            hasAccess = true;
            userRole = TRIP_ROLES.ADMIN; // Creator gets admin role
          } else {
            console.log(`[API /trips/${tripId}] User ${user.id} is NOT the creator.`);
          }
        }
      } else {
        console.log(`[API /trips/${tripId}] No authenticated user found.`);
      }

      // If not logged in or not a member, check if trip is public
      if (!hasAccess && trip.privacy_setting === TRIP_PRIVACY_SETTING.PUBLIC) {
        console.log(`[API /trips/${tripId}] Granting access via public setting.`);
        hasAccess = true;
        // userRole remains undefined for anonymous public access
      }
      // --- End Access Logic --- //

      if (!hasAccess) {
        // --- Logging Access Denied --- //
        console.log(
          `[API /trips/${tripId}] Access Denied. User: ${user?.id}, Role: ${userRole}, Public: ${trip.privacy_setting === TRIP_PRIVACY_SETTING.PUBLIC}`
        );
        // --- End Logging --- //
        return formatErrorResponse(new TripApiError('Access denied', 403));
      }

      console.log(`[API /trips/${tripId}] Access Granted. User: ${user?.id}, Role: ${userRole}`);
      // Prepare response data
      const responseData = {
        trip: {
          ...trip,
          tags: trip.tags?.map((t: any) => t.tags) || [],
        },
        userRole: userRole,
      };

      return NextResponse.json(responseData);
    });

    return response;
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
  const { tripId } = await params;
  const responseHeaders = new Headers({
    /* ... headers ... */
  });

  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_PATCH_${ip}_${tripId}`;

    return await rateLimit.apply(request, limitKey, async () => {
      const supabase = await createApiRouteClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return formatErrorResponse(new TripApiError('Unauthorized', 401));
      }

      // Check access using the helper function
      const access = await checkTripAccess(supabase, user.id, tripId, [
        TRIP_ROLES.ADMIN,
        TRIP_ROLES.EDITOR,
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
        .from(TABLES.TRIPS)
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
    });
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
  const { tripId } = await params;
  const responseHeaders = new Headers({
    /* ... headers ... */
  });

  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitKey = `API_TRIP_DELETE_${ip}_${tripId}`;
    return await rateLimit.apply(
      request,
      limitKey,
      async () => {
        const supabase = await createApiRouteClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          return formatErrorResponse(new TripApiError('Unauthorized', 401));
        }

        // Check access using the helper function
        const access = await checkTripAccess(supabase, user.id, tripId, [TRIP_ROLES.ADMIN]);

        if (!access.hasAccess) {
          return formatErrorResponse(new TripApiError('Permission denied to delete trip', 403));
        }

        // Add logic to delete related data (members, items, etc.) first if needed

        const { error: deleteError } = await supabase.from(TABLES.TRIPS).delete().eq('id', tripId);

        if (deleteError) {
          console.error('Error deleting trip:', deleteError);
          return formatErrorResponse(new TripApiError('Failed to delete trip', 500));
        }

        return NextResponse.json({ success: true }, { status: 200 });
      },
      MAX_REQUESTS_PER_WINDOW,
      RATE_LIMIT_WINDOW_SEC
    );
  } catch (error: any) {
    console.error('DELETE /api/trips/[tripId] error:', error);
    return formatErrorResponse(error);
  }
}
