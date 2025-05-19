/**
 * Homepage
 *
 * Main landing page for the application
 */

import React from 'react';
import { PopularDestinations } from '@/components/features/destinations/templates/PopularDestinations';
import { getPopularDestinations } from '@/lib/api/destinations';
import Link from 'next/link';

// Core UI components
// Import individual components from their respective files
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/Section';
import { Heading, Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/container';

/**
 * Homepage component displaying the main landing page
 */
export default async function HomePage() {
  // Try to get popular destinations
  let destinations;
  try {
    destinations = await getPopularDestinations(6);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    // Continue rendering page even if destinations can't be fetched
  }

  return (
    <main>
      {/* Hero section - kept from original */}
      <Section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Text as="h1" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Plan your next adventure together
            </Text>
            <Text className="text-xl text-muted-foreground mb-8">
              Create, collaborate, and enjoy seamless group travel planning with friends and family
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trips/new" passHref legacyBehavior>
                <Button variant="default" className="px-8 py-3">
                  Start planning
                </Button>
              </Link>
              <Link href="/destinations" passHref legacyBehavior>
                <Button variant="secondary" className="px-8 py-3">
                  Explore destinations
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Features section - kept from original */}
      <Section className="py-16 md:py-24 bg-muted/30">
        <Container>
          <div className="text-center mb-16">
            <Heading level={2} className="text-3xl font-bold tracking-tight mb-4">
              Why Choose withme.travel?
            </Heading>
            <Text className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes group travel planning simple, collaborative, and fun
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-background p-6 rounded-lg shadow-sm">
              <Heading level={3} className="text-xl font-semibold mb-2">Real-Time Collaboration</Heading>
              <Text className="text-muted-foreground">
                Plan together with friends in real-time, see who's online, and make decisions as a group.
              </Text>
            </Card>

            <Card className="bg-background p-6 rounded-lg shadow-sm">
              <Heading level={3} className="text-xl font-semibold mb-2">Smart Itineraries</Heading>
              <Text className="text-muted-foreground">
                Build detailed trip itineraries with activities, reservations, and travel details all in one place.
              </Text>
            </Card>

            <Card className="bg-background p-6 rounded-lg shadow-sm">
              <Heading level={3} className="text-xl font-semibold mb-2">Shared Expenses</Heading>
              <Text className="text-muted-foreground">
                Track group expenses, split costs fairly, and settle up easily with integrated expense management.
              </Text>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
