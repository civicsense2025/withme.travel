'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  LineChart,
  ListChecks,
  FileBarChart2,
  Users,
  Calendar,
  Settings,
  BellRing,
  FileText,
  Cog,
  MailSearch,
  MessageCircle,
  Activity,
  FileQuestion,
} from 'lucide-react';

export default function ResearchDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage user research, surveys, and event tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Event Tracking Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Event Tracking
            </CardTitle>
            <CardDescription>
              View and analyze user events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Comprehensive analytics on all tracked user actions and events throughout the application.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/analytics/events-dashboard">
              <Button>View Events Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Milestone Triggers Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-500" />
              Milestone Triggers
            </CardTitle>
            <CardDescription>
              Configure survey triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Set up automatic survey triggers based on user actions and milestones to collect timely feedback.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/milestone-triggers">
              <Button>Manage Triggers</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Surveys Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-green-500" />
              Forms & Surveys
            </CardTitle>
            <CardDescription>
              Design and manage surveys
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Create, edit and manage user feedback forms, surveys, and questionnaires.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/forms">
              <Button>Manage Forms</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Response Analytics Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Response Analytics
            </CardTitle>
            <CardDescription>
              Analyze survey responses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              View detailed analytics and insights from user survey responses and feedback.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/responses">
              <Button>View Responses</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* User Testing Sessions Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              User Testing
            </CardTitle>
            <CardDescription>
              Manage testing sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Schedule, track, and analyze user testing sessions and participant feedback.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/testing">
              <Button>Manage Sessions</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Research Settings
            </CardTitle>
            <CardDescription>
              Configure global settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Manage system-wide research settings, defaults, and configuration options.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/research/settings">
              <Button>Manage Settings</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Research Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Events Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">246,891</div>
              <p className="text-xs text-muted-foreground">+12.3% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 pending approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 