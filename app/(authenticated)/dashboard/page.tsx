import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { PlusCircle, CalendarCheck, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SkeletonCard } from '@/components/skeleton-card';
import { TrendingDestinations } from '@/components/trending-destinations';
import { DashboardProfile } from './components/dashboard-profile';
import { TripsList } from './components/trips-list';
import { getRecentTrips, getUserProfile, getTripCount } from './actions';
import { DashboardClientWrapper } from './components/dashboard-client-wrapper';
import { getServerSession } from '@/utils/supabase/server';
import { type TripRole } from '@/utils/constants/status';

import Link from 'next/link';
import TravelTracker from '@/components/TravelTracker';
import DashboardClient from './client';

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
  // Check authentication
  const { data } = await getServerSession();
  const session = data.session;

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?from=dashboard');
  }

  // Get user data
  const userId = session.user.id;
  const userProfile = await getUserProfile(userId);
  const recentTrips = await getRecentTrips(userId);
  const tripCount = await getTripCount(userId);

  return (
    <DashboardClient
      user={session.user}
      profile={userProfile}
      recentTrips={recentTrips}
      tripCount={tripCount}
    />
  );
}
