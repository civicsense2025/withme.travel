'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Link2, 
  Milestone, 
  Pencil,
  Eye,
  BarChart3, 
  FileText,
} from 'lucide-react';
import { SurveyDetails } from '@/components/research/SurveyDetails';
import { useResearchTracking } from '@/hooks/use-research-tracking';

export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseCount, setResponseCount] = useState(0);
  const { trackEvent } = useResearchTracking();
  
  // Use React.use to properly handle the params promise
  const surveyId = React.use(params).id;
  
  useEffect(() => {
    async function fetchSurvey() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/research/surveys/${surveyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch survey');
        }
        
        const data = await response.json();
        setSurvey(data.survey);
        
        // Get response count
        try {
          const responseCountRes = await fetch(`/api/research/surveys/${surveyId}/responses/count`);
          if (responseCountRes.ok) {
            const countData = await responseCountRes.json();
            setResponseCount(countData.count || 0);
          }
        } catch (error) {
          console.error('Error fetching response count:', error);
        }
        
        // Track survey admin view event
        trackEvent('admin_survey_view', {
          details: { 
            survey_id: surveyId
          }
        });
      } catch (error) {
        console.error('Error fetching survey:', error);
        toast({
          title: 'Error',
          description: 'Failed to load survey details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSurvey();
  }, [surveyId, trackEvent]);
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/research/surveys')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Surveys
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{survey?.name || 'Untitled Survey'}</h1>
        </div>
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => router.push(`/admin/research/surveys/${surveyId}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button onClick={() => window.open(`/user-testing/preview/${surveyId}`, '_blank')}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Survey Details */}
      <SurveyDetails survey={survey} responseCount={responseCount} />

      {/* Survey management links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href={`/admin/research/surveys/${surveyId}/links`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link2 className="h-5 w-5 mr-2" />
                Survey Links
              </CardTitle>
              <CardDescription>
                Generate and manage unique survey distribution links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create personalized links for users to access this survey and track their responses.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${surveyId}/milestones`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Milestone className="h-5 w-5 mr-2" />
                Milestone Triggers
              </CardTitle>
              <CardDescription>
                Configure user actions that trigger this survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Set up specific milestone events that will prompt users to complete this survey.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${surveyId}/results`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Survey Results
              </CardTitle>
              <CardDescription>
                View and analyze survey responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore detailed analytics and individual responses to gain valuable insights.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${surveyId}/export`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download survey data for external analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Export response data in various formats for further processing and sharing.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 