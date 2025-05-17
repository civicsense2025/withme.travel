'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { PageHeader } from '@/components/layout/page-header';
import { TripCreationForm } from '@/components/trips';
import { PopularDestinationsCarousel } from '@/components/destinations/popular-destinations-carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnhancedCreateTripPage() {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;
  const stepNames = ['destination', 'details', 'confirmation'];

  // Handle destination selection from TripCreationForm component
  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
  };

  // Track created trip ID after successful creation
  const handleTripCreated = (tripId: string) => {
    setCreatedTripId(tripId);
    setCurrentStep(3); // Move to confirmation step
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
          {/* Left Column: Enhanced Trip Form */}
          <div className="lg:col-span-5">
            <TripCreationForm
              onDestinationSelect={handleDestinationSelect}
              onTripCreated={handleTripCreated}
            />
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
                    // This will be handled by the TripCreationForm component
                    // We just need to pass the destination name to keep the tracker updated
                    handleDestinationSelect(destination.city);
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
