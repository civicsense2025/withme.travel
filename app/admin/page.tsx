'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe, FileText, MessageSquare } from 'lucide-react';
import { AdminStatsCard } from '@/app/admin/components/AdminStatsCard';
import { AdminDebugPanel } from '@/app/admin/components/AdminDebugPanel';
import { TABLES } from '@/utils/constants/database';

interface StatsData {
  totalUsers: number;
  activeTrips: number;
  contentViews: number;
  totalFeedback: number;
  surveyResponses: number;
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from an API
        // For now, we'll simulate it with some realistic data

        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Get the survey responses count - this is real data
        const surveyResponsesRes = await fetch('/api/admin/surveys/count');
        const surveyResponsesData = surveyResponsesRes.ok
          ? await surveyResponsesRes.json()
          : { count: 0 };

        setStatsData({
          totalUsers: 2851,
          activeTrips: 187,
          contentViews: 28472,
          totalFeedback: 74,
          surveyResponses: surveyResponsesData.count || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderStats = () => {
    if (!statsData) return null;

    const stats = [
      {
        title: 'Total Users',
        value: statsData.totalUsers.toLocaleString(),
        change: '+12%',
        trend: 'up' as const,
        icon: <Users className="h-5 w-5 text-travel-blue" />,
      },
      {
        title: 'Active Trips',
        value: statsData.activeTrips.toLocaleString(),
        change: '+23%',
        trend: 'up' as const,
        icon: <Globe className="h-5 w-5 text-travel-purple" />,
      },
      {
        title: 'Content Views',
        value: statsData.contentViews.toLocaleString(),
        change: '+18%',
        trend: 'up' as const,
        icon: <FileText className="h-5 w-5 text-travel-pink" />,
      },
      {
        title: 'Feedback & Surveys',
        value: (statsData.totalFeedback + statsData.surveyResponses).toLocaleString(),
        change: '+15%',
        trend: 'up' as const,
        icon: <MessageSquare className="h-5 w-5 text-travel-green" />,
      },
    ];

    return stats.map((stat, index) => (
      <AdminStatsCard
        key={index}
        title={stat.title}
        value={stat.value}
        change={stat.change}
        trend={stat.trend}
        icon={stat.icon}
      />
    ));
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? // Skeleton loader for stats
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="rounded-full bg-muted h-10 w-10 animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : renderStats()}
      </div>

      {/* Admin Debug Panel */}
      <AdminDebugPanel
        title="System Diagnostics"
        description="Connected database status and system information"
      />
    </div>
  );
}
