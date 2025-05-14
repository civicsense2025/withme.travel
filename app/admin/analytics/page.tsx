import { redirect } from 'next/navigation';
import { Container } from '@/components/container';
import { checkAdminAuth } from '../utils/auth';
import { TABLES } from '@/utils/constants/tables';
// @ts-ignore: Temporarily ignoring missing component file
import { FormAnalyticsDashboard } from '../../components/feedback/analytics/FormAnalyticsDashboard';

export const metadata = {
  title: 'Analytics Dashboard | Admin Panel',
  description: 'Data analytics and insights for withme.travel administration',
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { isAdmin, supabase } = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/login?redirectTo=/admin/analytics');
  }

  if (!supabase) {
    redirect('/login?error=supabase_client_error');
  }

  // Fetch analytics data from the database
  const [
    userGrowthResult,
    contentCreationResult,
    feedbackCategoriesResult,
    destinationPopularityResult,
  ] = await Promise.all([
    // User growth data
    supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),

    // Content creation data
    supabase
      .from('itinerary_templates')
      .select('created_at, type:template_type, destination_id')
      .order('created_at', { ascending: true }),

    // Feedback categories data
    supabase.from(TABLES.FEEDBACK).select('type, status, created_at'),

    // Destination popularity
    supabase
      .from('destinations')
      .select('id, name, likes_count, city, country')
      .order('likes_count', { ascending: false })
      .limit(10),
  ]);

  // Process user growth data by month
  const usersByMonth: Record<string, number> = {};
  (userGrowthResult.data || []).forEach((user) => {
    if (!user.created_at) return;
    const date = new Date(user.created_at);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!usersByMonth[month]) {
      usersByMonth[month] = 0;
    }
    usersByMonth[month]++;
  });

  // Process feedback data by category and status
  const feedbackByCategory: Record<string, number> = {};
  const feedbackByStatus: Record<string, number> = {};

  (feedbackCategoriesResult.data || []).forEach((feedback) => {
    if (
      feedback &&
      typeof feedback === 'object' &&
      'category' in feedback &&
      typeof (feedback as any).category === 'string'
    ) {
      const category = (feedback as { category: string }).category;
      if (!feedbackByCategory[category]) {
        feedbackByCategory[category] = 0;
      }
      feedbackByCategory[category]++;
    }
    if (
      feedback &&
      typeof feedback === 'object' &&
      'status' in feedback &&
      typeof (feedback as any).status === 'string'
    ) {
      const status = (feedback as { status: string }).status;
      if (!feedbackByStatus[status]) {
        feedbackByStatus[status] = 0;
      }
      feedbackByStatus[status]++;
    }
  });

  // Prepare data for charts
  const analyticsData = {
    userGrowth: {
      labels: Object.keys(usersByMonth).sort(),
      data: Object.keys(usersByMonth)
        .sort()
        .map((month) => usersByMonth[month]),
    },
    contentCreation: {
      data: contentCreationResult.data || [],
    },
    feedbackCategories: {
      byCategory: {
        labels: Object.keys(feedbackByCategory),
        data: Object.values(feedbackByCategory),
      },
      byStatus: {
        labels: Object.keys(feedbackByStatus),
        data: Object.values(feedbackByStatus),
      },
    },
    popularDestinations: destinationPopularityResult.data || [],
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <FormAnalyticsDashboard analytics={analyticsData} />
    </Container>
  );
}
