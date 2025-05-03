# API Routes, Server Components, and Client Components Guide

This guide explains how API Routes, Server Components, and Client Components work together in the withme.travel application, particularly concerning data fetching, authentication, and using Supabase.

## Overview

Next.js 15 (with the App Router) offers different ways to build your application:

1.  **API Routes:** Server-side endpoints typically used by Client Components to fetch or mutate data securely after the initial page load. They handle requests and responses like traditional API endpoints.
2.  **Server Components (RSC):** Rendered entirely on the server. They can directly access server-side resources (like databases or file systems) and perform data fetching _before_ sending the result to the client. They cannot use hooks like `useState` or `useEffect`.
3.  **Client Components:** Rendered initially on the server and then "hydrated" on the client, allowing them to use hooks, state, effects, and browser APIs. They often fetch data _after_ initial load, either via `useEffect` or by calling API Routes. Marked with the `'use client'` directive.

## Supabase Client Usage

We use `@supabase/ssr` which provides different functions to create Supabase clients tailored for each context:

- **`createRouteHandlerClient()` (from `@/utils/supabase/server.ts`):** **Use this in API Routes.** It handles cookies correctly for request/response cycles in API endpoints. _This function returns a Supabase client directly, do NOT `await` it._
- **`createServerComponentClient()` (from `@/utils/supabase/server.ts`):** **Use this in Server Components.** It handles read-only cookie access suitable for server-side rendering. _This function returns a client directly, do NOT `await` it._
- **`getServerSession()`:** Helper function to get the current user session in server components or API routes.
- **`getBrowserClient()` (from auth provider):** Used in Client Components for browser environments, without importing server-only dependencies.

**See:** [Authentication System Documentation](docs/authentication.md) for more details on the auth setup.

## API Routes (`app/api/...`)

API Routes are essential for actions triggered by the client after the page has loaded, such as form submissions, votes, or fetching dynamic data based on user interaction.

**Key Characteristics:**

- Run only on the server.
- Can securely access environment variables and interact with the database.
- Use `NextRequest` and `NextResponse` for handling requests and responses.
- **Use `createRouteHandlerClient()` directly without awaiting** to get a Supabase client instance.
- **Route parameters are direct objects, NOT Promises** - access them directly without `await`.

**Example: Authenticated API Route (`app/api/likes/route.ts`)**

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

export async function POST(request: NextRequest) {
  try {
    // 1. Get Supabase client for API routes (NO await needed)
    const supabase = createRouteHandlerClient();

    // 2. Check user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse request body
    const { destinationId } = await request.json();
    if (!destinationId) {
      return NextResponse.json({ error: 'Missing destinationId' }, { status: 400 });
    }

    // 4. Interact with database
    const { data, error } = await supabase
      .from(TABLES.LIKES) // Use constants
      .insert({ user_id: user.id, destination_id: destinationId })
      .select()
      .single();

    if (error) {
      console.error('Error liking destination:', error);
      // Consider using handleSupabaseError utility here
      return NextResponse.json({ error: 'Failed to like destination' }, { status: 500 });
    }

    // 5. Return successful response
    return NextResponse.json({ success: true, like: data }, { status: 201 });
  } catch (error: any) {
    console.error('API Likes Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

**Example: API Route with URL Parameters**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

// Notice params is a direct object, NOT a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  try {
    // Access params directly - NO await needed
    const { tripId } = params;

    // Create client - NO await needed
    const supabase = createRouteHandlerClient();

    // Get authentication status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch data
    const { data, error } = await supabase.from(TABLES.TRIPS).select('*').eq('id', tripId).single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Server Components (`app/.../page.tsx`, `app/.../layout.tsx`, etc.)

Server Components are the default in the App Router. They are ideal for fetching initial page data that doesn't require interactivity.

**Key Characteristics:**

- Run only on the server.
- Can directly fetch data using `await`.
- Cannot use Client Component hooks (`useState`, `useEffect`, etc.).
- Pass fetched data down to Client Components as props.
- **Use `createServerComponentClient()` directly without awaiting** for Supabase interactions.
- Dynamic route parameters are direct objects, NOT Promises, and should be accessed directly.

**Example: Fetching initial data (`app/trips/page.tsx`)**

```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import TripsClientPage from './trips-client'; // This is a Client Component
import { createServerComponentClient, getServerSession } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic'; // Ensure fresh data

export default async function TripsPage() {
  // 1. Get session directly
  const { data: { session } } = await getServerSession();

  // 2. Authentication check
  if (!session) {
    redirect('/login?redirectTo=/trips');
  }

  // 3. Get Supabase client for Server Components (NO await needed)
  const supabase = createServerComponentClient();

  // 4. Fetch initial data directly
  const { data: tripMembers } = await supabase
    .from('trip_members')
    .select(`
      role, joined_at,
      trip:trips (...) // Select related trip data
    `)
    .eq('user_id', session.user.id)
    .order('start_date', { foreignTable: 'trips', ascending: false });

  // 5. Pass data as props to the Client Component
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TripsClientPage initialTrips={tripMembers || []} userId={session.user.id} />
    </Suspense>
  );
}
```

**Example: Server Component with Dynamic Parameters**

```typescript
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient, getServerSession } from '@/utils/supabase/server';
import TripDetails from './trip-details-client';

export const dynamic = 'force-dynamic';

// Notice params is a direct object, NOT a Promise
export default async function TripPage({ params }: { params: { tripId: string } }) {
  // 1. Access params directly - NO await needed
  const { tripId } = params;

  // 2. Check authentication
  const { data: { session } } = await getServerSession();

  if (!session) {
    redirect(`/login?redirectTo=/trips/${tripId}`);
  }

  // 3. Get Supabase client (NO await needed)
  const supabase = createServerComponentClient();

  // 4. Fetch trip details
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error || !trip) {
    notFound();
  }

  // 5. Render with client component
  return (
    <Suspense fallback={<div>Loading trip details...</div>}>
      <TripDetails trip={trip} userId={session.user.id} />
    </Suspense>
  );
}
```

## Client Components (`'use client'`)

Client Components handle interactivity, state, and browser APIs.

**Key Characteristics:**

- Marked with `'use client'` directive at the top.
- Can use hooks (`useState`, `useEffect`, `useContext`, etc.).
- Cannot directly `await` server-side data fetching functions within the component body (must use `useEffect` or fetch from API routes).
- Receive initial data as props from Server Components.
- For Supabase interactions after initial load (e.g., in response to user actions), **use `getBrowserClient()`** (typically within hooks or event handlers).

**Example: Client Component using data and interacting (`./trips-client.tsx`)**

```typescript
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TripCard } from '@/components/trip-card';
import { getBrowserClient } from '@/utils/supabase/browser-client'; // Safe client import
import { useToast } from '@/components/ui/use-toast';

// Simplified props type
interface TripsClientPageProps {
  initialTrips: any[];
  userId: string;
}

export default function TripsClientPage({ initialTrips, userId }: TripsClientPageProps) {
  const [trips, setTrips] = useState(initialTrips); // Use initial data from Server Component
  const { toast } = useToast();

  // Example action: Delete a trip (would likely call an API route)
  const handleDeleteTrip = async (tripId: string) => {
    // Option 1: Call an API Route
    try {
      const response = await fetch(\`/api/trips/\${tripId}\`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setTrips(currentTrips => currentTrips.filter(t => t.id !== tripId));
      toast({ title: 'Trip deleted' });
    } catch (error) {
      toast({ title: 'Error deleting trip', variant: 'destructive' });
    }

    // Option 2: Direct interaction (less common for mutations from client)
    /*
    const supabase = getBrowserClient(); // Get client-side instance
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (error) throw error;
      setTrips(currentTrips => currentTrips.filter(t => t.id !== tripId));
      toast({ title: 'Trip deleted' });
    } catch (error) {
      toast({ title: 'Error deleting trip', variant: 'destructive' });
    }
    */
  };

  const sortedTrips = useMemo(() => {
    // Process/sort trips based on initialTrips
    return trips.sort(/* ... sorting logic ... */);
  }, [trips]);

  return (
    <div>
      {/* ... UI rendering using sortedTrips ... */}
      {sortedTrips.map((trip) => (
        <TripCard key={trip.id} trip={trip} onDelete={() => handleDeleteTrip(trip.id)} />
      ))}
    </div>
  );
}
```

## Summary & Best Practices

- **Initial Load:** Use Server Components to fetch data needed for the initial page render via `createServerComponentClient`. Pass this data as props to Client Components.
- **Client-Side Actions:** Use API Routes (with `createRouteHandlerClient`) for mutations (POST, PUT, DELETE) or data fetching triggered by user interaction within Client Components.
- **Client-Side State/Effects:** Use Client Components (`'use client'`) for interactivity, state management, and browser APIs. Use `getBrowserClient` if direct Supabase interaction is needed _after_ the initial load.
- **Authentication:** Check authentication in Server Components (`createServerComponentClient`) and API Routes (`createRouteHandlerClient`) using `getServerSession`. Redirect or return 401 errors as needed. Client components rely on the `AuthProvider` or session checks within API routes they call.
- **Consistency:** Always use the specific Supabase client creation function designed for the context (`createRouteHandlerClient`, `createServerComponentClient`, `getBrowserClient`). Do NOT await the server-side client creation functions.
- **Route Parameters:** Route parameters are direct objects, not Promises. Access them directly with destructuring, not with await.

By understanding these patterns, you can build efficient, secure, and interactive features in the Next.js App Router.
