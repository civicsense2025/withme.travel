'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Container } from '@/components/container';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CityChipsAutocompleteInput } from '@/components/features/cities/city-chips-autocomplete-input';
import { PageHeader } from '@/components/layout/page-header';
import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
import { toast } from '@/hooks/use-toast';
import { mutate } from 'swr';
import LoadingOverlay from '@/components/shared/loading-overlay';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
  emoji?: string | null;
  iso2?: string | null;
  description?: string | null;
  [key: string]: any;
}

export default function CreateTrip() {
  const router = useRouter();
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState(''); // Honeypot field
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(false);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

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
        throw new Error('Please select at least one city');
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
  };

  const onSubmit = async (data: TripFormValues) => {
    setIsSubmitting(true);

    try {
      // Get formatted dates for API
      const formattedData = {
        ...data,
        start_date: data.date_range.from ? data.date_range.from.toISOString().split('T')[0] : null,
        end_date: data.date_range.to ? data.date_range.to.toISOString().split('T')[0] : null,
        // Add cities data
        cities: selectedCities.map((city) => ({
          city_id: city.id,
          name: city.name,
          country: city.country,
        })),
      };

      // Make the actual API call in the background
      const response = await fetch(API_ROUTES.TRIPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create trip');
      }

      const result = await response.json();
      setCreatedTripId(result.trip.id);

      // Show success toast
      toast({
        title: 'Trip created successfully!',
        description: 'Your new trip is ready to plan.',
      });

      // If guest, show banner - using proper auth check
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const isGuest = !session?.user;

      if (isGuest) {
        setShowGuestBanner(true);
      }

      // Redirect to the new trip page
      router.push(PAGE_ROUTES.TRIP_DETAILS(result.trip.id));

      // Invalidate trips cache to reflect the new trip
      mutate(API_ROUTES.TRIPS);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to create trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="wide">
      <div className="py-10 max-w-2xl mx-auto">
        <PageHeader
          title="Create a New Trip"
          description="Start planning your next adventure with friends and family."
          className="mb-8 text-center"
        />

        {/* Display error message if there is one */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Show guest banner if needed */}
        {showGuestBanner && (
          <Alert className="mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <AlertTitle>Trip created as guest</AlertTitle>
                <AlertDescription>
                  Sign up to save and access your trip from any device.
                </AlertDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setShowGuestBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form form={form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trip Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Summer in Europe"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trip Dates (optional)</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            placeholder="Pick a date range"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="cities" className="text-sm font-medium">
                      Destinations*
                    </Label>
                    <CityChipsAutocompleteInput
                      selectedCities={selectedCities}
                      onChange={handleCitiesChange}
                      disabled={isSubmitting}
                      placeholder="Find places by searching or click on suggestions from the right"
                    />
                  </div>

                  {/* Honeypot field - invisible to users but traps bots */}
                  <div className="hidden">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="text"
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isLoading}>
                      {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      {isSubmitting && <LoadingOverlay message="Creating your trip..." />}
    </Container>
  );
}
