'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { AlertTriangle, BarChart, ClipboardCheck, FlaskConical, UserPlus, UserMinus, Settings, AlarmClock, FilePenLine } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResearchStudy {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function ResearchStudyPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params?.studyId as string;
  const { toast } = useToast();
  const supabase = getBrowserClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [study, setStudy] = useState<ResearchStudy | null>(null);
  const [stats, setStats] = useState({
    participantsCount: 0,
    surveysCount: 0,
    completedSurveysCount: 0,
    triggersCount: 0
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Check if user is an admin
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
        await loadStudyData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify permissions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [studyId, supabase, router, toast]);

  const loadStudyData = async () => {
    try {
      // Get research study
      const { data: studyData, error: studyError } = await supabase
        .from(TABLES.RESEARCH_STUDIES)
        .select('*')
        .eq('id', studyId)
        .single();

      if (studyError) {
        throw new Error('Study not found');
      }

      setStudy(studyData);

      // Get participants count
      const { count: participantsCount } = await supabase
        .from(TABLES.RESEARCH_PARTICIPANTS)
        .select('*', { count: 'exact' })
        .eq('study_id', studyId);

      // Get triggers count
      const { count: triggersCount } = await supabase
        .from(TABLES.RESEARCH_TRIGGERS)
        .select('*', { count: 'exact' })
        .eq('study_id', studyId);

      // Get surveys count
      const { count: surveysCount } = await supabase
        .from(TABLES.SURVEYS)
        .select('*', { count: 'exact' })
        .eq('study_id', studyId);

      // Get completed surveys count
      const { count: completedSurveysCount } = await supabase
        .from(TABLES.SURVEY_RESPONSES)
        .select('*', { count: 'exact' })
        .eq('study_id', studyId)
        .eq('completed', true);

      setStats({
        participantsCount: participantsCount || 0,
        surveysCount: surveysCount || 0,
        completedSurveysCount: completedSurveysCount || 0,
        triggersCount: triggersCount || 0
      });
    } catch (error) {
      console.error('Error loading study data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study details.',
        variant: 'destructive',
      });
      router.push('/admin/research');
    }
  };

  const handleToggleActive = async () => {
    if (!study) return;
    
    try {
      const { error } = await supabase
        .from(TABLES.RESEARCH_STUDIES)
        .update({ active: !study.active })
        .eq('id', studyId);
        
      if (error) throw error;
      
      setStudy({ ...study, active: !study.active });
      
      toast({
        title: 'Success',
        description: `Study ${study.active ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling study status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update study status.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p>Loading study details...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !study) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{study.name}</h1>
            <Badge variant={study.active ? "success" : "secondary"}>
              {study.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            {study.description || 'No description provided'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/research">Back to Studies</Link>
          </Button>
          <Button variant="outline" onClick={handleToggleActive}>
            {study.active ? 'Deactivate' : 'Activate'} Study
          </Button>
          <Button asChild>
            <Link href={`/admin/research/${study.id}/edit`}>
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit Study
            </Link>
          </Button>
        </div>
      </div>

      {/* Study Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.participantsCount}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center" asChild>
              <Link href={`/admin/research/${study.id}/participants`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Participants
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.surveysCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedSurveysCount} completed
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center" disabled>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Manage Surveys
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.triggersCount}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center" asChild>
              <Link href={`/admin/research/${study.id}/triggers`}>
                <AlarmClock className="mr-2 h-4 w-4" />
                Manage Triggers
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-center" asChild>
              <Link href={`/admin/research/${study.id}/analytics`}>
                <BarChart className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Study Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Created</h3>
              <p>{new Date(study.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Last Updated</h3>
              <p>{study.updated_at ? new Date(study.updated_at).toLocaleString() : 'Never'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Status</h3>
              <p>{study.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">ID</h3>
              <p className="font-mono text-sm">{study.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="participants">
        <TabsList className="mb-4">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage participants for this study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Full Management Interface</AlertTitle>
                <AlertDescription>
                  For detailed participant management, go to the 
                  <Button variant="link" className="px-1 h-auto" asChild>
                    <Link href={`/admin/research/${study.id}/participants`}>Participants</Link>
                  </Button>
                  section.
                </AlertDescription>
              </Alert>
              <Button asChild>
                <Link href={`/admin/research/${study.id}/participants`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Participants
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="surveys">
          <Card>
            <CardHeader>
              <CardTitle>Surveys</CardTitle>
              <CardDescription>Manage surveys for this study</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Survey management coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage triggers for this study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Full Management Interface</AlertTitle>
                <AlertDescription>
                  For detailed trigger management, go to the 
                  <Button variant="link" className="px-1 h-auto" asChild>
                    <Link href={`/admin/research/${study.id}/triggers`}>Triggers</Link>
                  </Button>
                  section.
                </AlertDescription>
              </Alert>
              <Button asChild>
                <Link href={`/admin/research/${study.id}/triggers`}>
                  <AlarmClock className="mr-2 h-4 w-4" />
                  Manage Triggers
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View participation and completion statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Full Analytics</AlertTitle>
                <AlertDescription>
                  For detailed analytics, go to the 
                  <Button variant="link" className="px-1 h-auto" asChild>
                    <Link href={`/admin/research/${study.id}/analytics`}>Analytics</Link>
                  </Button>
                  section.
                </AlertDescription>
              </Alert>
              <Button asChild>
                <Link href={`/admin/research/${study.id}/analytics`}>
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 