'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { AlertTriangle, BarChart, ClipboardCheck, FlaskConical, UserMinus, UserPlus, Target, BarChart2 } from 'lucide-react';
import { ResearchStudy } from '@/types/research';

export default function ResearchAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = getBrowserClient();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    studies: 0,
    surveysTotal: 0,
    activeStudies: 0,
    activeTriggersCount: 0,
    userParticipation: 0,
    completedSurveys: 0
  });
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  
  // Check admin permissions
  useEffect(() => {
    async function checkPermissions() {
      try {
        setIsLoading(true);
        
        // Check user login
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Check admin role
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profileError || profile?.role !== 'admin') {
          router.push('/');
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
          });
          return;
        }
        
        setIsAdmin(true);
        
        // Load stats
        await loadResearchStats();
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPermissions();
  }, [supabase, router, toast]);
  
  const loadResearchStats = async () => {
    try {
      // Count studies
      const { data: studiesData, error: studiesError } = await supabase
        .from(TABLES.RESEARCH_STUDIES)
        .select('*', { count: 'exact' });
        
      if (studiesError) {
        console.error('Error fetching studies:', studiesError);
        return;
      }
      
      // Count active studies
      const { count: activeStudies } = await supabase
        .from(TABLES.RESEARCH_STUDIES)
        .select('*', { count: 'exact' })
        .eq('active', true);
      
      // Count surveys
      const { count: surveysTotal } = await supabase
        .from(TABLES.SURVEYS)
        .select('*', { count: 'exact' });
      
      // Count active triggers
      const { count: activeTriggersCount } = await supabase
        .from('research_triggers')
        .select('*', { count: 'exact' })
        .eq('active', true);
      
      // Set stats
      setStats({
        studies: studiesData?.length || 0,
        activeStudies: activeStudies || 0,
        surveysTotal: surveysTotal || 0,
        activeTriggersCount: activeTriggersCount || 0,
        userParticipation: Math.floor(Math.random() * 100), // Placeholder: replace with actual data
        completedSurveys: Math.floor(Math.random() * 200) // Placeholder: replace with actual data
      });
      
      setStudies(studiesData || []);
    } catch (error) {
      console.error('Error loading research stats:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Research Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your research studies, surveys, and triggers
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => router.push('/admin/research/triggers')}>
            Manage Triggers
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Research Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.studies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeStudies} active studies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.surveysTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedSurveys} surveys completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeTriggersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.userParticipation}% user participation
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Features Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <FlaskConical className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Research Flows</CardTitle>
            <CardDescription>
              Create and manage research triggers and survey flows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Connect events to surveys to create seamless research experiences. Track when users complete 
              specific actions and show them relevant surveys.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/research/triggers">Manage Triggers & Flows</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <ClipboardCheck className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Survey Builder</CardTitle>
            <CardDescription>
              Create and manage research surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Build custom surveys with various question types. Use them to collect 
              feedback, conduct research, and improve your product.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/admin/surveys">Manage Surveys</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <BarChart className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Research Analytics</CardTitle>
            <CardDescription>
              View research metrics and survey results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analyze survey responses, track completion rates, and measure research 
              effectiveness. Export data for further analysis.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/admin/research/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Add new Event Tracking card */}
        <Card>
          <CardHeader>
            <BarChart2 className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Event Tracking</CardTitle>
            <CardDescription>
              View all tracked events and use them for triggers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse all events tracked across the platform. Use these events to create 
              triggers, analyze user behavior, and send transactional communications.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/admin/research/events">View Events</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Access */}
      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Research Participation</CardTitle>
            <CardDescription>
              Recent research activity and participant metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">New participants</span>
                </div>
                <div className="text-2xl font-bold mt-1">24</div>
              </div>
              
              <div className="w-px h-12 bg-border"></div>
              
              <div className="flex flex-col">
                <div className="flex items-center">
                  <UserMinus className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm">Declined participation</span>
                </div>
                <div className="text-2xl font-bold mt-1">7</div>
              </div>
              
              <div className="w-px h-12 bg-border"></div>
              
              <div className="flex flex-col">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm">Incomplete surveys</span>
                </div>
                <div className="text-2xl font-bold mt-1">12</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                Participation rate is trending upward. Consider adjusting survey timing 
                to reduce incomplete submissions.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/admin/research/participants">View Participants</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Add below the stats and features cards */}
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-semibold">All Research Studies</h2>
        <Button asChild>
          <Link href="/admin/research/create">Create New Study</Link>
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {studies.length === 0 ? (
          <div className="col-span-full text-muted-foreground">No research studies found.</div>
        ) : (
          studies.map(study => (
            <Card key={study.id}>
              <CardHeader>
                <CardTitle>{study.name}</CardTitle>
                <CardDescription>{study.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 text-xs">
                  <span className={study.active ? 'text-green-600' : 'text-gray-400'}>
                    {study.active ? 'Active' : 'Inactive'}
                  </span>
                  <span>Created: {new Date(study.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/research/${study.id}`}>View</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/research/${study.id}/edit`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Milestone Triggers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Milestone Triggers</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Milestone Tracking</div>
          <p className="text-xs text-muted-foreground">
            Configure user milestone triggers for research
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/research/milestones">
            <Button size="sm" variant="outline">Manage Milestones</Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Analytics Dashboard Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Research Analytics</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Data Analysis</div>
          <p className="text-xs text-muted-foreground">
            View research metrics and study performance
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/research/analytics">
            <Button size="sm" variant="outline">View Analytics</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 