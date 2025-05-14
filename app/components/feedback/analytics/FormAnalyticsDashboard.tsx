'use client';

import { useState, useEffect } from 'react';
import { FormAnalytics, FeedbackForm } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface FormAnalyticsDashboardProps {
  forms?: FeedbackForm[];
  analytics?: Record<string, FormAnalytics>;
  isLoading?: boolean;
  onFormSelect?: (formId: string) => void;
}

export function FormAnalyticsDashboard({
  forms = [],
  analytics = {},
  isLoading = false,
  onFormSelect,
}: FormAnalyticsDashboardProps) {
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // Set the first form as selected by default when forms are loaded
  useEffect(() => {
    if (forms.length > 0 && !selectedFormId) {
      setSelectedFormId(forms[0].id);
      if (onFormSelect) {
        onFormSelect(forms[0].id);
      }
    }
  }, [forms, selectedFormId, onFormSelect]);

  // Handle form selection change
  const handleFormChange = (formId: string) => {
    setSelectedFormId(formId);
    if (onFormSelect) {
      onFormSelect(formId);
    }
  };

  // Get the selected form and its analytics
  const selectedForm = forms.find((form) => form.id === selectedFormId);
  const selectedAnalytics = selectedFormId ? analytics[selectedFormId] : undefined;

  // If still loading or no data available
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form Analytics</CardTitle>
          <CardDescription>No forms available for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Create some forms to start collecting analytics data
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sample completion rate data for visualization
  // In a real app, this would come from the analytics object
  const completionRateData = [
    { name: 'Started', value: selectedAnalytics?.views || 0 },
    { name: 'Completed', value: selectedAnalytics?.submissions || 0 },
  ];

  // Sample drop-off data by question
  const dropoffData = selectedAnalytics?.dropoffPoints || [];

  // Sample average completion time in seconds
  const avgCompletionTime = selectedAnalytics?.averageTimeToComplete || 0;

  // Custom colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Form Analytics</CardTitle>
            <CardDescription>Performance metrics and user engagement data</CardDescription>
          </div>
          <Select value={selectedFormId} onValueChange={handleFormChange}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {selectedForm ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedAnalytics?.views || 0}</div>
                    <p className="text-xs text-muted-foreground">Total form views</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedAnalytics?.submissions || 0}</div>
                    <p className="text-xs text-muted-foreground">Completed forms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedAnalytics?.completionRate
                        ? `${(selectedAnalytics.completionRate * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">Submissions / Views</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={completionRateData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {completionRateData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-80">
                    <div className="text-5xl font-bold text-purple-500">
                      {avgCompletionTime
                        ? `${Math.floor(avgCompletionTime / 60)}:${(avgCompletionTime % 60).toString().padStart(2, '0')}`
                        : 'N/A'}
                    </div>
                    <p className="text-muted-foreground mt-4">
                      {avgCompletionTime ? 'minutes:seconds' : 'No data available'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Question Drop-off Analysis</CardTitle>
                  <CardDescription>Where users abandon the form most frequently</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  {dropoffData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dropoffData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <XAxis
                          dataKey="questionId"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [`${value} users`, 'Drop-offs']}
                          labelFormatter={(value) => `Question: ${value}`}
                        />
                        <Bar dataKey="dropoffCount" fill="#8884d8" name="Drop-offs" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No drop-off data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* You could add more question-specific analytics here */}
            </TabsContent>

            <TabsContent value="responses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Trends</CardTitle>
                  <CardDescription>Form submission trends over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* Placeholder for a time-series chart of form submissions */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Response data visualization would appear here,
                    <br />
                    showing trends in submission volume over time
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Devices</CardTitle>
                  <CardDescription>What devices people use to complete the form</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* Placeholder for device breakdown */}
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Device distribution chart would appear here,
                    <br />
                    showing the breakdown of mobile, tablet, and desktop users
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Select a form to view its analytics
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Data updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
        <div className="text-sm text-muted-foreground">
          <button className="text-primary hover:underline">Export data</button>
        </div>
      </CardFooter>
    </Card>
  );
}
