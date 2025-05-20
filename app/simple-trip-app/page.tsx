'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  created_at: string;
}

// Guest token cookie name
const GUEST_TOKEN_COOKIE = 'guest_token';

export default function SimpleTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTrips() {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const isAuthenticated = !userError && userData?.user;

        // Check for guest token
        const guestToken = Cookies.get(GUEST_TOKEN_COOKIE);

        // Set guest status
        setIsGuest(!isAuthenticated && !!guestToken);

        if (!isAuthenticated && !guestToken) {
          // If neither authenticated nor a guest, show empty state
          setTrips([]);
          return;
        }

        let tripsData: Trip[] = [];

        if (isAuthenticated) {
          // Fetch trips for authenticated user
          const { data, error: tripsError } = await supabase
            .from('trips')
            .select('id, name, description, start_date, end_date, cover_image_url, created_at')
            .order('created_at', { ascending: false });

          if (tripsError) {
            throw new Error('Failed to fetch trips');
          }

          tripsData = data || [];
        } else if (guestToken) {
          // Fetch trips for guest using the API
          const response = await fetch(`/api/trips/guest-trips?token=${guestToken}`);

          if (!response.ok) {
            throw new Error('Failed to fetch guest trips');
          }

          const data = await response.json();
          tripsData = data.trips || [];
        }

        setTrips(tripsData);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching trips');
        console.error('Error fetching trips:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (supabase) {
      fetchTrips();
    }
  }, [supabase]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isGuest ? 'My Guest Trips' : 'My Trips'}</h1>
        <Link
          href={isGuest ? '/simple-trip-app/create?guest=true' : '/simple-trip-app/create'}
         >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Trip
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : trips.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-md">
          <h2 className="text-xl font-semibold mb-2">No trips found</h2>
          <p className="text-muted-foreground mb-4">
            {isGuest
              ? "You don't have any guest trips yet. Create your first trip to get started!"
              : "You don't have any trips yet. Create your first trip to get started!"}
          </p>
          <Link
            href={isGuest ? '/simple-trip-app/create?guest=true' : '/simple-trip-app/create'}
           >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Trip
            </Button>
          </Link>

          {isGuest && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Want to keep your trips forever?</p>
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  Create an Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{trip.name}</CardTitle>
                <CardDescription>
                  {trip.start_date && trip.end_date
                    ? `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`
                    : 'No dates set'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {trip.description || 'No description'}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/simple-trip-app/${trip.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Trip
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {isGuest && trips.length > 0 && (
        <div className="mt-8 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium mb-2">You're currently using a guest account.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create an account to save your trips permanently and unlock all features.
          </p>
          <Link href="/signup">
            <Button variant="default" size="sm">
              Create an Account
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
