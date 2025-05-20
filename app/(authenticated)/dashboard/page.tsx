import { redirect } from 'next/navigation';
import { getServerSession } from '@/utils/supabase/server';
import { getDashboardOverview } from './actions';
import DashboardClient from './client';

// Force dynamic rendering because we use cookies()
export const dynamic = 'force-dynamic';

// Instead of forcing dynamic rendering on every request, use ISR with a reasonable revalidation period
export const revalidate = 300; // Revalidate every 5 minutes

// Main dashboard page - a server component
export default async function DashboardPage() {
  // Safely get user with null check
  const session = await getServerSession();
  
  // Handle case where user is null
  if (!session?.user) {
    redirect('/login?from=dashboard');
  }

  // Destructure with type safety
  const user = session.user;
  const userId = user.id;

  // Get comprehensive dashboard data
  let dashboardData;
  try {
    dashboardData = await getDashboardOverview(userId);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    // Provide default data structure in case of error
    dashboardData = {
      recentTrips: [],
      tripCount: 0,
      userProfile: {
        id: userId,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: null,
        onboarding_completed: false,
      },
      travelStats: {
        visitedCount: 0,
        plannedCount: 0,
        wishlistCount: 0,
        countriesCount: 0,
      },
      savedContent: {
        destinations: [],
        itineraries: [],
      },
      activeTrips: [],
    };
  }

  return <DashboardClient user={user} dashboardData={dashboardData} />;
}
