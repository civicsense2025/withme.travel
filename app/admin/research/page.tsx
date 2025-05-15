'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  LineChart,
  FileBarChart2,
  Users,
  PlusCircle,
  BellRing,
  FileText,
  Sparkles,
  BookOpen,
  BarChart,
  CheckCircle2,
  XCircle,
  Settings,
  MessageCircle,
  Activity,
  FileQuestion,
  ArrowRight,
} from 'lucide-react';
import { MilestoneTriggerSimulator } from '@/components/research';

// Summary data - would be replaced with real API calls
const METRICS = {
  activeSurveys: 4,
  totalResponses: 1245,
  completionRate: 68,
  avgTimeToComplete: '2m 38s',
  activeTriggers: 8
};

export default function ResearchDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">User Testing & Research</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/research/surveys/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Survey
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-2xl font-bold">{METRICS.activeSurveys}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-2xl font-bold">{METRICS.totalResponses}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-2xl font-bold">{METRICS.completionRate}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-2xl font-bold">{METRICS.avgTimeToComplete}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <div className="text-2xl font-bold">{METRICS.activeTriggers}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="surveys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="surveys">
            <FileText className="h-4 w-4 mr-2" />
            Surveys
          </TabsTrigger>
          <TabsTrigger value="triggers">
            <Sparkles className="h-4 w-4 mr-2" />
            Milestone Triggers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Survey Management</CardTitle>
                <CardDescription>Create, edit, and manage user testing surveys</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Surveys</span>
                    <Badge variant="outline">{isLoading ? '-' : METRICS.activeSurveys}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Surveys</span>
                    <Badge variant="outline">{isLoading ? '-' : METRICS.activeSurveys + 3}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/surveys">
                    View All Surveys
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Survey Builder</CardTitle>
                <CardDescription>Create new surveys and edit questions</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Question Types</span>
                    <Badge variant="outline">Multiple</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Milestone Support</span>
                    <Badge variant="outline">Yes</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/surveys/create">
                    Create New Survey
                    <PlusCircle className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Response Management</CardTitle>
                <CardDescription>View and export survey responses</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Responses</span>
                    <Badge variant="outline">{isLoading ? '-' : METRICS.totalResponses}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Export Formats</span>
                    <Badge variant="outline">CSV, JSON</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/analytics/responses">
                    View Responses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Milestone Triggers</CardTitle>
                <CardDescription>View and manage milestone trigger events</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Triggers</span>
                    <Badge variant="outline">{isLoading ? '-' : METRICS.activeTriggers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Event Types</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/milestone-triggers">
                    Manage Triggers
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Event Types</CardTitle>
                <CardDescription>View and configure available event types</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">User Events</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">System Events</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/events">
                    View Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trigger Simulator</CardTitle>
                <CardDescription>Test milestone triggers in development</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="text-sm text-muted-foreground">
                  Simulate milestone events to test trigger behavior without executing real user flows.
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Test Triggers
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Milestone Trigger Simulator (dev/admin only) */}
          <div className="mt-6">
            <MilestoneTriggerSimulator />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Comprehensive research analytics</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Metrics</span>
                    <Badge variant="outline">Multiple</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Visualizations</span>
                    <Badge variant="outline">Charts, Tables</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/analytics">
                    View Analytics
                    <BarChart3 className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Event Log</CardTitle>
                <CardDescription>Detailed log of all research events</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Events Today</span>
                    <Badge variant="outline">{isLoading ? '-' : '204'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Filter Options</span>
                    <Badge variant="outline">Multiple</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/analytics#events">
                    View Event Log
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Export analytics data in various formats</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Export Formats</span>
                    <Badge variant="outline">CSV, JSON, Excel</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Range</span>
                    <Badge variant="outline">Configurable</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/admin/research/analytics#export">
                    Export Analytics
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 