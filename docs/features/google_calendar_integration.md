
# Revised Google Calendar Export Implementation Plan

After reviewing the feedback, I'll outline a more comprehensive implementation plan addressing security, timezone handling, error management, and scalability concerns.

## Core Components

1. **Authentication Layer**: Permission verification middleware
2. **API Route Handlers**: Secure export endpoints with proper validation
3. **Calendar Service**: Enhanced Google Calendar integration with OAuth support
4. **iCalendar Generator**: Full-featured iCal generation with timezone support
5. **UI Component**: User-friendly export dialog with feedback mechanisms
6. **Testing Suite**: Comprehensive test coverage


## Core Dependencies & Integration Plan

### Dependencies

1. **NPM Packages**:
   - `date-fns-tz`: For timezone-aware date formatting
   - `uuid`: For generating unique identifiers
   - `zod`: For type-safe validation
   - `sanitize-html`: For content sanitization

2. **Internal Dependencies**:
   - `@/utils/supabase/ssr-client`: For Supabase route handler client
   - `@/utils/constants/database`: For database tables and fields constants
   - `@/utils/constants/status`: For status enums like ITEM_STATUS
   - `@/components/ui`: For UI components like Button, Dialog from shadcn/ui

### Files to Create or Modify

1. **API Routes**:
   - `app/api/trips/[tripId]/export-calendar/route.ts` (update)
   - `app/api/trips/[tripId]/export-calendar/download/route.ts` (create)
   - `app/api/trips/[tripId]/export-calendar/multi-event-helper/route.ts` (create)

2. **Utilities**:
   - `utils/middleware/trip-access.ts` (create)
   - `utils/calendar/calendar-service.ts` (create)
   - `utils/validation/calendar-validation.ts` (create)
   - `utils/sanitize.ts` (create)
   - `utils/logging.ts` (create)

3. **UI Components**:
   - `components/export-calendar-dialog.tsx` (update)

4. **Tests**:
   - `__tests__/utils/calendar/calendar-service.test.ts` (create)
   - `__tests__/api/trips/export-calendar.test.ts` (create)
   - `__tests__/components/export-calendar-dialog.test.tsx` (create)

### Implementation Phases

1. **Phase 1: Core Infrastructure**
   - Create middleware for trip access verification
   - Implement logging utility
   - Create sanitize utility
   - Write basic test scaffold

2. **Phase 2: Calendar Service Implementation**
   - Create calendar-service.ts with Google Calendar URL generation
   - Implement iCalendar content generation with timezone support
   - Develop validation utilities
   - Write tests for these modules

3. **Phase 3: API Endpoints**
   - Update main export-calendar endpoint
   - Create download endpoint
   - Implement multi-event helper page
   - Test API endpoints

4. **Phase 4: UI Component**
   - Enhance ExportCalendarDialog component
   - Add format selection, details options
   - Improve error handling and user feedback
   - Test UI component

5. **Phase 5: Integration Testing**
   - Test full flow from UI to API
   - Test with various trip sizes and content types
   - Verify different export formats
   - Test error scenarios

### Typescript Safety Measures

1. **Type Definitions**:
   - Define clear interfaces for all data structures
   - Use zod for runtime validation that maintains TypeScript types
   - Avoid type assertions except where necessary

2. **Error Handling**:
   - Create typed error classes
   - Use discriminated union types for response states
   - Handle all error paths explicitly

3. **API Type Safety**:
   - Use Next.js 15's TypeScript patterns for route handlers
   - Always await dynamic params
   - Use NextResponse with explicit types

4. **Testing**:
   - Include TypeScript checking in tests
   - Test edge cases and error scenarios
   - Verify type correctness in tests

This revised implementation plan addresses all the concerns from the feedback while maintaining TypeScript safety and following Next.js best practices.


## Implementation Steps

### 1. Authentication & Authorization Middleware

```typescript
// utils/middleware/trip-access.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/ssr-client';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { TripRole } from '@/utils/constants/database';

export async function verifyTripAccess(
  request: NextRequest,
  tripId: string,
  requiredRoles: TripRole[] = []
): Promise<{ 
  authorized: boolean; 
  session?: any; 
  role?: string;
  error?: string;
  status?: number;
}> {
  const supabase = createRouteHandlerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { 
      authorized: false, 
      error: 'Authentication required', 
      status: 401 
    };
  }
  
  // Verify trip access
  const { data: membership, error } = await supabase
    .from(TABLES.TRIP_MEMBERS)
    .select(FIELDS.TRIP_MEMBERS.ROLE)
    .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(FIELDS.TRIP_MEMBERS.USER_ID, session.user.id)
    .single();
  
  if (error || !membership) {
    return { 
      authorized: false, 
      session,
      error: 'Access denied to this trip', 
      status: 403 
    };
  }
  
  // Check required roles if specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
    return { 
      authorized: false, 
      session,
      role: membership.role,
      error: 'Insufficient permissions', 
      status: 403 
    };
  }
  
  return { 
    authorized: true, 
    session,
    role: membership.role
  };
}
```

### 2. Enhanced Route Handler with Authorization

```typescript
// app/api/trips/[tripId]/export-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/ssr-client';
import { TABLES, FIELDS, ENUMS } from '@/utils/constants/database';
import { verifyTripAccess } from '@/utils/middleware/trip-access';
import { generateGoogleCalendarUrl, generateICalContent } from '@/utils/calendar/calendar-service';
import { validateItineraryData } from '@/utils/validation/calendar-validation';
import { logger } from '@/utils/logging';

// Custom error types
class ValidationError extends Error {
  constructor(public details: any, message: string = 'Validation error') {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message: string = 'Database error') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    const { tripId } = await params;
    
    // Verify auth and access
    const accessCheck = await verifyTripAccess(request, tripId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error }, 
        { status: accessCheck.status }
      );
    }
    
    // Get user's timezone preference or default to UTC
    const { searchParams } = new URL(request.url);
    const userTimezone = searchParams.get('timezone') || 'UTC';
    
    // Extract export format and options from request
    const { format = 'google-url', includeDetails = true } = await request.json().catch(() => ({}));
    
    const supabase = createRouteHandlerClient();
    
    // Fetch trip data with proper error handling
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        destination_id,
        privacy_setting,
        ${TABLES.ITINERARY_ITEMS}(
          id,
          title,
          description,
          location,
          start_time,
          end_time,
          status,
          category,
          all_day
        )
      `)
      .eq(FIELDS.TRIPS.ID, tripId)
      .single();
    
    if (tripError) {
      logger.error('Database error fetching trip:', { tripId, error: tripError });
      throw new DatabaseError('Failed to retrieve trip data');
    }
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    // Validate and sanitize the trip data for calendar export
    const { 
      validatedTrip, 
      validatedItems, 
      errors 
    } = validateItineraryData(trip, includeDetails);
    
    if (errors.length > 0) {
      throw new ValidationError(errors, 'Invalid itinerary data');
    }
    
    // Rate limiting check (simplified version - implement a proper solution)
    // This would be better implemented as middleware
    const userIdentifier = accessCheck.session.user.id;
    const rateLimitExceeded = await checkRateLimit(userIdentifier);
    if (rateLimitExceeded) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }
    
    // Create response based on requested format
    if (format === 'google-url') {
      // Generate Google Calendar URL
      const calendarUrl = generateGoogleCalendarUrl(
        validatedTrip, 
        validatedItems,
        userTimezone
      );
      
      logger.info('Generated Google Calendar URL', { 
        tripId, 
        userId: accessCheck.session.user.id,
        itemCount: validatedItems.length
      });
      
      return NextResponse.json({ 
        url: calendarUrl,
        itemCount: validatedItems.length
      });
    } else if (format === 'ical') {
      // Generate iCalendar content
      const icalContent = generateICalContent(
        validatedTrip,
        validatedItems,
        userTimezone
      );
      
      // If request wants the content directly (for testing or clients handling the file)
      if (searchParams.get('content') === 'true') {
        return NextResponse.json({ 
          content: icalContent,
          itemCount: validatedItems.length
        });
      }
      
      // Otherwise return a download URL
      return NextResponse.json({ 
        downloadUrl: `/api/trips/${tripId}/export-calendar/download?format=ical&timezone=${encodeURIComponent(userTimezone)}`,
        itemCount: validatedItems.length
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported export format' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    // Categorized error handling
    if (error instanceof ValidationError) {
      logger.warn('Validation error in calendar export:', { 
        error: error.message,
        details: error.details
      });
      
      return NextResponse.json({ 
        error: 'Invalid itinerary data',
        details: error.details 
      }, { status: 400 });
    } 
    
    if (error instanceof DatabaseError) {
      logger.error('Database error in calendar export:', { error });
      
      return NextResponse.json({ 
        error: 'Unable to retrieve trip data',
      }, { status: 500 });
    }
    
    // General error case
    logger.error('Unexpected error in calendar export:', { error });
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simple rate limiting function (would use Redis/Upstash in production)
async function checkRateLimit(userIdentifier: string): Promise<boolean> {
  // Implement proper rate limiting here
  // For now, just return false (no limit exceeded)
  return false;
}
```

### 3. Download Endpoint with Improved iCal Support

```typescript
// app/api/trips/[tripId]/export-calendar/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/ssr-client';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { verifyTripAccess } from '@/utils/middleware/trip-access';
import { generateICalContent } from '@/utils/calendar/calendar-service';
import { validateItineraryData } from '@/utils/validation/calendar-validation';
import { logger } from '@/utils/logging';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<Response> {
  try {
    const { tripId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const userTimezone = searchParams.get('timezone') || 'UTC';
    
    if (format !== 'ical') {
      return NextResponse.json(
        { error: 'Unsupported format' },
        { status: 400 }
      );
    }
    
    // Verify auth and access
    const accessCheck = await verifyTripAccess(request, tripId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error }, 
        { status: accessCheck.status }
      );
    }
    
    const supabase = createRouteHandlerClient();
    
    // Fetch trip data
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        destination_id,
        privacy_setting,
        ${TABLES.ITINERARY_ITEMS}(
          id,
          title,
          description,
          location,
          start_time,
          end_time,
          status,
          category,
          all_day
        )
      `)
      .eq(FIELDS.TRIPS.ID, tripId)
      .single();
    
    if (tripError || !trip) {
      logger.error('Failed to fetch trip data:', { tripId, error: tripError });
      return NextResponse.json(
        { error: 'Failed to fetch trip data' },
        { status: 500 }
      );
    }
    
    // Validate and sanitize data
    const { validatedTrip, validatedItems, errors } = validateItineraryData(trip, true);
    
    if (errors.length > 0) {
      logger.warn('Validation errors in calendar export:', { errors });
      return NextResponse.json(
        { error: 'Invalid trip data', details: errors },
        { status: 400 }
      );
    }
    
    // Generate iCalendar content
    const icalContent = generateICalContent(validatedTrip, validatedItems, userTimezone);
    
    // Return as downloadable file
    logger.info('Serving iCal file download', { tripId, userId: accessCheck.session.user.id });
    
    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="trip-${validatedTrip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${tripId}.ics"`,
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    logger.error('Error generating iCal file:', { error });
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    );
  }
}
```

### 4. Validation Utilities with Proper Error Reporting

```typescript
// utils/validation/calendar-validation.ts
import { z } from 'zod';
import { sanitizeHtml } from '@/utils/sanitize';
import { ENUMS } from '@/utils/constants/database';

// Define schemas for validation
const ItineraryItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title cannot be empty").max(200),
  description: z.string().nullable().optional().transform(val => val || ''),
  location: z.string().nullable().optional().transform(val => val || ''),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  status: z.string(),
  category: z.string().optional(),
  all_day: z.boolean().optional().default(false)
});

const TripSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Trip name cannot be empty").max(100),
  description: z.string().nullable().optional().transform(val => val || ''),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  privacy_setting: z.string().optional(),
  itinerary_items: z.array(ItineraryItemSchema).optional().default([])
});

export function validateItineraryData(
  tripData: unknown,
  includeDetails: boolean = true
): { 
  validatedTrip: any; 
  validatedItems: any[]; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Parse with Zod
  const tripResult = TripSchema.safeParse(tripData);
  
  if (!tripResult.success) {
    // Format zod errors into readable messages
    tripResult.error.errors.forEach(err => {
      errors.push(`${err.path.join('.')}: ${err.message}`);
    });
    
    return {
      validatedTrip: {},
      validatedItems: [],
      errors
    };
  }
  
  const trip = tripResult.data;
  
  // Filter and sanitize itinerary items
  const validItems = (trip.itinerary_items || [])
    .filter(item => (
      // Only include confirmed or in-progress items
      item.status === ENUMS.ITEM_STATUS.CONFIRMED || 
      item.status === ENUMS.ITEM_STATUS.IN_PROGRESS
    ))
    .map(item => {
      // Sanitize descriptions and other text content if including details
      if (includeDetails) {
        return {
          ...item,
          title: sanitizeText(item.title),
          description: item.description ? sanitizeText(item.description) : '',
          location: item.location ? sanitizeText(item.location) : ''
        };
      } else {
        // If not including details, provide minimal information
        return {
          ...item,
          title: sanitizeText(item.title),
          description: '',
          location: item.location ? sanitizeText(item.location) : ''
        };
      }
    });
  
  // Validate dates
  validItems.forEach(item => {
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time);
      const end = new Date(item.end_time);
      
      if (isNaN(start.getTime())) {
        errors.push(`Invalid start time for item '${item.title}'`);
      }
      
      if (isNaN(end.getTime())) {
        errors.push(`Invalid end time for item '${item.title}'`);
      }
      
      if (start > end) {
        errors.push(`End time is before start time for item '${item.title}'`);
      }
    }
  });
  
  // Validate trip dates
  if (trip.start_date && trip.end_date) {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    
    if (isNaN(start.getTime())) {
      errors.push('Invalid trip start date');
    }
    
    if (isNaN(end.getTime())) {
      errors.push('Invalid trip end date');
    }
    
    if (start > end) {
      errors.push('Trip end date is before start date');
    }
  }
  
  // Sanitize trip data
  const sanitizedTrip = {
    ...trip,
    name: sanitizeText(trip.name),
    description: includeDetails && trip.description ? sanitizeText(trip.description) : ''
  };
  
  return {
    validatedTrip: sanitizedTrip,
    validatedItems: validItems,
    errors
  };
}

// Helper function to sanitize text content
function sanitizeText(text: string): string {
  // Remove HTML tags and sanitize
  const sanitized = sanitizeHtml(text, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}
  });
  
  // Further clean up special characters that might cause issues in calendar entries
  return sanitized
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control characters
    .trim();
}
```

### 5. Calendar Service with Timezone Support

```typescript
// utils/calendar/calendar-service.ts
import { v4 as uuidv4 } from 'uuid';
import { formatInTimeZone } from 'date-fns-tz';
import { logger } from '@/utils/logging';

interface ValidatedTrip {
  id: string;
  name: string;
  description: string;
  start_date?: string | null;
  end_date?: string | null;
}

interface ValidatedItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean;
}

/**
 * Generates a Google Calendar URL for adding events
 * Handles URL length limitations by chunking for large trips
 */
export function generateGoogleCalendarUrl(
  trip: ValidatedTrip,
  items: ValidatedItem[],
  timezone: string = 'UTC'
): string {
  // Check if we need to chunk (Google URL has ~2000 char limit)
  if (items.length > 5) {
    logger.info('Trip has many items, generating download link instead of URL', { 
      itemCount: items.length 
    });
    
    // For large trips, return a link to the download endpoint instead
    return `/api/trips/${trip.id}/export-calendar/download?format=ical&timezone=${encodeURIComponent(timezone)}`;
  }
  
  // For 0-1 items, use single event format
  if (items.length <= 1) {
    const event = items.length === 1 ? items[0] : {
      title: trip.name,
      description: trip.description,
      location: '',
      start_time: trip.start_date,
      end_time: trip.end_date,
      all_day: true
    };
    
    const startDate = event.start_time || trip.start_date;
    const endDate = event.end_time || event.start_time || trip.end_date;
    
    // Handle case where no dates are available
    if (!startDate) {
      logger.warn('No dates available for calendar event', { tripId: trip.id });
      return generatePlaceholderEventUrl(trip.name);
    }
    
    // Format Google Calendar URL parameters
    const params = new URLSearchParams();
    params.append('action', 'TEMPLATE');
    params.append('text', event.title);
    
    if (event.description) {
      params.append('details', event.description);
    }
    
    if (event.location) {
      params.append('location', event.location);
    }
    
    // Format dates based on all-day status
    const dateFormat = event.all_day ? 
      formatGoogleAllDayDateRange(startDate, endDate) : 
      formatGoogleDateTimeRange(startDate, endDate, timezone);
      
    params.append('dates', dateFormat);
    
    // Optional: add timezone if not an all-day event
    if (!event.all_day) {
      params.append('ctz', timezone);
    }
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
  
  // For 2-5 items, create a URL with multiple events
  // This is a simplified approach - Google Calendar doesn't officially support
  // multiple events in a single URL, but we can construct a URL that opens
  // multiple addition dialogs in sequence
  
  // This is a fallback solution - the iCal file approach is more reliable
  // for multiple events
  
  logger.info('Generating multi-event helper URL', { 
    itemCount: items.length 
  });
  
  // Return a specialized URL that will help users add multiple events
  return `/api/trips/${trip.id}/export-calendar/multi-event-helper?count=${items.length}`;
}

/**
 * Generates iCalendar format content for a trip and its items
 * with proper timezone support
 */
export function generateICalContent(
  trip: ValidatedTrip,
  items: ValidatedItem[],
  timezone: string = 'UTC'
): string {
  let icalContent = 'BEGIN:VCALENDAR\r\n';
  icalContent += 'VERSION:2.0\r\n';
  icalContent += 'PRODID:-//withme.travel//Trip Calendar//EN\r\n';
  icalContent += 'CALSCALE:GREGORIAN\r\n';
  icalContent += 'METHOD:PUBLISH\r\n';
  
  // Add timezone information for non-UTC timezones
  if (timezone !== 'UTC') {
    icalContent += generateTimezoneComponent(timezone);
  }
  
  // If no items, add the trip itself as an event
  if (items.length === 0 && (trip.start_date || trip.end_date)) {
    icalContent += generateEventContent({
      id: trip.id,
      title: trip.name,
      description: trip.description,
      location: '',
      start_time: trip.start_date,
      end_time: trip.end_date,
      all_day: true
    }, trip, timezone);
  } else {
    // Add each itinerary item as an event
    items.forEach(item => {
      icalContent += generateEventContent(item, trip, timezone);
    });
  }
  
  icalContent += 'END:VCALENDAR';
  return icalContent;
}

/**
 * Generates the VEVENT component for a single itinerary item
 */
function generateEventContent(
  item: ValidatedItem,
  trip: ValidatedTrip,
  timezone: string
): string {
  let eventContent = 'BEGIN:VEVENT\r\n';
  
  // Generate a unique identifier
  eventContent += `UID:${uuidv4()}@withme.travel\r\n`;
  
  // Add creation timestamp
  eventContent += `DTSTAMP:${formatICalDate(new Date(), false, 'UTC')}\r\n`;
  
  // Add event summary (title)
  eventContent += `SUMMARY:${escapeICalField(item.title)}\r\n`;
  
  // Add description if available
  if (item.description) {
    eventContent += `DESCRIPTION:${escapeICalField(item.description)}\r\n`;
  }
  
  // Add location if available
  if (item.location) {
    eventContent += `LOCATION:${escapeICalField(item.location)}\r\n`;
  }
  
  // Determine start and end dates
  const startDate = item.start_time ? new Date(item.start_time) : 
                    trip.start_date ? new Date(trip.start_date) : new Date();
  
  let endDate;
  if (item.end_time) {
    endDate = new Date(item.end_time);
  } else if (item.start_time) {
    // Default to 1 hour duration if only start time is available
    endDate = new Date(new Date(item.start_time).getTime() + 3600000);
  } else if (trip.end_date) {
    endDate = new Date(trip.end_date);
  } else {
    // Default to 1 hour after start
    endDate = new Date(startDate.getTime() + 3600000);
  }
  
  // Handle all-day events differently
  const isAllDay = item.all_day === true;
  
  if (isAllDay) {
    // All-day events use DATE format without time component
    eventContent += `DTSTART;VALUE=DATE:${formatICalDate(startDate, true)}\r\n`;
    
    // For all-day events, the end date should be the day after (exclusive end)
    const exclusiveEndDate = new Date(endDate);
    exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
    eventContent += `DTEND;VALUE=DATE:${formatICalDate(exclusiveEndDate, true)}\r\n`;
  } else {
    // Regular events include time and timezone
    eventContent += `DTSTART;TZID=${timezone}:${formatICalDate(startDate, false, timezone)}\r\n`;
    eventContent += `DTEND;TZID=${timezone}:${formatICalDate(endDate, false, timezone)}\r\n`;
  }
  
  // Add trip name as the organizer
  eventContent += `ORGANIZER;CN=${escapeICalField(trip.name || 'WithMe Trip')}:mailto:noreply@withme.travel\r\n`;
  
  // Add URL to the trip
  eventContent += `URL:https://withme.travel/trips/${trip.id}\r\n`;
  
  eventContent += 'END:VEVENT\r\n';
  return eventContent;
}

/**
 * Format dates for iCalendar format
 */
function formatICalDate(
  date: Date, 
  isAllDay: boolean = false,
  timezone: string = 'UTC'
): string {
  if (isAllDay) {
    // All-day events use simple YYYYMMDD format
    return formatInTimeZone(date, timezone, 'yyyyMMdd');
  }
  
  // Regular events use YYYYMMDDTHHMMSS format
  return formatInTimeZone(date, timezone, "yyyyMMdd'T'HHmmss");
}

/**
 * Format date range for Google Calendar URL
 * For all-day events
 */
function formatGoogleAllDayDateRange(
  startDateStr: string | null | undefined,
  endDateStr: string | null | undefined
): string {
  // Default to today if no start date
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  
  // For all-day events, end date should be the same day if not provided
  let endDate = startDate;
  if (endDateStr) {
    endDate = new Date(endDateStr);
  }
  
  // Google Calendar format for all-day: YYYYMMDD/YYYYMMDD
  return `${formatInTimeZone(startDate, 'UTC', 'yyyyMMdd')}/${formatInTimeZone(endDate, 'UTC', 'yyyyMMdd')}`;
}

/**
 * Format date range for Google Calendar URL
 * For regular events with time
 */
function formatGoogleDateTimeRange(
  startDateStr: string | null | undefined,
  endDateStr: string | null | undefined,
  timezone: string
): string {
  // Default to now if no start date
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  
  // If no end date, default to 1 hour after start
  let endDate;
  if (endDateStr) {
    endDate = new Date(endDateStr);
  } else {
    endDate = new Date(startDate.getTime() + 3600000); // 1 hour later
  }
  
  // Google Calendar format: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
  return `${formatInTimeZone(startDate, timezone, "yyyyMMdd'T'HHmmss'Z'")}/${formatInTimeZone(endDate, timezone, "yyyyMMdd'T'HHmmss'Z'")}`;
}

/**
 * Generate VTIMEZONE component for iCalendar
 */
function generateTimezoneComponent(timezone: string): string {
  // This is a simplified placeholder
  // In a real implementation, you would need timezone data
  
  // For common timezones, you could include predefined VTIMEZONE blocks
  // or use a library that provides this data
  
  return `BEGIN:VTIMEZONE\r\nTZID:${timezone}\r\n...\r\nEND:VTIMEZONE\r\n`;
}

/**
 * Generate a placeholder event URL when no dates are available
 */
function generatePlaceholderEventUrl(tripName: string): string {
  // Create a placeholder event for today
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const params = new URLSearchParams();
  params.append('action', 'TEMPLATE');
  params.append('text', tripName);
  params.append('dates', `${formatInTimeZone(today, 'UTC', 'yyyyMMdd')}/${formatInTimeZone(tomorrow, 'UTC', 'yyyyMMdd')}`);
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Escape special characters in iCalendar field values
 */
function escapeICalField(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\\/g, '\\\\')    // Backslashes
    .replace(/;/g, '\\;')      // Semicolons
    .replace(/,/g, '\\,')      // Commas
    .replace(/\n/g, '\\n')     // Line breaks
    .replace(/\r/g, '')        // Remove carriage returns entirely
    .replace(/"/g, '\'')       // Replace double quotes with single quotes
    .replace(/</g, '&lt;')     // Replace HTML tags
    .replace(/>/g, '&gt;')
    .replace(/\[/g, '(')       // Replace brackets
    .replace(/\]/g, ')')
    .replace(/\{/g, '(')       // Replace braces
    .replace(/\}/g, ')');
}
```

### 6. Multi-Event Helper Endpoint

```typescript
// app/api/trips/[tripId]/export-calendar/multi-event-helper/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/ssr-client';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { verifyTripAccess } from '@/utils/middleware/trip-access';
import { logger } from '@/utils/logging';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<Response> {
  try {
    const { tripId } = await params;
    
    // Verify auth and access
    const accessCheck = await verifyTripAccess(request, tripId);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error }, 
        { status: accessCheck.status }
      );
    }
    
    // Generate a simple HTML page with directions and options for the user
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Add Trip to Google Calendar</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            .btn { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 10px; }
            .info { background: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Add Trip to Google Calendar</h1>
          
          <div class="info">
            <p>Your trip has multiple events. Choose one of these options:</p>
          </div>
          
          <h2>Option 1: Download Calendar File (Recommended)</h2>
          <p>Download an iCalendar file and import it into Google Calendar.</p>
          <a href="/api/trips/${tripId}/export-calendar/download?format=ical" class="btn">Download Calendar File</a>
          
          <h3>How to import:</h3>
          <ol>
            <li>Download the file using the button above</li>
            <li>Go to <a href="https://calendar.google.com/" target="_blank">Google Calendar</a></li>
            <li>On the left side, find "Other calendars" and click the "+" button</li>
            <li>Select "Import"</li>
            <li>Choose the downloaded file and select the calendar to add it to</li>
            <li>Click "Import"</li>
          </ol>
          
          <div class="warning">
            <p>Note: This page is a helper to guide you through the process. Google Calendar does not support adding multiple events through a direct URL.</p>
          </div>
          
          <script>
            // Optional: Add analytics or tracking here
          </script>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    logger.error('Error generating multi-event helper page:', { error });
    return NextResponse.json(
      { error: 'Failed to generate helper page' },
      { status: 500 }
    );
  }
}
```

### 7. Enhanced UI Component

```typescript
// components/export-calendar-dialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Loader2, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ExportCalendarDialogProps {
  tripId: string;
  tripName: string;
  itemCount: number;
}

export function ExportCalendarDialog({ 
  tripId, 
  tripName,
  itemCount = 0
}: ExportCalendarDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [exportFormat, setExportFormat] = useState<'google-url' | 'ical'>(
    itemCount > 5 ? 'ical' : 'google-url'
  );
  const { toast } = useToast();

  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${tripId}/export-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: exportFormat,
          includeDetails,
          timezone: userTimezone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        



```typescript
        throw new Error(errorData.error || 'Failed to export calendar');
      }

      const data = await response.json();

      if (exportFormat === 'google-url' && data.url) {
        // Open the Google Calendar URL in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: 'Calendar export initiated',
          description: `Your trip has been sent to Google Calendar (${data.itemCount || 0} items)`
        });
        
        setOpen(false);
      } else if (exportFormat === 'ical' && data.downloadUrl) {
        // For iCal format, navigate to the download URL
        window.location.href = data.downloadUrl;
        
        toast({
          title: 'Calendar file ready',
          description: 'Your calendar file is downloading'
        });
        
        // Don't close dialog immediately for downloads
        setTimeout(() => setOpen(false), 1000);
      } else if (data.itemCount === 0) {
        toast({
          title: 'No items to export',
          description: 'There are no confirmed activities in this trip to add to your calendar',
          variant: 'destructive'
        });
        
        setOpen(false);
      } else {
        // Fallback for unexpected response
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error exporting calendar:', error);
      setError(error instanceof Error ? error.message : 'Failed to export to calendar');
      
      toast({
        title: 'export failed',
        description: error instanceof Error ? error.message : 'there was an error exporting to google calendar',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          export to calendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>export to google calendar</DialogTitle>
          <DialogDescription>
            add your trip itinerary to your calendar so everyone can stay in sync
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p>
            this will create calendar events for all confirmed activities in your trip "{tripName}".
          </p>
          
          {/* Export options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">export options:</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-details" 
                checked={includeDetails} 
                onCheckedChange={(checked) => setIncludeDetails(checked === true)}
              />
              <label 
                htmlFor="include-details" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                include item descriptions and notes
              </label>
            </div>
            
            {itemCount > 5 && (
              <div className="mt-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>calendar file recommended</AlertTitle>
                  <AlertDescription>
                    this trip has {itemCount} items. downloading a calendar file is recommended for trips with many activities.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Format selection */}
            <div className="flex flex-col space-y-1.5 mt-2">
              <label htmlFor="format-select" className="text-sm font-medium">export format:</label>
              <select
                id="format-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'google-url' | 'ical')}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="google-url">google calendar (direct)</option>
                <option value="ical">calendar file (.ics)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {exportFormat === 'google-url' 
                  ? 'opens google calendar with your trip events'
                  : 'downloads a file you can import into any calendar app'}
              </p>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            cancel
          </Button>
          
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                exporting...
              </>
            ) : exportFormat === 'ical' ? (
              <>
                <Download className="mr-2 h-4 w-4" />
                download calendar file
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                export to google calendar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 8. Sanitize Utility

```typescript
// utils/sanitize.ts
import sanitizeHtmlLib from 'sanitize-html';

/**
 * Sanitizes HTML content to prevent XSS
 */
export function sanitizeHtml(content: string, options?: sanitizeHtmlLib.IOptions): string {
  const defaultOptions: sanitizeHtmlLib.IOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false
  };
  
  return sanitizeHtmlLib(content, options || defaultOptions);
}
```

### 9. Logging Utility

```typescript
// utils/logging.ts
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
} as const;

// Configure the minimum log level (can be set from env)
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Logger utility for consistent logging with contextual information
 */
export const logger = {
  debug(message: string, context?: Record<string, any>): void {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },
  
  info(message: string, context?: Record<string, any>): void {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, context || '');
    }
  },
  
  warn(message: string, context?: Record<string, any>): void {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  },
  
  error(message: string, context?: Record<string, any>): void {
    if (MIN_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, context || '');
      
      // In production, you might want to integrate with Sentry or similar
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        // Example Sentry integration
        // Sentry.captureException(new Error(message), { extra: context });
      }
    }
  }
};
```





### 10. Testing Strategy

Create dedicated test files for key components:

```typescript
// __tests__/utils/calendar/calendar-service.test.ts
import { generateGoogleCalendarUrl, generateICalContent } from '@/utils/calendar/calendar-service';

describe('Calendar Service', () => {
  describe('generateGoogleCalendarUrl', () => {
    const mockTrip = {
      id: '123',
      name: 'Test Trip',
      description: 'Trip description'
    };
    
    it('should generate URL for trip with no items', () => {
      const url = generateGoogleCalendarUrl(mockTrip, [], 'UTC');
      expect(url).toContain('calendar.google.com/calendar/render');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain(encodeURIComponent(mockTrip.name));
    });
    
    it('should generate URL for trip with one item', () => {
      const mockItem = {
        id: '456',
        title: 'Museum Visit',
        description: 'Visit the modern art museum',
        location: 'Modern Art Museum',
        start_time: '2025-06-01T10:00:00Z',
        end_time: '2025-06-01T12:00:00Z'
      };
      
      const url = generateGoogleCalendarUrl(mockTrip, [mockItem], 'UTC');
      expect(url).toContain('calendar.google.com/calendar/render');
      expect(url).toContain('action=TEMPLATE');
      expect(url).toContain(encodeURIComponent(mockItem.title));
      expect(url).toContain(encodeURIComponent(mockItem.location));
      expect(url).toContain('dates=');
    });
    
    it('should redirect to download for trips with many items', () => {
      const mockItems = Array(10).fill(null).map((_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        description: `Description ${i}`,
        location: `Location ${i}`,
        start_time: '2025-06-01T10:00:00Z',
        end_time: '2025-06-01T12:00:00Z'
      }));
      
      const url = generateGoogleCalendarUrl(mockTrip, mockItems, 'UTC');
      expect(url).toContain(`/api/trips/${mockTrip.id}/export-calendar/download`);
      expect(url).toContain('format=ical');
    });
    
    it('should handle special characters in titles and descriptions', () => {
      const mockItem = {
        id: '456',
        title: 'Museum & Art Visit',
        description: 'Visit the "modern" art museum',
        location: 'Modern Art Museum, Downtown',
        start_time: '2025-06-01T10:00:00Z',
        end_time: '2025-06-01T12:00:00Z'
      };
      
      const url = generateGoogleCalendarUrl(mockTrip, [mockItem], 'UTC');
      expect(url).toContain(encodeURIComponent(mockItem.title));
      expect(url).toContain(encodeURIComponent(mockItem.description));
      expect(url).toContain(encodeURIComponent(mockItem.location));
    });
  });
  
  describe('generateICalContent', () => {
    const mockTrip = {
      id: '123',
      name: 'Test Trip',
      description: 'Trip description',
      start_date: '2025-06-01T00:00:00Z',
      end_date: '2025-06-05T00:00:00Z'
    };
    
    it('should generate valid iCal format', () => {
      const ical = generateICalContent(mockTrip, [], 'UTC');
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('VERSION:2.0');
      expect(ical).toContain('END:VCALENDAR');
    });
    
    it('should include trip as event when no items', () => {
      const ical = generateICalContent(mockTrip, [], 'UTC');
      expect(ical).toContain('BEGIN:VEVENT');
      expect(ical).toContain(`SUMMARY:${mockTrip.name}`);
      expect(ical).toContain('END:VEVENT');
    });
    
    it('should include all valid items as events', () => {
      const mockItems = [
        {
          id: '456',
          title: 'Museum Visit',
          description: 'Visit the museum',
          location: 'Museum',
          start_time: '2025-06-01T10:00:00Z',
          end_time: '2025-06-01T12:00:00Z'
        },
        {
          id: '789',
          title: 'Dinner',
          description: 'Fancy dinner',
          location: 'Restaurant',
          start_time: '2025-06-01T19:00:00Z',
          end_time: '2025-06-01T21:00:00Z'
        }
      ];
      
      const ical = generateICalContent(mockTrip, mockItems, 'UTC');
      mockItems.forEach(item => {
        expect(ical).toContain(`SUMMARY:${item.title}`);
        expect(ical).toContain(`LOCATION:${item.location}`);
      });
      
      // Should contain 2 events
      const eventCount = (ical.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(2);
    });
    
    it('should handle all-day events properly', () => {
      const mockItem = {
        id: '456',
        title: 'Full day event',
        description: 'All day activity',
        location: 'Everywhere',
        start_time: '2025-06-01T00:00:00Z',
        end_time: '2025-06-01T23:59:59Z',
        all_day: true
      };
      
      const ical = generateICalContent(mockTrip, [mockItem], 'UTC');
      expect(ical).toContain('DTSTART;VALUE=DATE:');
      expect(ical).toContain('DTEND;VALUE=DATE:');
    });
    
    it('should properly escape special characters', () => {
      const mockItem = {
        id: '456',
        title: 'Event with; special, characters',
        description: 'Line 1\nLine 2',
        location: 'Place & Location',
        start_time: '2025-06-01T10:00:00Z',
        end_time: '2025-06-01T12:00:00Z'
      };
      
      const ical = generateICalContent(mockTrip, [mockItem], 'UTC');
      expect(ical).toContain('SUMMARY:Event with\\; special\\, characters');
      expect(ical).toContain('DESCRIPTION:Line 1\\nLine 2');
      expect(ical).toContain('LOCATION:Place & Location');
    });
  });
});
```

```typescript
// __tests__/api/trips/export-calendar.test.ts
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/trips/[tripId]/export-calendar/route';
import { verifyTripAccess } from '@/utils/middleware/trip-access';
import { validateItineraryData } from '@/utils/validation/calendar-validation';
import { generateGoogleCalendarUrl } from '@/utils/calendar/calendar-service';

// Mock dependencies
jest.mock('@/utils/middleware/trip-access');
jest.mock('@/utils/validation/calendar-validation');
jest.mock('@/utils/calendar/calendar-service');
jest.mock('@/utils/supabase/ssr-client');

describe('Export Calendar API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth middleware
    (verifyTripAccess as jest.Mock).mockResolvedValue({
      authorized: true,
      session: { user: { id: 'user-123' } }
    });
    
    // Mock validation
    (validateItineraryData as jest.Mock).mockReturnValue({
      validatedTrip: { id: 'trip-123', name: 'Test Trip' },
      validatedItems: [{ id: 'item-1', title: 'Test Item' }],
      errors: []
    });
    
    // Mock calendar URL generation
    (generateGoogleCalendarUrl as jest.Mock).mockReturnValue('https://calendar.google.com/test-url');
  });
  
  it('should return 401 when user is not authenticated', async () => {
    (verifyTripAccess as jest.Mock).mockResolvedValue({
      authorized: false,
      error: 'Authentication required',
      status: 401
    });
    
    const request = new NextRequest('https://withme.travel/api/trips/123/export-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const response = await POST(request, { params: Promise.resolve({ tripId: 'trip-123' }) });
    expect(response.status).toBe(401);
    
    const responseData = await response.json();
    expect(responseData.error).toBe('Authentication required');
  });
  
  it('should return 403 when user does not have access to the trip', async () => {
    (verifyTripAccess as jest.Mock).mockResolvedValue({
      authorized: false,
      error: 'Access denied to this trip',
      status: 403
    });
    
    const request = new NextRequest('https://withme.travel/api/trips/123/export-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const response = await POST(request, { params: Promise.resolve({ tripId: 'trip-123' }) });
    expect(response.status).toBe(403);
    
    const responseData = await response.json();
    expect(responseData.error).toBe('Access denied to this trip');
  });
  
  it('should return 400 when validation fails', async () => {
    (validateItineraryData as jest.Mock).mockReturnValue({
      validatedTrip: {},
      validatedItems: [],
      errors: ['Invalid date format']
    });
    
    const request = new NextRequest('https://withme.travel/api/trips/123/export-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const response = await POST(request, { params: Promise.resolve({ tripId: 'trip-123' }) });
    expect(response.status).toBe(400);
    
    const responseData = await response.json();
    expect(responseData.error).toBe('Invalid itinerary data');
    expect(responseData.details).toContain('Invalid date format');
  });
  
  it('should return Google Calendar URL for valid request', async () => {
    const request = new NextRequest('https://withme.travel/api/trips/123/export-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'google-url' })
    });
    
    const response = await POST(request, { params: Promise.resolve({ tripId: 'trip-123' }) });
    expect(response.status).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.url).toBe('https://calendar.google.com/test-url');
    expect(responseData.itemCount).toBe(1);
  });
  
  // Additional tests for iCal format, error handling, etc.
});
```