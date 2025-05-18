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
import { getTrip, updateTrip, deleteTrip } from '@/lib/api/trips';
import { getTripWithDetails, updateTripWithDetails } from '@/lib/api/trips';

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
  supabase: SupabaseClient,
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
 * GET /api/trips/[tripId]
 *
 * Returns details for a single trip.
 * Refactored to use centralized API module (lib/api/trips)
 */
export async function GET(
  request: NextRequest,
  context: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = await context.params;
  try {
    const result = await getTripWithDetails(tripId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    // TODO: Add tags, permissions, etc. to trip details
    return NextResponse.json({ trip: result.data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

/**
 * PATCH /api/trips/[tripId]
 *
 * Updates a trip's details.
 * Refactored to use centralized API module (lib/api/trips)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = await context.params;
  try {
    const body = await request.json();
    const result = await updateTripWithDetails(tripId, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    // TODO: Add support for updating tags, permissions, etc.
    return NextResponse.json({ trip: result.data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

/**
 * DELETE /api/trips/[tripId]
 *
 * Deletes a trip.
 * Refactored to use centralized API module (lib/api/trips)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = await context.params;
  try {
    const result = await deleteTrip(tripId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}

// --- legacy helper functions and advanced features remain, with TODOs to migrate to lib/api/trips ...