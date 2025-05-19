'use client';

import { User } from '@supabase/supabase-js';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';

// UI Components
import { DashboardHeader } from './components/dashboard-header';
import { ContentTabsSection } from './components/content-tabs-section';
import { DiscoverSection } from './components/discover-section';
import { useToast } from '@/lib/hooks/use-toast';

// Dashboard data structure from server actions
interface DashboardData {
  recentTrips: any[];
  tripCount: number;
  userProfile: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    onboarding_completed?: boolean;
  } | null;
  travelStats: {
    visitedCount: number;
    plannedCount: number;
    wishlistCount: number;
    countriesCount: number;
  };
  savedContent: {
    destinations: any[];
    itineraries: any[];
  };
  activeTrips: any[];
}

interface DashboardClientProps {
  user: User;
  dashboardData: DashboardData;
}

export default function DashboardClient({ user, dashboardData }: DashboardClientProps) {
  const { recentTrips, tripCount, userProfile, travelStats, savedContent, activeTrips } =
    dashboardData;

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(
    userProfile && userProfile.onboarding_completed === false
  );

  // Handle welcome toast on login
  useEffect(() => {
    if (searchParams?.get('justLoggedIn') === '1') {
      toast({ title: 'Welcome back!' });
      // Remove the param from the URL (replaceState to avoid extra navigation)
      const params = new URLSearchParams(window.location.search);
      params.delete('justLoggedIn');
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, toast]);

  // Get display name from profile or user metadata
  const displayName =
    userProfile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler';

  return (
    <main className="container py-8 max-w-5xl mx-auto">
      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-lg px-4 py-3 flex items-center justify-between">
          <span>
            <b>Finish setting up your account!</b> Complete onboarding to unlock all features.
          </span>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="secondary" onClick={() => router.push('/onboarding')}>
              Complete Onboarding
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Dismiss"
              onClick={() => setShowOnboardingBanner(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <DashboardHeader
        userName={displayName}
        avatarUrl={userProfile?.avatar_url}
        travelStats={travelStats}
      />

      {/* Main Content */}
      <div className="w-full">
        {/* Main Content Area with Tabs */}
        <ContentTabsSection
          trips={recentTrips}
          activeTrips={activeTrips}
          savedContent={savedContent}
        />
      </div>

      {/* Discover Section */}
      <DiscoverSection />
    </main>
  );
}
