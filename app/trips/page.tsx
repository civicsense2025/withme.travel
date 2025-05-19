import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/utils/supabase-server';
import { Metadata } from 'next';
import { getGuestToken } from '@/utils/guest';
import { HeroSection } from '@/components/features/trips/organisms/HeroSection';
import TripsClient from '@/app/trips/trips-client';
import { PageHeader } from '@/components/features/layout/organisms/PageHeader';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SharedPresenceSection } from '@/components/features/trips/organisms/SharedPresenceSection';
import { ExpenseMarketingSection } from '@/components/features/trips/organisms/ExpenseMarketingSection';
import { getServerSession } from '@/lib/auth/supabase';

// Force dynamic to ensure we get fresh data on each request
export const dynamic = 'force-dynamic';

// Instead of forcing dynamic rendering on every request, use ISR with a reasonable revalidation period
export const revalidate = 300; // Revalidate every 5 minutes

// We need to tell search engines to index this public landing page
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TripsPage() {
  const session = await getServerSession();
  
  if (session?.user) {
    return redirect('/trips/manage');
  }

  return (
    // Your existing landing page content
    <div>
      {/* Landing page content for signed-out users */}
      <h1>Welcome to WithMe Travel</h1>
      <p>Start planning your next adventure with friends and family</p>
      <Link href="/trips/new">
        <Button>Create a Trip</Button>
      </Link>
    </div>
  );
}

// Landing page component for non-authenticated users
function renderLandingPage() {
  return (
    <>
      <HeroSection />
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Component First on Mobile, Second on Desktop */}
          <div className="order-1 md:order-2">
            <SharedPresenceSection />
          </div>
          {/* Copy Second on Mobile, First on Desktop */}
          <div className="order-2 md:order-1 flex flex-col justify-center h-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plan together, in real time</h2>
            <p className="text-lg text-muted-foreground mb-6">
              See who's online, brainstorm ideas, and make decisions as a group. withme.travel
              brings everyone together—no more lost messages or missed updates.
            </p>
          </div>
        </div>
      </section>
      <ExpenseMarketingSection />
    </>
  );
}
// ============================================================================
// SIMPLIFIED TRIP HEADER COMPONENT
// ============================================================================

/**
 * Simplified header component for trip pages with basic navigation and actions
 */
export function SimplifiedTripHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/trips" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to trips</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trips/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New trip
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
