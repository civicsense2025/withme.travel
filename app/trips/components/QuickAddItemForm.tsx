'use client';
import { API_ROUTES } from '@/utils/constants/routes';


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { PlusCircle, ChevronDown, ChevronUp, Send, X, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

// UI Components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MapboxGeocoderComponent from '@/components/maps/mapbox-geocoder';

// Define formatError helper function locally since importing from lib/utils causes issues
const formatError = (error: unknown, fallback: string = 'An unexpected error occurred'): string => {
  if (!error) return fallback;

  // If it's a string, return it directly
  if (typeof error === 'string') return error;

  // If it's an Error object with a message
  if (error instanceof Error) return error.message;

  // If it's an object with a message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }

  // Default fallback
  return fallback;
};

// Define GeocoderResult locally or import if exported
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any;
  [key: string]: any;
}

// Form schema validation for quick add item
const quickAddSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['activity', 'accommodation', 'transportation', 'food'], {
    errorMap: () => ({ message: 'Please select a valid type' }),
  }),
  date: z.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
});

type QuickAddFormValues = z.infer<typeof quickAddSchema>;

interface QuickAddItemFormProps {
  tripId: string;
  proximityLat?: number | null;
  proximityLng?: number | null;
}

export function QuickAddItemForm({ tripId, proximityLat, proximityLng }: QuickAddItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State for form expansion and data
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(null);

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit: hookFormSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuickAddFormValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      title: '',
      type: undefined,
      notes: '',
    },
  });

  // Watch form values
  const title = watch('title');
  const type = watch('type');
  const date = watch('date');
  const startTime = watch('start_time');
  const endTime = watch('end_time');
  const notes = watch('notes');

  // --- Handler when a location is selected ---
  const handleGeocoderResult = (result: GeocoderResult | null) => {
    setSelectedPlace(result);
    if (result) {
      // Pre-fill title, expand form
      setValue('title', result.text || result.place_name || ''); // Pre-fill title
      setIsExpanded(true); // Expand the form
      setError(null);
    } else {
      // If cleared, optionally collapse or just clear data
      setIsExpanded(false); // Collapse if location is cleared
      resetFormState();
    }
  };

  // --- Reset Form State ---
  const resetFormState = () => {
    reset({
      title: '',
      type: undefined,
      date: undefined,
      start_time: '',
      end_time: '',
      notes: '',
    });
    setSelectedPlace(null); // Clear selected place too
    setIsLoading(false);
    setError(null);
    // We might need to clear the Mapbox input programmatically here if it doesnt clear itself
  };

  // --- Handle Form Submission ---
  const onSubmit = hookFormSubmit(async (data) => {
    if (!selectedPlace) {
      setError('Location is required.');
      toast({
        title: 'Missing Info',
        description: 'Please select a location.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const newItemData = {
      title: data.title || selectedPlace.text || 'Itinerary Item', // Fallback title
      type: data.type, // This is now validated by zod schema
      date: data.date ? format(data.date, 'yyyy-MM-dd') : null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      notes: data.notes || '',
      // Location details from selectedPlace state
      place_name: selectedPlace.text,
      address: selectedPlace.properties?.address || selectedPlace.place_name,
      mapbox_id: selectedPlace.id,
      latitude: selectedPlace.geometry?.coordinates[1],
      longitude: selectedPlace.geometry?.coordinates[0],
    };

    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add item.');
      }

      toast({ title: 'Item Added!', description: `${newItemData.title} added to itinerary.` });
      setIsExpanded(false); // Collapse form on success
      resetFormState();
      router.refresh(); // Refresh data on the page
    } catch (error: any) {
      console.error('Failed to add quick itinerary item:', error);
      const errMsg = formatError(error);
      setError(errMsg);
      toast({ title: 'Failed to Add', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  });

  // --- Prepare Mapbox Options ---
  const geocoderOptions: any = {
    placeholder: 'Search for a location...',
    marker: false, // Don't show a marker on the map (if map was present)
  };
  if (proximityLng != null && proximityLat != null) {
    // Check if coordinates are valid
    geocoderOptions.proximity = [proximityLng, proximityLat];
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        className="w-full h-auto py-6 border-dashed flex flex-col gap-2 mb-6"
        onClick={() => setIsExpanded(true)}
      >
        <PlusCircle className="h-5 w-5" />
        <span>Add location to your trip</span>
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="quick-add-location">Location</Label>
              <MapboxGeocoderComponent
                key={selectedPlace ? 'selected' : 'empty'} // Force re-render on selection/clear
                onResult={handleGeocoderResult}
                options={geocoderOptions}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-add-title">Title</Label>
              <Input
                id="quick-add-title"
                {...register('title')}
                placeholder="e.g., Dinner at Paella Place"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-add-type">Type</Label>
              <Select value={type} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger id="quick-add-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      {date ? format(date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => setValue('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quick-add-startTime">Start Time</Label>
                <Input id="quick-add-startTime" type="time" {...register('start_time')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quick-add-endTime">End Time</Label>
                <Input id="quick-add-endTime" type="time" {...register('end_time')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-add-notes">Notes</Label>
              <Textarea
                id="quick-add-notes"
                {...register('notes')}
                placeholder="Booking reference, details, etc."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  resetFormState();
                }}
                aria-label="Cancel"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? (
                  'Adding...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" /> Add Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
