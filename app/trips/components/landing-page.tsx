'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlaneTakeoff, Globe, Users2, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';

// Sample witty headlines for the trips landing page
const wittyHeadlines = [
  "Create trips with friends. Without the endless group chats.",
  "Make travel planning as fun as the trip itself.",
  "Plan together, travel together, remember forever.",
  "Group travel planning that actually works.",
  "Where trip planning meets social collaboration.",
  "From dreaming to doing: collaborative trip planning made easy.",
];

/**
 * TripsLandingPage is the public landing for /trips when not logged in.
 * It showcases the value of trip planning and encourages signup.
 */
const TripsLandingPage: React.FC = () => {
  // Pick a witty headline on mount
  const [headline] = useState(() => wittyHeadlines[Math.floor(Math.random() * wittyHeadlines.length)]);

  return (
    <div className="container px-4 py-12 max-w-7xl mx-auto">
      {/* Hero section */}
      <section className="flex flex-col-reverse md:flex-row items-center mb-16 gap-8 md:gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {headline}
          </h1>
          <p className="text-xl text-muted-foreground">
            Plan, collaborate, and organize your trips with friends and family - all in one place.
            No more scattered group chats and spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/signup">
              <Button size="lg" className="rounded-full">
                Start Planning Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full">
                Log In
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="relative w-full aspect-video md:aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-black dark:border-zinc-800 bg-white dark:bg-black transform rotate-3 shadow-lg z-10">
              <Image 
                src="/images/trip-planner-preview.jpg" 
                alt="Trip planning interface preview" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-travel-purple/20 border border-travel-purple z-0"></div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Plan trips your way</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-2 border-black dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-black">
            <div className="h-12 w-12 rounded-full bg-travel-purple/20 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-travel-purple" />
            </div>
            <h3 className="text-xl font-bold mb-2">Collaborative Itineraries</h3>
            <p className="text-muted-foreground">
              Create day-by-day plans together. Add, vote, and finalize activities with your group.
            </p>
          </div>
          <div className="border-2 border-black dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-black">
            <div className="h-12 w-12 rounded-full bg-travel-purple/20 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-travel-purple" />
            </div>
            <h3 className="text-xl font-bold mb-2">Destination Insights</h3>
            <p className="text-muted-foreground">
              Access authentic travel guides and recommendations for your destination.
            </p>
          </div>
          <div className="border-2 border-black dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-black">
            <div className="h-12 w-12 rounded-full bg-travel-purple/20 flex items-center justify-center mb-4">
              <Users2 className="h-6 w-6 text-travel-purple" />
            </div>
            <h3 className="text-xl font-bold mb-2">Group Coordination</h3>
            <p className="text-muted-foreground">
              Manage trip members, budgets, and tasks. All synced in real-time with your group.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="text-center py-16 px-8 border-2 border-black dark:border-zinc-800 rounded-2xl bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to plan your next adventure?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of travelers who've simplified their group trip planning with withme.travel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="rounded-full">
                Create Your First Trip <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/destinations">
              <Button variant="outline" size="lg" className="rounded-full">
                Browse Destinations <Globe className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripsLandingPage; 