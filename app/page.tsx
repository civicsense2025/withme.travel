// ============================================================================
// HOMEPAGE - WIDER SECTIONS IMPLEMENTATION
// ============================================================================

/**
 * Homepage for withme.travel
 * 
 * This page is the public landing page for unauthenticated users. It features:
 * - Hero section
 * - Trending destinations
 * - Features overview
 * - Call-to-action (CTA) section
 * - User research survey
 * 
 * This version increases the visual width of all major sections for a more immersive, modern look.
 * 
 * Architectural notes:
 * - Section containers use `max-w-screen-2xl` or full width for ultra-wide layouts.
 * - Padding is reduced or eliminated on outer containers to allow content to stretch.
 * - Inner content uses minimal constraints to create an airy, spacious feel.
 * - Responsive paddings are preserved for mobile.
 * - All changes are utility-class only; no breaking changes to component APIs.
 */

// ============================================================================
// IMPORTS
// ============================================================================

// External dependencies
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Internal modules
import { TrendingDestinations } from '@/components/trending-destinations';
import { HeroSection } from '@/components/hero-section';
import { Container } from '@/components/container';
import HeroEmojiExplosion from '@/components/HeroEmojiExplosion';
import { Text } from '@/components/ui/Text';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { FullBleedSection } from '@/components/ui/FullBleedSection';
import { HomePageToaster } from './components/homepage-toaster';

// Auth/session
import { getServerSession } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


// ============================================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================================

/**
 * Public homepage for withme.travel
 */
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
    <div>
      
      <Container size="full" className="w-full px-0">
        <HomePageToaster />
        <main className="flex min-h-screen flex-col w-full overflow-x-hidden scroll-pt-16">
          <HeroSection />

          {/* Trending Destinations - Full-Bleed */}
          <FullBleedSection paddingClassName="py-16">
            <div className="flex flex-col items-center mb-16 w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
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
                style={{ textAlign: 'center', maxWidth: '32rem', marginBottom: '3rem' }}
                className="text-muted-foreground"
              >
                Discover popular places loved by our community
              </Text>
            </div>
            <div className="w-full px-0 sm:px-4 mb-12">
              <TrendingDestinations />
              <div className="flex justify-center mt-12">
                <Button variant="outline" className="rounded-full text-base py-6 px-8">
                  <Link href="/destinations">View All Destinations</Link>
                </Button>
              </div>
            </div>
          </FullBleedSection>

          {/* Features Section - Full-Bleed */}
          <FullBleedSection backgroundClassName="bg-neutral-50 dark:bg-neutral-900" paddingClassName="py-40">
            <div className="text-center w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
              <Heading
                level={2}
                size="large"
                align="center"
                className="mb-24 tracking-tight break-words text-balance w-full"
              >
                Planning that actually works
              </Heading>
              <Text
                variant="large"
                style={{ marginBottom: '8rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: '48rem', textAlign: 'center' }}
                className="text-muted-foreground tracking-tight"
              >
                Travel with friends without the chaos.
              </Text>

              {/* Features with spacious layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 lg:gap-24 xl:gap-32 mt-32">
                <div className="flex flex-col items-center w-full">
                  <div className="bg-white dark:bg-black w-28 h-28 rounded-3xl flex items-center justify-center mb-10 shadow-lg text-6xl">
                    <span role="img" aria-label="map">
                      🗣️
                    </span>
                  </div>
                  <Heading level={3} size="default" className="mb-4">
                    Decide together
                  </Heading>
                  <Text 
                    variant="body"
                    style={{ maxWidth: '20rem' }}
                    className="text-muted-foreground"
                  >
                    Vote on places, build itineraries, and make group decisions that stick—no more
                    endless chats.
                  </Text>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white dark:bg-black w-28 h-28 rounded-3xl flex items-center justify-center mb-10 shadow-lg text-6xl">
                    <span role="img" aria-label="shield">
                      📍
                    </span>
                  </div>
                  <Heading level={3} size="default" className="mb-4">
                    Ideas to adventures
                  </Heading>
                  <Text 
                    variant="body"
                    style={{ maxWidth: '20rem' }}
                    className="text-muted-foreground"
                  >
                    Find spots everyone will love, then transform inspiration into perfectly flowing
                    schedules.
                  </Text>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white dark:bg-black w-28 h-28 rounded-3xl flex items-center justify-center mb-10 shadow-lg text-6xl">
                    <span role="img" aria-label="calendar">
                      📅
                    </span>
                  </div>
                  <Heading level={3} size="default" className="mb-4">
                    Stay in sync
                  </Heading>
                  <Text 
                    variant="body"
                    style={{ maxWidth: '20rem' }}
                    className="text-muted-foreground"
                  >
                    Share updates, connect calendars, and ensure no one misses that sunset boat tour
                    you've all been waiting for.
                  </Text>
                </div>
              </div>
            </div>
          </FullBleedSection>

        </main>
      </Container>
    </div>
  );
}
