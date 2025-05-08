import { TrendingDestinations } from '@/components/trending-destinations';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';
import Link from 'next/link';
import { MapPin, CalendarCheck, ShieldCheck } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/utils/supabase/server';

// Mark this page as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is logged in on the server
  const sessionResult = await getServerSession(); // Get the raw result first

  // Safely check if session exists
  if (sessionResult?.data?.user) {
    redirect('/dashboard');
  }

  return (
    <Container size="full">
      <main className="flex min-h-screen flex-col w-full bg-white dark:bg-black overflow-hidden">
        <HeroSection />

        {/* Trending Destinations */}
        <section className="py-24 w-full">
          <div className="flex flex-col items-center mb-16 px-6 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-center">
              Trending Destinations
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-xl mb-12">
              Discover popular places loved by our community
            </p>
            <Button variant="outline" className="rounded-full text-base py-6 px-8" asChild>
              <Link href="/destinations">View All Destinations</Link>
            </Button>
          </div>
          <div className="w-full px-4 md:px-8 lg:px-12">
            <TrendingDestinations />
          </div>
        </section>

        {/* Features Section - Apple-inspired clean design */}
        <section className="py-32 w-full bg-neutral-50 dark:bg-neutral-900">
          <div className="text-center px-6 md:px-10 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
              Plan Together,{' '}
              <span className="text-travel-purple dark:text-travel-purple">Travel Better</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-32 mx-auto max-w-2xl">
              Everything you need to create amazing group trips without the headaches.
            </p>

            {/* Features with cleaner, more spacious layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <MapPin className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Find Cool Spots</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Discover and save places everyone will love. No more endless debates about where
                  to go.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <ShieldCheck className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Vote On Plans</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Everyone gets a say. Easily vote on activities, restaurants, and accommodations.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-black w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <CalendarCheck className="text-travel-purple h-12 w-12" />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">Build Your Itinerary</h3>
                <p className="text-lg text-muted-foreground max-w-xs">
                  Create the perfect schedule together. Sync with your calendar so you never miss a
                  thing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Sleek, minimalist design */}
        <section className="py-40 w-full bg-gradient-to-br from-blue-400/10 to-teal-400/10">
          <div className="text-center px-6 md:px-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
              Ready To Start Planning?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 mx-auto">
              Join withme.travel today and make your next group trip the best one yet.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-lg py-7 px-10 w-full sm:w-auto"
                >
                  Sign up - it's free
                </Button>
              </Link>
              <Link href="/destinations">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full text-lg py-7 px-10 w-full sm:w-auto border-2"
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
