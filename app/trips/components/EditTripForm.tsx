"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants';
import { Trip } from '@/types/trip'; // Use the full Trip type
import { LocationSearch } from '@/components/location-search'; // Keep LocationSearch
import { TagInput } from '@/components/ui/tag-input';
import { Tag } from '@/types/tag'; // Assuming Tag type exists

// Zod schema for form validation (matching API)
const editTripFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  start_date: z.string().nullable().optional(), // Using string for date input
  end_date: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().nullable(), // Keep tags as array of strings
  // Use destination_id (string, nullable, optional) matching API
  destination_id: z.string().uuid().nullable().optional(), 
});

// Infer type from the updated schema
type EditTripFormValues = z.infer<typeof editTripFormSchema>;

// Update Trip type for props to include destination_id
interface EditTripFormProps {
  trip: Pick<Trip, 'id' | 'name' | 'start_date' | 'end_date' | 'tags' | 'destination_id'>;
  // Optional: Pass initial destination name for display in LocationSearch
  initialDestinationName?: string | null; 
}

export function EditTripForm({ trip, initialDestinationName }: EditTripFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Keep track of the selected destination name for display in LocationSearch
  const [selectedDestinationDisplay, setSelectedDestinationDisplay] = useState<string | undefined>(initialDestinationName ?? undefined);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    control, 
    formState: { errors }, 
    setValue,
    watch 
  } = useForm<EditTripFormValues>({
    resolver: zodResolver(editTripFormSchema),
    defaultValues: {
      name: trip.name || '',
      start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
      end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
      tags: trip.tags || [], 
      // Use destination_id from trip prop
      destination_id: trip.destination_id || null, 
    },
  });

  // Fetch existing tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(API_ROUTES.TAGS);
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const tagsData = await response.json();
        setExistingTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Optionally show a toast notification
        toast({
          title: 'Error',
          description: 'Could not load existing tags.',
          variant: 'destructive',
        });
      }
    };
    fetchTags();
  }, [toast]); // Add toast to dependency array

  // Reset form if trip data changes
  useEffect(() => {
    const defaultDestId = trip.destination_id || null;
    reset({
        name: trip.name || '',
        start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
        end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
        tags: trip.tags || [],
        destination_id: defaultDestId,
    });
    // Also reset the display name
    // We need a way to get the name from the ID here if initialDestinationName isn't passed
    // For now, rely on initialDestinationName or clear it if ID changes
    setSelectedDestinationDisplay(initialDestinationName ?? undefined);

  }, [trip, reset, initialDestinationName]);

  const onSubmit: SubmitHandler<EditTripFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // 1. Prepare payload for the main trip update (WITHOUT tags)
      const tripUpdatePayload = {
        name: data.name,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        destination_id: data.destination_id || null, 
      };

      // 2. Update the main trip details
      const tripResponse = await fetch(API_ROUTES.TRIP_DETAILS(trip.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripUpdatePayload),
      });

      if (!tripResponse.ok) {
        const errorData = await tripResponse.json().catch(() => ({}));
        console.error("API Error (Trip Update):", errorData);
        throw new Error(errorData.error || 'Failed to update trip details');
      }

      // 3. Prepare tags for syncing
      const submittedTagNames = data.tags || [];

      // 4. Call the new API endpoint to sync tags
      const tagsResponse = await fetch(API_ROUTES.TRIP_TAGS(trip.id), { // Using the new constant
        method: 'PUT', // Use PUT to replace the entire set of tags
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: submittedTagNames }), // Send tag names
      });

      if (!tagsResponse.ok) {
        const errorData = await tagsResponse.json().catch(() => ({}));
        console.error("API Error (Tag Sync):", errorData);
        // Don't throw here, main update succeeded, but notify user
        toast({
          title: 'Warning: Tags Not Updated',
          description: errorData.error || 'Failed to update trip tags. Please try again.',
          variant: 'destructive',
        });
      } else {
        // Only show full success if both trip and tags updated
        toast({
          title: 'Trip Updated',
          description: `Successfully updated ${data.name}.`,
        });
      }
      
      // Redirect back to the trip details page
      router.push(PAGE_ROUTES.TRIP_DETAILS(trip.id));
      router.refresh(); 

    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: 'Error Updating Trip',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Trip: {trip.name}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" {...register('end_date')} />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>

          {/* Single Destination Selector */}
          <div className="space-y-2">
            <Label htmlFor="destination_id">Primary Destination</Label>
             <Controller
                control={control}
                name="destination_id" // Control the destination_id field
                render={({ field }) => (
                  <LocationSearch
                    // Use a unique key based on the controlled value to force re-render 
                    // if the underlying ID changes programmatically (e.g., on reset)
                    key={field.value ?? 'no-dest'}
                    // Provide initial display value if available
                    initialValue={selectedDestinationDisplay}
                    onLocationSelect={(location) => {
                      field.onChange(location.id); // Update form with selected ID
                      setSelectedDestinationDisplay(`${location.city}, ${location.country}`); // Update display name
                    }}
                    // Add a way to clear the selection
                    onClear={() => {
                      field.onChange(null); // Set form value to null
                      setSelectedDestinationDisplay(undefined); // Clear display name
                    }}
                    placeholder="Search for the main destination..."
                  />
                )}
              />
            {errors.destination_id && <p className="text-sm text-destructive">{errors.destination_id.message}</p>}
          </div>

          {/* Tag Input */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput
                  existingTags={existingTags} // Pass existing tags
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Add tags (e.g. adventure, beach)"
                />
              )}
            />
            {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
          </div>

          {/* Add fields for other editable properties like description, vibe etc. */}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Trip'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 