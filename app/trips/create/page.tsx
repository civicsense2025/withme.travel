'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Container } from '@/components/container';
import { clientGuestUtils } from '@/utils/guest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CityChipsAutocompleteInput } from '@/components/cities/city-chips-autocomplete-input';
import { PopularDestinationsCarousel } from '@/components/destinations/popular-destinations-carousel';
import { PageHeader } from '@/components/layout/page-header';

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

export default function CreateTrip() {
  const router = useRouter();
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState(''); // Honeypot field
  const [trip, setTrip] = useState<Trip | null>(null);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3; // Total steps in trip creation process
  const stepNames = ['destination', 'details', 'confirmation'];

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

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    // Other existing code...
  };

  // Track created trip ID after successful creation
  const handleTripCreated = (tripId: string) => {
    setCreatedTripId(tripId);
    // Other existing code...
  };

  // Update step when moving to next part of the form
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // Wrapper to match the expected onChange signature
  const handleCitiesChange = (cities: City[]) => {
    setSelectedCities(cities);
  };

  return (
    <Container size="wide">
      <div className="py-10">
        <PageHeader
          title="Create a New Trip"
          description="Start planning your next adventure with friends and family."
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Trip Form */}
          <div className="lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form form={form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Honeypot field - hidden from users */}
                    <div className="hidden">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trip Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer in Europe" {...field} disabled={isLoading} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_range"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Trip Dates (optional)</FormLabel>
                          <DatePicker
                            date={field.value}
                            setDate={(newDate) => field.onChange(newDate)}
                            disabled={isLoading}
                          />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <CityChipsAutocompleteInput
                        selectedCities={selectedCities}
                        onChange={handleCitiesChange}
                        disabled={isLoading}
                        label="Destinations*"
                        placeholder="Search for places to visit..."
                        emptyMessage="Find places by searching or click on suggestions from the right"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/trips')}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading || selectedCities.length === 0}>
                        {isLoading ? 'Creating...' : 'Create Trip'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Inspiration Section */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Popular Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">
                    Browse popular destinations and click on any that interest you to add them to
                    your trip.
                  </p>
                </div>

                <PopularDestinationsCarousel
                  onSelect={(destination) => {
                    // Convert the destination format to match city format
                    const city: City = {
                      id: `temp-${Date.now()}`, // Temporary ID
                      name: destination.city,
                      country: destination.country,
                      emoji: destination.emoji,
                    };
                    handleDestinationSelect(city.name);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
