import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, CalendarCheck, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SkeletonCard } from '@/components/skeleton-card';
import { TrendingDestinations } from '@/components/trending-destinations';
import type { TripRole } from '@/utils/constants/status';
import { DashboardProfile } from './components/dashboard-profile';
import { TripsList } from './components/trips-list';
import { getRecentTrips, getUserProfile } from './actions';
import { DashboardClientWrapper } from './components/dashboard-client-wrapper';
import TravelTracker from '@/components/TravelTracker';
import { getServerSession } from '@/utils/supabase/unified';

// Force dynamic rendering because we use cookies()
export const dynamic = 'force-dynamic';

// Trip type definition - simplified version of the one in trips/page.tsx
interface Trip {
  id: string;
  name: string;
  created_by: string;
  destination_id?: string;
  destination_name?: string;
  start_date?: string;
  end_date?: string;
  date_flexibility?: string;
  travelers_count?: number;
  vibe?: string;
  budget?: string;
  is_public: boolean;
  slug?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at?: string;

  // Fields added by the API
  title?: string;
  description?: string;
  cover_image?: string;
  members?: number;
  role: TripRole | null;
}

// Main dashboard page - a server component
export default async function DashboardPage() {
  // Check if the user is authenticated
  const session = await getServerSession();

  // Redirect if not authenticated
  if (!session) {
    redirect('/login');
  }

  // Fetch user profile
  const profile = await getUserProfile(session.user.id);

  // Fetch recent trips
  const trips = await getRecentTrips(session.user.id);

  return (
    <main className="container py-12 md:py-16">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar with user profile - client component */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Suspense fallback={<Card className="bg-muted animate-pulse h-48"></Card>}>
            <DashboardProfile user={session.user} profile={profile} />
          </Suspense>

          <Card className="mt-8">
            <CardHeader className="pb-4">
              <CardTitle className="lowercase text-xl font-semibold">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link
                href="/trips/create"
                className="w-full flex items-center px-4 py-2 rounded-full border hover:bg-muted transition-colors"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Plan a new trip</span>
              </Link>

              <Link
                href="/destinations"
                className="w-full flex items-center px-4 py-2 rounded-full border hover:bg-muted transition-colors"
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>Explore destinations</span>
              </Link>

              <Link
                href="/itineraries"
                className="w-full flex items-center px-4 py-2 rounded-full border hover:bg-muted transition-colors"
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                <span>Browse itineraries</span>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Your trips</h2>
              <Link href="/trips" className="text-sm flex items-center hover:underline">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              }
            >
              <TripsList trips={trips} />
            </Suspense>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Your travel map</h2>
            <Card>
              <CardContent className="pt-6">
                <Suspense
                  fallback={<div className="h-[300px] bg-muted animate-pulse rounded-md"></div>}
                >
                  <DashboardClientWrapper>
                    <TravelTracker userId={session.user.id} />
                  </DashboardClientWrapper>
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Trending destinations</h2>
              <Link href="/destinations" className="text-sm flex items-center hover:underline">
                Explore more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <Suspense
              fallback={<div className="h-[350px] bg-muted animate-pulse rounded-md"></div>}
            >
              <TrendingDestinations />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
