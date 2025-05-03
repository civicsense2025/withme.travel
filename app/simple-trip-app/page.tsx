'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function SimpleTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTrips() {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          throw new Error('You must be logged in to view your trips');
        }

        // Get user's trips
        const { data, error: tripsError } = await supabase
          .from('trips')
          .select('id, name, description, start_date, end_date, cover_image_url, created_at')
          .order('created_at', { ascending: false });

        if (tripsError) {
          throw new Error('Failed to fetch trips');
        }

        setTrips(data || []);
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
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link href="/simple-trip-app/create">
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
            You don't have any trips yet. Create your first trip to get started!
          </p>
          <Link href="/simple-trip-app/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Trip
            </Button>
          </Link>
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
    </div>
  );
} 