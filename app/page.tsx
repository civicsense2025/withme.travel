
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

export default async function Home() {
  // Check if user is logged in on the server
  const sessionResult = await getServerSession(); // Get the raw result first

  // Safely check if session exists
  if (sessionResult?.data?.user) {
    redirect('/dashboard');
  }

  return (
    <Container size="full">
      <HomePageToaster />
      <main className="flex min-h-screen flex-col w-full bg-white dark:bg-black overflow-x-hidden scroll-pt-16">
        <HeroSection />

        {/* Trending Destinations */}
        <section className="py-12 w-full mb-24">
          <div className="flex flex-col items-center mb-12 px-6 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-center break-words text-balance w-full">
              Trending destinations
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-xl mb-12">
              Discover popular places loved by our community
            </p>
            <Button variant="outline" className="rounded-full text-base py-6 px-8 w-full mb-4" asChild>
              <Link href="/destinations">View All Destinations</Link>
            </Button>
          </div>
          <div className="w-full px-4 mb-12 md:px-8 lg:px-12">
            <TrendingDestinations />
          </div>
        </section>

        {/* Features Section - Apple-inspired clean design */}
        <section className="py-32 w-full bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center px-6 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-center break-words text-balance w-full">
              Planning that actually works
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-32 mx-auto max-w-2xl tracking-tight">
            Travel with friends without the chaos.
            </p>

            {/* Features with cleaner, more spacious layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="map">🗣️</span>
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4">Decide together</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                Vote on places, build itineraries, and make group decisions that stick—no more endless chats.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="shield">📍</span>
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4">Ideas to adventures</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                Find spots everyone will love, then transform inspiration into perfectly flowing schedules.

                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg text-5xl">
                  <span role="img" aria-label="calendar">📅</span>
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-4">Stay in sync</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                Share updates, connect calendars, and ensure no one misses that sunset boat tour you've all been waiting for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Sleek, minimalist design */}
        <section className="py-40 w-full bg-gradient-to-br from-blue-400/10 to-teal-400/10 relative overflow-hidden">
          <HeroEmojiExplosion />
          
          <div className="text-center px-6 md:px-10 max-w-3xl mx-auto relative z-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-center break-words text-balance w-full">
              From group chat chaos to perfect itinerary in minutes.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 mx-auto tracking-tight">
              Join WithMe and create a trip your friends will talk about for years. It's simple, collaborative, and actually fun.
            </p>
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
        </section>
      </main>
    </Container>
  );
}
