'use client';

/**
 * Trip Details Component
 * 
 * Responsible for fetching and displaying trip details using the useTrips hook
 */

// ============================================================================
// IMPORTS
// ============================================================================

// External dependencies
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Internal modules
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  MapPin, 
  Share,
  Trash, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';

// Features and hooks
import { useTrips, Trip } from '@/lib/hooks/use-trips';
import { formatDateRange } from '@/utils/lib-utils';

// ============================================================================
// TYPES
// ============================================================================

interface TripDetailsProps {
  canEdit?: boolean;
}

// Extend the Trip interface with the properties we need
interface ExtendedTrip extends Trip {
  description?: string | null;
}

// Define custom error type with message property
interface ApiError {
  message: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * LoadingSkeleton component for trip details
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      
      <Skeleton className="h-[300px] w-full rounded-xl" />
      
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  );
}

/**
 * ErrorDisplay component for trip details
 */
function ErrorDisplay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * TripActions component for trip detail actions
 */
function TripActions({ trip, canEdit }: { trip: ExtendedTrip; canEdit?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const { removeTrip } = useTrips();
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    const result = await removeTrip(trip.id);
    
    if (result.success) {
      toast({
        title: 'Trip deleted',
        description: 'Your trip has been permanently deleted.'
      });
      router.push('/trips');
    } else {
      const errorMessage = typeof result.error === 'object' && result.error !== null 
        ? (result.error as { message?: string }).message || 'An error occurred while deleting the trip'
        : 'An error occurred while deleting the trip';
        
      toast({
        title: 'Error deleting trip',
        description: errorMessage,
        variant: 'destructive'
      });
      setIsDeleting(false);
    }
  };
  
  const handleShare = () => {
    const url = `${window.location.origin}/trips/${trip.id}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: trip.name,
        text: `Check out my trip: ${trip.name}`,
        url
      }).catch(err => {
        console.error('Error sharing trip:', err);
        fallbackShare();
      });
    } else {
      fallbackShare();
    }
    
    function fallbackShare() {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: 'Link copied!',
          description: 'Trip link copied to clipboard'
        });
      }).catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: 'Could not copy link',
          description: 'Please copy it manually: ' + url,
          variant: 'destructive'
        });
      });
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {canEdit && (
        <>
          <Button asChild size="sm" variant="outline">
            <Link href={`/trips/${trip.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Trip
            </Link>
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        </>
      )}
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
}

/**
 * TripHeader component for trip details
 */
function TripHeader({ trip }: { trip: ExtendedTrip }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Link
          href="/trips"
          className="flex items-center hover:text-primary transition-colors"
         >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to trips
        </Link>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
      <div className="flex flex-wrap gap-4 mt-2">
        {trip.destination_name && (
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{trip.destination_name}</span>
          </div>
        )}
        
        {(trip.start_date || trip.end_date) && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDateRange(trip.start_date || '', trip.end_date || '')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TripDetails component
 */
export default function TripDetails({ canEdit = false }: TripDetailsProps) {
  const params = useParams<{ tripId: string }>();
  const tripId = params?.tripId;
  const { fetchTripWithDetails } = useTrips();
  const [trip, setTrip] = useState<ExtendedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  
  const loadTripDetails = async () => {
    if (!tripId) {
      setError({ message: 'Trip ID is missing' });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const result = await fetchTripWithDetails(tripId);
    
    if (result.success) {
      setTrip(result.data as ExtendedTrip);
    } else {
      const errorMessage = typeof result.error === 'object' && result.error !== null
        ? (result.error as { message?: string }).message || 'Failed to load trip details'
        : 'Failed to load trip details';
        
      setError({ message: errorMessage });
    }
    
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (tripId) {
      loadTripDetails();
    }
  }, [tripId]);
  
  if (!tripId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Trip ID</AlertTitle>
          <AlertDescription>
            The trip ID is missing from the URL.
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/trips">Return to trips</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay 
          message={error.message || 'Failed to load trip details'} 
          onRetry={loadTripDetails} 
        />
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Trip not found</AlertTitle>
          <AlertDescription>
            The trip you're looking for doesn't exist or you don't have permission to view it.
            <div className="mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/trips">Return to trips</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Render the trip details when we have data
  return (
    <div className="container mx-auto px-4 py-8">
      <TripHeader trip={trip} />
      <TripActions trip={trip} canEdit={canEdit} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trip overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Trip Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {trip.description ? (
              <div className="prose dark:prose-invert max-w-none">
                <p>{trip.description}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No description provided.</p>
            )}
            
            {/* Additional trip details can be added here */}
          </CardContent>
        </Card>
        
        {/* Trip sidebar */}
        <div className="space-y-6">
          {/* Trip stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                </div>
                
                {/* Add more stats as needed */}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href={`/trips/${trip.id}/itinerary`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Itinerary
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href={`/trips/${trip.id}/members`}>
                    <Users className="mr-2 h-4 w-4" />
                    Members
                  </Link>
                </Button>
                {/* Add more quick links */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Trip tabs for different features */}
      <Tabs defaultValue="itinerary" className="mt-10">
        <TabsList className="mb-4">
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="itinerary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your trip itinerary will be displayed here. Click the button below to view the full itinerary.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/trips/${trip.id}/itinerary`}>
                    View Itinerary
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage trip members and permissions here.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/trips/${trip.id}/members`}>
                    Manage Members
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Plan your trip with collaborative tools like notes, tasks, and polls.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/trips/${trip.id}/planning`}>
                    Plan Trip
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 