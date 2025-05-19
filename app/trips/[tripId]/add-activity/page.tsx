'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitySuggestions } from '@/components/ActivitySuggestions';
import { ActivityIdea } from '@/utils/activity-generator';
import { TABLES } from '@/utils/constants/database';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ChevronLeft, Plus, Lightbulb, List, Map } from 'lucide-react';
import Link from 'next/link';

export default function AddActivityPage() {
  const params = useParams<{ tripId: string }>();
  const tripId = params?.tripId;
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToTrip, setIsAddingToTrip] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<ActivityIdea[]>([]);

  useEffect(() => {
    async function loadTrip() {
      if (!tripId) return;

      setIsLoading(true);

      try {
        const supabase = getBrowserClient();
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*, destination:destination_id(*)')
          .eq('id', tripId)
          .single();

        if (tripError) throw tripError;
        setTrip(tripData);
      } catch (error) {
        console.error('Error loading trip:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrip();
  }, [tripId]);

  async function handleAddActivitiesToTrip() {
    if (selectedActivities.length === 0 || !trip || !tripId) return;

    setIsAddingToTrip(true);

    try {
      const supabase = getBrowserClient();
      // Get the maximum position of existing items
      const { data: maxPositionData } = await supabase
        .from(TABLES.ITINERARY_ITEMS)
        .select('position')
        .eq('trip_id', tripId)
        .order('position', { ascending: false })
        .limit(1);

      const startPosition =
        maxPositionData && maxPositionData.length > 0 ? (maxPositionData[0].position || 0) + 1 : 0;

      // Map selected activities to itinerary items
      const itineraryItems = selectedActivities.map((activity, index) => ({
        trip_id: tripId,
        title: activity.title,
        description: activity.description,
        position: startPosition + index,
        category: activity.category,
        duration: activity.duration * 60, // Convert hours to minutes
        budget_category: activity.budgetCategory,
      }));

      // Modify the itineraryItems to match the expected schema
      const formattedItems = itineraryItems.map((item) => ({
        ...item,
        // Make sure category is one of the accepted string literals
        category: item.category as
          | 'Iconic Landmarks'
          | 'Local Secrets'
          | 'Cultural Experiences'
          | 'Outdoor Adventures'
          | 'Food & Drink',
        // Ensure all required properties are present and in the correct format
        title: item.title || 'New Activity', // Ensure title is present
      }));

      // Use the formatted items in the insert
      const { error } = await supabase.from('itinerary_items').insert(formattedItems);

      if (error) throw error;

      // Navigate back to the trip page
      router.push(`/trips/${tripId}/itinerary`);
    } catch (error) {
      console.error('Error adding activities to trip:', error);
      alert('Failed to add activities to trip. Please try again.');
    } finally {
      setIsAddingToTrip(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center py-12">
          <span className="animate-pulse">Loading trip details...</span>
        </div>
      </div>
    );
  }

  if (!trip || !tripId) {
    return (
      <div className="container py-8">
        <Card className="p-6 bg-red-50">
          <h2 className="text-lg font-medium mb-2 text-red-700">Trip Not Found</h2>
          <p className="text-red-600 mb-4">
            The trip you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/trips">Go to My Trips</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/trips/${tripId}`} legacyBehavior>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Add Activities</h1>
        </div>

        <Button
          onClick={handleAddActivitiesToTrip}
          disabled={selectedActivities.length === 0 || isAddingToTrip}
        >
          {isAddingToTrip ? (
            <>Processing...</>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add {selectedActivities.length}{' '}
              {selectedActivities.length === 1 ? 'Activity' : 'Activities'} to Trip
            </>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="suggestions">
              <Lightbulb className="mr-2 h-4 w-4" />
              Intelligent Suggestions
            </TabsTrigger>
            <TabsTrigger value="browse" disabled>
              <List className="mr-2 h-4 w-4" />
              Browse Activities
            </TabsTrigger>
            <TabsTrigger value="map" disabled>
              <Map className="mr-2 h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions">
            <ActivitySuggestions
              destinationId={trip.destination.id}
              tripId={tripId}
              onSelectActivities={setSelectedActivities}
            />
          </TabsContent>

          <TabsContent value="browse">
            <div className="py-12 text-center text-muted-foreground">
              Browse activities feature coming soon.
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="py-12 text-center text-muted-foreground">
              Map view feature coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
