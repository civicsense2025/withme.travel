'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Globe2, Copy, AlertTriangle, Frown, PartyPopper } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { Container } from '@/components/container';

// Trip type definition (simplified for this page)
interface Trip {
  id: string;
  title: string;
  is_public?: boolean;
  // Add other fields as needed for display
}

function TripSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tripId = searchParams?.get('id');

  // Effect 1: Redirect if not logged in (after auth check)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/trips/create'); // Redirect to login if not authenticated
    }
  }, [user, authLoading, router]);

  // Effect 2: Fetch trip data if logged in and tripId exists
  useEffect(() => {
    // Only fetch if authentication is done, user exists, and tripId is present
    if (!authLoading && user && tripId) {
      setIsLoading(true);
      setError(null); // Reset error before fetching

      async function fetchTrip() {
        try {
          const response = await fetch(`/api/trips/${tripId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch trip (status ${response.status})`);
          }
          const data = await response.json();
          if (data.trip) {
            setTrip(data.trip);
          } else {
            throw new Error('Trip data not found in API response');
          }
        } catch (err: any) {
          console.error('Error fetching trip:', err);
          setError(err.message || 'Failed to load trip details');
          toast({
            title: 'Error Loading Trip',
            description: err.message || 'Could not load trip details.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
      fetchTrip();
    } else if (!tripId) {
      // Handle case where tripId is missing from URL
      setIsLoading(false);
      setError('No trip ID provided.');
    } else if (!authLoading && !user) {
      // Already handled by Effect 1, but set loading false if we somehow get here
      setIsLoading(false);
    }
  }, [user, authLoading, tripId, toast]);

  // Render Loading State
  if (authLoading || isLoading) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading your trip details...</p>
          </div>
        </Card>
      </Container>
    );
  }

  // Render Error State
  if (error) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <Frown className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-5xl leading-loose font-bold">Oops!</h1>
            <p className="text-center text-muted-foreground">
              We couldn't find your trip. Please try creating a new one.
            </p>
            <Button asChild>
              <Link href="/trips/create">Create New Trip</Link>
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // Render Success State (only if trip data is loaded)
  if (trip) {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-lg p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Icons.check className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-5xl leading-loose font-bold">Trip Created Successfully!</h1>
              <p className="mt-2 text-muted-foreground">
                Your trip "{trip.title}" has been created. You can now start planning your
                adventure!
              </p>
            </div>
            <div className="flex w-full flex-col gap-3">
              <Button asChild>
                <Link href={`/trips/${trip.id}`}>View Trip Details</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/trips">View All Trips</Link>
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  // Fallback if no trip data and no error (should ideally not be reached)
  return (
    <Container className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <Frown className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-5xl leading-loose font-bold">Oops!</h1>
          <p className="text-center text-muted-foreground">
            We couldn't find your trip. Please try creating a new one.
          </p>
          <Button asChild>
            <Link href="/trips/create">Create New Trip</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}

// Wrap with Suspense for searchParams
export default function TripSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 py-8">
          <div className="container max-w-2xl">Loading...</div>
        </div>
      }
    >
      <TripSuccessPageContent />
    </Suspense>
  );
}
