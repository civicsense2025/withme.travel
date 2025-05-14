'use client';

import React, { useEffect, useState } from 'react';
import { AuthModalDemo } from '@/components/auth-modal-demo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define the expected types for our analytics data
interface AnalyticsData {
  totalEvents: number;
  eventCounts: Record<string, number>;
  contextCounts: Record<string, number>;
  variantCounts: Record<string, number>;
  contextByVariant: Record<string, Record<string, number>>;
  conversionByVariant: Record<string, { opens: number; successes: number; rate: number }>;
  timeRange: {
    from: string;
    to: string;
  };
}

export default function AuthModalAdminPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/analytics/auth-modal');

        if (!response.ok) {
          throw new Error(`Error fetching analytics: ${response.status}`);
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching analytics data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Convert data for charts
  const prepareChartData = () => {
    if (!analyticsData)
      return {
        eventData: [],
        contextData: [],
        variantData: [],
        conversionData: [],
      };

    // Event data for bar chart
    const eventData = Object.entries(analyticsData.eventCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Context data for pie chart
    const contextData = Object.entries(analyticsData.contextCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Variant data for pie chart
    const variantData = Object.entries(analyticsData.variantCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Conversion data for comparison chart
    const conversionData = Object.entries(analyticsData.conversionByVariant).map(
      ([name, data]) => ({
        name,
        opens: data.opens,
        successes: data.successes,
        rate: data.rate,
      })
    );

    return { eventData, contextData, variantData, conversionData };
  };

  const { eventData, contextData, variantData, conversionData } = prepareChartData();

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>Could not load auth modal analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              You might not have admin permissions to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Auth Modal Dashboard</h1>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="test">Test Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6 mt-4">
          {analyticsData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analyticsData.totalEvents}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Unique Contexts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {Object.keys(analyticsData.contextCounts).length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Best Performing Variant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(analyticsData.conversionByVariant).sort(
                      (a, b) => b[1].rate - a[1].rate
                    )[0] ? (
                      <p className="text-3xl font-bold capitalize">
                        {
                          Object.entries(analyticsData.conversionByVariant).sort(
                            (a, b) => b[1].rate - a[1].rate
                          )[0][0]
                        }
                      </p>
                    ) : (
                      <p className="text-3xl font-bold">No data</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Type</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contexts Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contextData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {contextData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>A/B Test Comparison</CardTitle>
                  <CardDescription>
                    Comparing conversion rates between different variants
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="opens" fill="#8884d8" name="Opens" />
                      <Bar dataKey="successes" fill="#82ca9d" name="Successful Logins" />
                      <Bar dataKey="rate" fill="#ffc658" name="Conversion Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  There is no analytics data available yet. Try testing the auth modal to generate
                  some data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="mt-4">
          <AuthModalDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
