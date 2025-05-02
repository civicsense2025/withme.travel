'use client';

import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trip } from '@/types/trip';
import { TagInput } from '@/components/ui/tag-input';
import { Tag } from '@/types/tag';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormDescription, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Database } from '@/types/supabase'; // Import Database type
import { Loader2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Camera } from 'lucide-react';

// Lazy load the MapboxGeocoderComponent
const MapboxGeocoderComponent = lazy(() => import('@/components/maps/mapbox-geocoder'));

// Define GeocoderResult locally as it's not exported
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any; // Keep context flexible
  [key: string]: any;
}

// Define privacy options for clarity
const privacyOptions = [
  { value: 'private', label: 'Private', description: 'Only invited members can see this trip.' },
  {
    value: 'shared_with_link',
    label: 'Shared with Link',
    description: 'Anyone with the link can view a simplified version.',
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can find and view a simplified version.',
  },
] as const; // Use const assertion for literal types

// Use literal union type directly
type PrivacySetting = 'private' | 'shared_with_link' | 'public';

// EditTripForm Zod schema
const editTripFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  tags: z.array(z.string()).optional().nullable(), // Keep schema as is
  destination_id: z.string().uuid('Please select a valid destination').nullable().optional(),
  cover_image_url: z.string().url('Must be a valid URL').nullable().optional(),
  privacy_setting: z.enum(['private', 'shared_with_link', 'public']), // Schema uses enum
});

// Infer type from the schema
type EditTripFormValues = z.infer<typeof editTripFormSchema>;

// Export the type
export type { EditTripFormValues };

// Update props interface to include onSave and onClose
interface EditTripFormProps {
  trip: Pick<
    Trip,
    'id' | 'name' | 'start_date' | 'end_date' | 'destination_id' | 'cover_image_url'
  > & {
    privacy_setting: PrivacySetting | null;
    tags?: string[];
  };
  initialDestinationName?: string | null;
  onSave: (data: EditTripFormValues & { destination_id?: string | null }) => void;
  onClose: () => void;
  onChangeCover?: () => void;
}

// Define formatError locally if not exported
function formatError(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return fallback;
}

// Define formatDateRange locally
function formatDateRange(startDate?: string | Date | null, endDate?: string | Date | null): string {
  if (!startDate && !endDate) return 'Dates not set';
  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;
  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) return `${startStr} - ${endStr}`;
  return 'Invalid date range';
}

export function EditTripForm({
  trip,
  initialDestinationName,
  onSave,
  onClose,
  onChangeCover,
}: EditTripFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUpDest, setIsLookingUpDest] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  // State for the Mapbox input display value
  const [destinationDisplay, setDestinationDisplay] = useState<string | undefined>(
    initialDestinationName ?? undefined
  );
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [destinationId, setDestinationId] = useState<string | null>(trip.destination_id || null); // Local state for destination ID

  const formMethods = useForm<EditTripFormValues>({
    resolver: zodResolver(editTripFormSchema),
    defaultValues: {
      name: trip.name || '',
      start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
      end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
      // Use trip.tags directly, default to empty array
      tags: trip.tags ?? [],
      cover_image_url: trip.cover_image_url || null,
      privacy_setting: trip.privacy_setting ?? 'private',
    },
  });

  // Destructure control and other methods needed outside FormProvider if any
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    register,
  } = formMethods;

  // Fetch existing tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(API_ROUTES.TAGS);
        if (!response.ok) throw new Error('Failed to fetch tags');
        const tagsData = await response.json();
        setExistingTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast({
          title: 'Error',
          description: 'Could not load existing tags.',
          variant: 'destructive',
        });
      }
    };
    fetchTags();
  }, [toast]);

  // Reset form if trip data changes
  useEffect(() => {
    reset({
      name: trip.name || '',
      start_date: trip.start_date ? trip.start_date.split('T')[0] : '',
      end_date: trip.end_date ? trip.end_date.split('T')[0] : '',
      tags: trip.tags ?? [],
      cover_image_url: trip.cover_image_url || null,
      privacy_setting: trip.privacy_setting ?? 'private',
    });
    // Reset display name based on prop
    setDestinationDisplay(initialDestinationName ?? undefined);
  }, [trip, reset, initialDestinationName]);

  // Modify onSubmit
  const onSubmit: SubmitHandler<EditTripFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Combine form data with the current destinationId state
      const saveData = {
        ...data,
        destination_id: destinationId,
      };
      console.log('Calling onSave with:', saveData);
      await onSave(saveData);
    } catch (error) {
      console.error('Error saving trip via onSave prop:', error);
      // No need for toast here, TripPageClient's handler will show it
    } finally {
      setIsLoading(false);
    }
  };

  // Define the core async logic separately
  const performDestinationLookup = async (result: GeocoderResult | null) => {
    setLookupError(null);
    if (!result || !result.id || !result.text || !result.geometry?.coordinates) {
      setValue('destination_id', null);
      setDestinationId(null);
      setDestinationDisplay(undefined);
      return;
    }
    setDestinationDisplay(result.place_name || result.text);
    setIsLookingUpDest(true);
    try {
      const payload = {
        mapbox_id: result.id,
        name: result.text,
        address: result.properties?.address || result.place_name,
        latitude: result.geometry.coordinates[1],
        longitude: result.geometry.coordinates[0],
        context: result.context || null,
      };
      // Use the literal string for the API route
      const response = await fetch('/api/destinations/lookup-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const destData = await response.json();
      if (!response.ok) {
        throw new Error(destData.error || 'Failed to lookup/create destination');
      }
      if (destData?.destination?.id) {
        setValue('destination_id', destData.destination.id);
        setDestinationId(destData.destination.id);
      } else {
        console.error('API response missing destination.id:', destData);
        throw new Error('Could not retrieve destination ID from API response.');
      }
    } catch (error: any) {
      console.error('Error looking up/creating destination:', error);
      setLookupError(error.message);
      setValue('destination_id', null);
      setDestinationId(null);
      setDestinationDisplay(undefined);
    } finally {
      setIsLookingUpDest(false);
    }
  };

  // Wrapper function matching the expected onResult type
  const handleGeocoderResultWrapper = (result: GeocoderResult | null) => {
    // Don't await here, just fire off the async logic
    performDestinationLookup(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Trip: {trip.name}</CardTitle>
      </CardHeader>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" {...register('start_date')} />
                {errors.start_date && (
                  <p className="text-sm text-destructive">{errors.start_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" {...register('end_date')} />
                {errors.end_date && (
                  <p className="text-sm text-destructive">{errors.end_date.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                {onChangeCover && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose(); // Close the edit form first
                      onChangeCover(); // Then open image selector dialog
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                )}
              </div>
              <Input
                id="cover_image_url"
                type="url"
                {...register('cover_image_url')}
                placeholder="https://..."
              />
              {errors.cover_image_url && (
                <p className="text-sm text-destructive">{errors.cover_image_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination-search">Primary Destination</Label>
              <Suspense fallback={<p>Loading MapboxGeocoderComponent...</p>}>
                <MapboxGeocoderComponent
                  onResult={handleGeocoderResultWrapper}
                  initialValue={destinationDisplay}
                  options={{ placeholder: 'Search city, address, or place...' }}
                />
              </Suspense>
              {isLookingUpDest && (
                <p className="text-sm text-muted-foreground">Looking up destination...</p>
              )}
              {lookupError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{lookupError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    {...field}
                    placeholder="Enter tags (e.g., Budget, Adventure)"
                    value={field.value || []}
                    onChange={(newTagTexts: string[]) => {
                      field.onChange(newTagTexts);
                    }}
                  />
                )}
              />
              {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
            </div>

            {/* --- Privacy Settings --- */}
            <FormField
              control={control}
              name="privacy_setting"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Trip Visibility</FormLabel>
                  <FormDescription>Control who can see your trip plan.</FormDescription>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {privacyOptions.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={option.value} />
                        </FormControl>
                        <FormLabel className="font-normal flex flex-col">
                          <span>{option.label}</span>
                          <FormDescription className="text-xs">
                            {option.description}
                          </FormDescription>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                  {errors.privacy_setting && (
                    <p className="text-sm text-destructive pt-1">
                      {errors.privacy_setting.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
