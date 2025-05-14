import { TrendingDestinations } from '@/components/trending-destinations';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import Link from 'next/link';
import { MapPin, CalendarCheck, ShieldCheck } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/utils/supabase/server';
import { HomePageToaster } from './components/homepage-toaster';
import HeroEmojiExplosion from '@/components/HeroEmojiExplosion';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Section } from '@/components/ui/section';
import { HeroBanner } from '@/components/ui/HeroBanner';
import React from 'react';
import { HomeResearchClient } from '@/components/HomeResearchClient';
import type { Survey } from '@/types/research';

// Mock survey data for demo
const mockSurvey: Survey = {
  id: 'demo-survey',
  type: 'survey',
  title: 'Demo User Research Survey',
  description: 'Help us improve withme.travel by answering a few quick questions!',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'q1',
      surveyId: 'demo-survey',
      text: 'What is your favorite feature so far?',
      type: 'text',
      required: true,
      order: 1,
    },
    {
      id: 'q2',
      surveyId: 'demo-survey',
      text: 'How likely are you to recommend us to a friend?',
      type: 'text',
      required: true,
      order: 2,
    },
  ],
};

export default async function Home() {
  let sessionResult = null;
  try {
    sessionResult = await getServerSession();
  } catch (err) {
    // If AuthSessionMissingError or any error, treat as not logged in
    sessionResult = null;
  }

  if (sessionResult?.data?.user) {
    redirect('/dashboard');
  }

  return (
    <Container size="full">
      <HomePageToaster />
      <main className="flex min-h-screen flex-col w-full bg-white dark:bg-black overflow-x-hidden scroll-pt-16">
        <HeroSection />

        {/* Trending Destinations */}
        <Section className="py-12 w-full mb-24">
          <div className="flex flex-col items-center mb-12 px-6 md:px-10 max-w-7xl mx-auto">
            <Heading
              level={2}
              size="large"
              align="center"
              className="mb-4 tracking-tight break-words text-balance w-full"
            >
              Trending destinations
            </Heading>
            <Text
              variant="body"
              weight="regular"
              className="text-muted-foreground text-center max-w-xl mb-12"
            >
              Discover popular places loved by our community
            </Text>
            <Button variant="outline" className="rounded-full text-base py-6 px-8 w-full mb-4">
              <Link href="/destinations">View All Destinations</Link>
            </Button>
          </div>
          <div className="w-full px-4 mb-12 md:px-8 lg:px-12">
            <TrendingDestinations />
          </div>
        </Section>

        {/* Features Section - Apple-inspired clean design */}
        <Section className="py-32 w-full bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center px-6 md:px-10 max-w-7xl mx-auto">
            <Heading
              level={2}
              size="large"
              align="center"
              className="mb-8 tracking-tight break-words text-balance w-full"
            >
              Planning that actually works
            </Heading>
            <Text
              variant="large"
              className="text-muted-foreground mb-32 mx-auto max-w-2xl tracking-tight"
            >
              Travel with friends without the chaos.
            </Text>

            {/* Features with cleaner, more spacious layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="map">
                    🗣️
                  </span>
                </div>
                <Heading level={3} size="default" className="mb-4">
                  Decide together
                </Heading>
                <Text variant="body" className="text-muted-foreground max-w-xs">
                  Vote on places, build itineraries, and make group decisions that stick—no more
                  endless chats.
                </Text>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="shield">
                    📍
                  </span>
                </div>
                <Heading level={3} size="default" className="mb-4">
                  Ideas to adventures
                </Heading>
                <Text variant="body" className="text-muted-foreground max-w-xs">
                  Find spots everyone will love, then transform inspiration into perfectly flowing
                  schedules.
                </Text>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="calendar">
                    📅
                  </span>
                </div>
                <Heading level={3} size="default" className="mb-4">
                  Stay in sync
                </Heading>
                <Text variant="body" className="text-muted-foreground max-w-xs">
                  Share updates, connect calendars, and ensure no one misses that sunset boat tour
                  you've all been waiting for.
                </Text>
              </div>
            </div>
          </div>
        </Section>

        {/* CTA Section - Sleek, minimalist design */}
        <Section className="py-40 w-full bg-gradient-to-br from-blue-400/10 to-teal-400/10 relative overflow-hidden">
          <HeroEmojiExplosion />

          <div className="text-center px-6 md:px-10 max-w-3xl mx-auto relative z-20">
            <Heading
              level={2}
              size="large"
              align="center"
              className="mb-8 tracking-tight break-words text-balance w-full"
            >
              From group chat chaos to perfect itinerary in minutes.
            </Heading>
            <Text variant="large" className="text-muted-foreground mb-16 mx-auto tracking-tight">
              Join WithMe and create a trip your friends will talk about for years. It's simple,
              collaborative, and actually fun.
            </Text>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-lg py-7 px-10 w-full mb-4 sm:w-auto"
                >
                  Sign up - it's free
                </Button>
              </Link>
              <Link href="/destinations">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full text-lg py-7 px-10 w-full mb-4 sm:w-auto border-2"
                >
                  Explore destinations
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        <HomeResearchClient mockSurvey={mockSurvey} />
      </main>
    </Container>
  );
}
