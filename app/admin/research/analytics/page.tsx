'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Sample data for mockup - will be replaced with real API calls
const COMPLETION_DATA = [
  { name: 'Post-Trip Survey', completed: 68, abandoned: 32 },
  { name: 'New User Onboarding', completed: 75, abandoned: 25 },
  { name: 'Feature Feedback', completed: 55, abandoned: 45 },
  { name: 'Home Page Exit', completed: 42, abandoned: 58 },
];

const MILESTONE_COMPLETION = [
  { name: 'Welcome', completed: 95 },
  { name: 'Basic Info', completed: 86 },
  { name: 'Trip Details', completed: 78 },
  { name: 'Preferences', completed: 65 },
  { name: 'Feedback', completed: 58 },
];

const EVENTS_BY_DAY = [
  { date: '2025-05-10', count: 124 },
  { date: '2025-05-11', count: 156 },
  { date: '2025-05-12', count: 188 },
  { date: '2025-05-13', count: 204 },
  { date: '2025-05-14', count: 221 },
  { date: '2025-05-15', count: 198 },
  { date: '2025-05-16', count: 210 },
];

const RESPONSE_SAMPLE = [
  { id: 'r1', surveyName: 'Post-Trip Survey', questionText: 'How would you rate your experience?', response: '4/5', timestamp: '2025-05-16T14:23:00Z' },
  { id: 'r2', surveyName: 'Post-Trip Survey', questionText: 'What could be improved?', response: 'Better coordination between members', timestamp: '2025-05-16T14:24:30Z' },
  { id: 'r3', surveyName: 'New User Onboarding', questionText: 'How easy was it to create your first trip?', response: 'Very easy', timestamp: '2025-05-16T10:15:22Z' },
  { id: 'r4', surveyName: 'Feature Feedback', questionText: 'Would you use this feature again?', response: 'Yes', timestamp: '2025-05-15T18:42:15Z' },
];

const EVENT_LOG = [
  { id: 'e1', type: 'survey_started', details: 'Post-Trip Survey', sessionId: 's123', timestamp: '2025-05-16T14:20:00Z' },
  { id: 'e2', type: 'survey_step_completed', details: 'Step 1/5', sessionId: 's123', timestamp: '2025-05-16T14:23:00Z' },
  { id: 'e3', type: 'survey_step_completed', details: 'Step 2/5', sessionId: 's123', timestamp: '2025-05-16T14:26:00Z' },
  { id: 'e4', type: 'survey_completed', details: 'Post-Trip Survey', sessionId: 's123', timestamp: '2025-05-16T14:30:00Z' },
  { id: 'e5', type: 'survey_abandoned', details: 'Feature Feedback (Step 2/4)', sessionId: 's456', timestamp: '2025-05-16T12:15:00Z' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ResearchAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('7d');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = (format) => {
    toast({
      title: 'Export started',
      description: `Exporting analytics data as ${format.toUpperCase()}...`,
    });
    // Implement actual export logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Research & User Testing Analytics</h1>
        <div className="flex gap-2">
          <Select value={selectedSurvey} onValueChange={setSelectedSurvey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Survey" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surveys</SelectItem>
              <SelectItem value="post-trip">Post-Trip Survey</SelectItem>
              <SelectItem value="onboarding">New User Onboarding</SelectItem>
              <SelectItem value="feature">Feature Feedback</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="completion">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Completion Rates
          </TabsTrigger>
          <TabsTrigger value="responses">
            <FileText className="h-4 w-4 mr-2" />
            Responses
          </TabsTrigger>
          <TabsTrigger value="events">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Event Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-2xl font-bold">1,245</div>
                )}
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-2xl font-bold">68.4%</div>
                )}
                <p className="text-xs text-muted-foreground">
                  +3.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-2xl font-bold">42</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Currently in progress
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
              <CardDescription>Daily count of research events</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={EVENTS_BY_DAY} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completion Rates Tab */}
        <TabsContent value="completion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Survey Completion Rates</CardTitle>
                <CardDescription>Completed vs. abandoned surveys</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={COMPLETION_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#0088FE" stackId="a" name="Completed" />
                      <Bar dataKey="abandoned" fill="#FF8042" stackId="a" name="Abandoned" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestone Completion</CardTitle>
                <CardDescription>Completion percentage by survey milestone</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MILESTONE_COMPLETION} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#00C49F" name="Completion %" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Completion Metrics</CardTitle>
              <CardDescription>Detailed metrics for each survey</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Survey</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Avg. Time</TableHead>
                      <TableHead>Drop-off Milestone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Post-Trip Survey</TableCell>
                      <TableCell>124</TableCell>
                      <TableCell>84</TableCell>
                      <TableCell>67.7%</TableCell>
                      <TableCell>3m 42s</TableCell>
                      <TableCell>Trip Details</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">New User Onboarding</TableCell>
                      <TableCell>203</TableCell>
                      <TableCell>152</TableCell>
                      <TableCell>74.9%</TableCell>
                      <TableCell>2m 15s</TableCell>
                      <TableCell>Preferences</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Feature Feedback</TableCell>
                      <TableCell>87</TableCell>
                      <TableCell>48</TableCell>
                      <TableCell>55.2%</TableCell>
                      <TableCell>1m 58s</TableCell>
                      <TableCell>Feedback</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Summary</CardTitle>
              <CardDescription>Recent survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Survey</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {RESPONSE_SAMPLE.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.surveyName}</TableCell>
                        <TableCell>{item.questionText}</TableCell>
                        <TableCell>{item.response}</TableCell>
                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" size="sm">
                Previous
              </Button>
              <Button variant="ghost" size="sm">
                Next
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Responses</CardTitle>
              <CardDescription>Frequently occurring answers to open-ended questions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[250px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">What could be improved?</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="px-3 py-1">Better coordination (24)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Easier sharing (18)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Mobile experience (15)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">More templates (12)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Notifications (10)</Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium mb-2">What did you like most?</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="px-3 py-1">Easy to use (35)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Collaborative (28)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Trip templates (22)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Visual design (18)</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Speed (14)</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Log Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Events Log</CardTitle>
              <CardDescription>Chronological log of all research-related events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EVENT_LOG.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {event.type === 'survey_completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {event.type === 'survey_abandoned' && <XCircle className="h-4 w-4 text-red-500" />}
                            {event.type === 'survey_started' && <Users className="h-4 w-4 text-blue-500" />}
                            {event.type === 'survey_step_completed' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                            {event.type}
                          </div>
                        </TableCell>
                        <TableCell>{event.details}</TableCell>
                        <TableCell>{event.sessionId}</TableCell>
                        <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 5 of 1,245 events
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
              <CardDescription>Distribution of different event types</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Survey Started', value: 428 },
                        { name: 'Step Completed', value: 1253 },
                        { name: 'Survey Completed', value: 312 },
                        { name: 'Survey Abandoned', value: 116 },
                        { name: 'Milestone Triggered', value: 87 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Survey Started', value: 428 },
                        { name: 'Step Completed', value: 1253 },
                        { name: 'Survey Completed', value: 312 },
                        { name: 'Survey Abandoned', value: 116 },
                        { name: 'Milestone Triggered', value: 87 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
