'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlaneLanding, Calendar, Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { CityChipsAutocompleteInput } from '@/components/cities/city-chips-autocomplete-input';
import { Badge } from '@/components/ui/badge';

// Simple schema for trip creation
const tripSchema = z.object({
  name: z.string().min(3, 'Trip name must be at least 3 characters'),
  date_range: z.object({
    from: z.date().nullable(),
    to: z.date().nullable(),
  }),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface City {
  id: string;
  name: string;
  country: string;
  admin_name?: string | null;
  continent?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapbox_id?: string;
  population?: number | null;
  timezone?: string;
  country_code?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
  is_destination?: boolean;
  emoji?: string;
  [key: string]: any;
}

interface TripCreationFormProps {
  onDestinationSelect?: (destination: string) => void;
  onTripCreated?: (tripId: string) => void;
  onCancel?: () => void;
  initialDestination?: City;
  mode?: 'light' | 'dark';
}

export function TripCreationForm({
  onDestinationSelect,
  onTripCreated,
  onCancel,
  initialDestination,
  mode = 'light',
}: TripCreationFormProps) {
  const router = useRouter();
  const [selectedCities, setSelectedCities] = useState<City[]>(
    initialDestination ? [initialDestination] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState(''); // Honeypot field

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      date_range: {
        from: null,
        to: null,
      },
    },
  });

  const handleSubmit = async (values: TripFormValues) => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!values.name?.trim()) {
        throw new Error('Trip name is required');
      }

      if (selectedCities.length === 0) {
        throw new Error('Please select at least one destination');
      }

      // Prepare trip dates
      const startDate = values.date_range.from;
      const endDate = values.date_range.to;

      // Create the trip
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          start_date: startDate ? startDate.toISOString() : null,
          end_date: endDate ? endDate.toISOString() : null,
          cities: selectedCities,
          website, // Honeypot field
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create trip');
      }

      const { trip } = await response.json();

      if (!trip?.id) {
        throw new Error('No trip ID returned from server');
      }

      // Notify parent component if needed
      if (onTripCreated) {
        onTripCreated(trip.id);
      }

      // Redirect to the new trip
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      setIsLoading(false);
    }
  };

  // Wrapper to match the expected onChange signature
  const handleCitiesChange = (cities: City[]) => {
    setSelectedCities(cities);
    if (cities.length > 0 && onDestinationSelect) {
      onDestinationSelect(cities[0].name);
    }
  };

  return (
    <Card variant="default" className={mode === 'dark' ? 'dark' : 'light'}>
      <CardHeader>
        <CardTitle>✈️ Let's Plan Your Trip</CardTitle>
        <CardDescription>
          Fill in the basics to get started, and we'll help you build your perfect itinerary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form form={form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Honeypot field - hidden from users */}
            <div className="hidden">
              <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <PlaneLanding className="h-4 w-4" />
                    <span>What are you calling this adventure?</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer in Europe, Girls Weekend, Family Reunion..."
                      {...field}
                      disabled={isLoading}
                      autoFocus
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>When are you traveling?</span>
              </FormLabel>
              <FormField
                control={form.control}
                name="date_range"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <DatePicker
                      date={field.value}
                      setDate={(newDate) => field.onChange(newDate)}
                      disabled={isLoading}
                      placeholder="Select dates (optional)"
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Where are you and your crew headed?</span>
              </FormLabel>
              <CityChipsAutocompleteInput
                selectedCities={selectedCities}
                onChange={handleCitiesChange}
                disabled={isLoading}
                label=""
                placeholder="Search for places to visit..."
                emptyMessage="Type to search for destinations or select from suggestions"
              />
            </div>

            {error && (
              <Badge variant="error" className="px-3 py-2 text-sm font-normal w-full justify-start">
                {error}
              </Badge>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end space-x-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.push('/trips'))}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading || selectedCities.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
