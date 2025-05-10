'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import TriggersTable from './components/triggers-table';
import TriggerForm from './components/trigger-form';
import PreviewSection from './components/preview-section';
import { Badge } from "@/components/ui/badge";
import { ResearchStudy, ResearchTrigger } from '@/types/research';
import { researchStudiesTableHelper, researchTriggersTableHelper } from '@/utils/supabase/table-helpers';

interface SeedResult {
  success: boolean;
  message?: string;
  error?: string;
  stats?: {
    study: string;
    surveys: {
      created: number;
      skipped: number;
    };
    triggers: {
      created: number;
      skipped: number;
    };
  };
}

// Define a type for the studies returned from the database
type Study = ResearchStudy;

export default function TriggersAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = getBrowserClient();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [selectedTabId, setSelectedTabId] = useState('triggers');
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<ResearchTrigger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  
  // Check admin permissions and load studies
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
        
        // Load studies using our helper function
        const { data, error: studiesError } = await researchStudiesTableHelper(supabase)
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false });
          
        if (studiesError) {
          console.error('Error loading studies:', studiesError);
          toast({
            title: 'Error',
            description: 'Failed to load research studies.',
            variant: 'destructive',
          });
          return;
        }

        // Cast the data to the proper type
        const studiesData = data as unknown as Study[];
        
        setStudies(studiesData || []);
        
        // Set the first study as selected by default
        if (studiesData && studiesData.length > 0) {
          setSelectedStudyId(studiesData[0].id);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPermissions();
  }, [supabase, router, toast]);
  
  // Improved trigger fetching with proper error handling and retry logic
  useEffect(() => {
    if (!selectedStudyId) return;
    
    // Update URL without triggering a page reload
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('studyId', selectedStudyId);
    window.history.replaceState({}, '', currentUrl.toString());
    
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const BASE_RETRY_DELAY = 2000; // Start with 2 seconds
    
    const fetchTriggers = async (delay = 0) => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      if (!isMounted) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        console.log(`Fetching triggers for study ${selectedStudyId} (attempt ${retryCount + 1})`);
        
        const response = await fetch(`/api/admin/research/triggers?studyId=${selectedStudyId}`, {
          signal: controller.signal,
          headers: {'Content-Type': 'application/json'}
        });
        
        clearTimeout(timeoutId);
        
        // Handle rate limiting
        if (response.status === 429) {
          // Get retry delay from header or use exponential backoff
          const retryAfter = response.headers.get('Retry-After');
          const retryMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(30000, BASE_RETRY_DELAY * Math.pow(2, retryCount));
          
          console.log(`Rate limited when fetching triggers. Will retry in ${retryMs}ms`);
          
          if (retryCount < MAX_RETRIES && isMounted) {
            retryCount++;
            return fetchTriggers(retryMs);
          } else {
            toast({
              title: 'Rate limit exceeded',
              description: 'Too many requests. Please try again later.',
              variant: 'destructive',
            });
            return;
          }
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle both array response and object with triggers property
        const triggerArray = Array.isArray(data) ? data : (data?.triggers || []);
        console.log(`Loaded ${triggerArray.length} triggers for study ${selectedStudyId}`);
        
        // Reset retry count on success
        retryCount = 0;
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Only log errors that aren't from manually aborting the request
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Error fetching triggers:", error);
          
          // Retry on network errors with exponential backoff
          if (retryCount < MAX_RETRIES && isMounted && 
              (error.name === 'TypeError' || error.message.includes('network'))) {
            retryCount++;
            const retryMs = Math.min(30000, BASE_RETRY_DELAY * Math.pow(2, retryCount));
            console.log(`Network error. Retrying in ${retryMs}ms...`);
            return fetchTriggers(retryMs);
          }
          
          toast({
            title: 'Error',
            description: 'Failed to load triggers. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    
    // Start the initial fetch with a small delay to prevent immediate API calls
    const timerId = setTimeout(() => fetchTriggers(), 300);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [selectedStudyId, toast]); // Added toast to dependencies
  
  const handleAddTrigger = () => {
    setEditingTrigger(null);
    setShowTriggerForm(true);
  };
  
  const handleEditTrigger = (trigger: ResearchTrigger) => {
    setEditingTrigger(trigger);
    setShowTriggerForm(true);
  };
  
  const handleTriggerFormClose = () => {
    setShowTriggerForm(false);
    setEditingTrigger(null);
  };
  
  const handleSeedData = async () => {
    setSeedLoading(true);
    setSeedResult(null);
    
    try {
      const response = await fetch('/api/admin/research/seed', {
        method: 'POST',
      });
      
      const data = await response.json();
      setSeedResult(data as SeedResult);
      
      // Refresh the page data after seeding
      if (data.success) {
        fetch('/api/admin/research/create-study')
          .then(res => res.json())
          .then(data => {
            const studies = data.studies as Study[] || [];
            setStudies(studies);
            // Select the newly created study
            if (studies.length > 0) {
              const study = studies.find((s: Study) => s.id === data.studyId) || studies[0];
              setSelectedStudyId(study.id);
            }
          });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seed data';
      setSeedResult({ 
        success: false, 
        error: errorMessage 
      });
    } finally {
      setSeedLoading(false);
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
  
  if (studies.length === 0) {
    return (
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <Link href="/admin/research" className="flex items-center mr-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Research</span>
          </Link>
          <h1 className="text-3xl font-bold">Research Triggers</h1>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No active studies found</AlertTitle>
          <AlertDescription>
            You need to create at least one active research study before you can manage triggers.
          </AlertDescription>
        </Alert>
        
        <Button onClick={() => router.push('/admin/research')}>
          Go to Research Studies
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Research Triggers</h1>
          <p className="text-gray-500">Configure survey triggers for research studies</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSeedData} 
            disabled={seedLoading}
          >
            {seedLoading ? 'Seeding...' : 'Seed Initial Data'}
          </Button>
          <Button asChild>
            <Link href={`/admin/research/${selectedStudyId || ''}`}>
              Back to Research
            </Link>
          </Button>
          <Button onClick={handleAddTrigger}>
            Add Trigger
          </Button>
        </div>
      </div>
      
      {seedResult && (
        <div className={`p-4 mb-6 rounded-md ${seedResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p className="font-semibold">{seedResult.success ? 'Success!' : 'Error'}</p>
          <p>{seedResult.message || seedResult.error}</p>
          {seedResult.stats && (
            <div className="mt-2">
              <p><strong>Study:</strong> {seedResult.stats.study}</p>
              <p><strong>Surveys:</strong> {seedResult.stats.surveys.created} created, {seedResult.stats.surveys.skipped} skipped</p>
              <p><strong>Triggers:</strong> {seedResult.stats.triggers.created} created, {seedResult.stats.triggers.skipped} skipped</p>
            </div>
          )}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Research Study</CardTitle>
          <CardDescription>
            Choose the research study you want to manage triggers for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedStudyId || undefined}
            onValueChange={(value) => setSelectedStudyId(value)}
          >
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue>
                <span>Select a study</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {studies.map((study) => (
                <SelectItem key={study.id} value={study.id}>
                  {study.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedStudyId && (
        <Tabs value={selectedTabId} onValueChange={setSelectedTabId} className="space-y-4">
          <TabsList>
            <TabsTrigger value="triggers">Manage Triggers</TabsTrigger>
            <TabsTrigger value="preview">Preview & Simulate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="triggers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Triggers</h2>
              <Button onClick={handleAddTrigger}>Add Trigger</Button>
            </div>
            
            <TriggersTable 
              studyId={selectedStudyId} 
              onEdit={handleEditTrigger} 
            />
            
            {showTriggerForm && (
              <TriggerForm
                studyId={selectedStudyId}
                trigger={editingTrigger}
                onClose={handleTriggerFormClose}
              />
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <h2 className="text-xl font-semibold">Preview & Simulate</h2>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Preview Mode</AlertTitle>
              <AlertDescription>
                In this tab, you can simulate what happens when different events are triggered.
                Select an event to see which survey would be shown to users.
              </AlertDescription>
            </Alert>
            
            <PreviewSection studyId={selectedStudyId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 