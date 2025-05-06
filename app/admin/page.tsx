import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from './utils/auth';
import { AdminStatsCard } from './components/AdminStatsCard';
import { RecentFeedback } from './components/RecentFeedback';
import { ActivitySummary } from './components/ActivitySummary';
import { Users, FileText, Map, MessageSquare, Navigation } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Panel | withme.travel',
  description: 'Admin control panel for withme.travel',
};

export default async function AdminPage() {
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch summary stats for the dashboard
  const [
    destinationsResult,
    itinerariesResult,
    usersResult,
    feedbackResult,
    recentFeedbackResult,
    tripsResult
  ] = await Promise.all([
    supabase.from('DESTINATIONS').select('id', { count: 'exact', head: true }),
    supabase.from('ITINERARY_TEMPLATES').select('id', { count: 'exact', head: true }),
    supabase.from('PROFILES').select('id', { count: 'exact', head: true }),
    supabase.from('FEEDBACK').select('id', { count: 'exact', head: true }),
    supabase.from('FEEDBACK')
      .select('id, content, type, status, created_at, email, user:profiles!feedback_user_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('trips').select('id', { count: 'exact', head: true }),
  ]);

  const stats = {
    destinations: destinationsResult.count || 0,
    itineraries: itinerariesResult.count || 0,
    users: usersResult.count || 0,
    feedback: feedbackResult.count || 0,
    trips: tripsResult.count || 0
  };

  // Format the recent feedback data for display
  const recentFeedback = (recentFeedbackResult.data || []).map(item => ({
    ...item,
    user: item.user && item.user.length > 0 
      ? { 
          full_name: item.user[0]?.full_name || null,
          email: item.user[0]?.email || null 
        }
      : null
  }));

  // Create activity summary data
  const activitySummaryStats = [
    { label: 'Total Destinations', value: stats.destinations },
    { label: 'Total Templates', value: stats.itineraries },
    { label: 'Total Trips', value: stats.trips },
    { label: 'Total Users', value: stats.users },
    { label: 'Total Feedback', value: stats.feedback },
  ];

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <AdminStatsCard 
          title="Destinations" 
          value={stats.destinations} 
          icon={<Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />} 
        />
        <AdminStatsCard 
          title="Itineraries" 
          value={stats.itineraries} 
          icon={<FileText className="h-6 w-6 text-green-600 dark:text-green-400" />} 
        />
        <AdminStatsCard 
          title="Users" 
          value={stats.users} 
          icon={<Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />} 
        />
        <AdminStatsCard 
          title="Feedback" 
          value={stats.feedback} 
          icon={<MessageSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />} 
        />
        <AdminStatsCard 
          title="Trips" 
          value={stats.trips} 
          icon={<Navigation className="h-6 w-6 text-red-600 dark:text-red-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RecentFeedback items={recentFeedback} />
        <ActivitySummary stats={activitySummaryStats} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Manage Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/destinations" 
              className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md text-center transition-colors"
            >
              <Map className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              <span>Destinations</span>
            </Link>
            <Link 
              href="/admin/itineraries" 
              className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md text-center transition-colors"
            >
              <FileText className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              <span>Itineraries</span>
            </Link>
            <Link 
              href="/admin/users" 
              className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md text-center transition-colors"
            >
              <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              <span>Users</span>
            </Link>
            <Link 
              href="/admin/feedback" 
              className="flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-md text-center transition-colors"
            >
              <MessageSquare className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              <span>Feedback</span>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
} 