'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Link2, 
  Milestone, 
  Pencil,
  Eye,
  BarChart3, 
  MessageSquare,
  Users,
  FileText,
  Share2
} from 'lucide-react';

export default function SurveyDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseCount, setResponseCount] = useState(0);
  
  useEffect(() => {
    async function fetchSurvey() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/research/surveys/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch survey');
        }
        
        const data = await response.json();
        setSurvey(data.survey);
        
        // Get response count
        const responseCountRes = await fetch(`/api/research/surveys/${params.id}/responses/count`);
        if (responseCountRes.ok) {
          const countData = await responseCountRes.json();
          setResponseCount(countData.count || 0);
        }
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
  }, [params.id]);
  
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
          <h1 className="text-2xl font-bold">{survey?.name || survey?.title || 'Untitled Survey'}</h1>
          <p className="text-muted-foreground">
            {survey?.status && (
              <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                {survey.status}
              </Badge>
            )}
            <span className="ml-2">Created {new Date(survey?.created_at).toLocaleDateString()}</span>
            <span className="ml-2">{responseCount} responses</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => router.push(`/admin/research/surveys/${params.id}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button onClick={() => window.open(`/user-testing/preview/${params.id}`, '_blank')}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Survey description */}
      {survey?.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{survey.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Survey management links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href={`/admin/research/surveys/${params.id}/links`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Link2 className="h-5 w-5 mr-2" />
                  Survey Links
                </CardTitle>
                <Badge variant="outline">{survey?.link_count || 0}</Badge>
              </div>
              <CardDescription>
                Generate and manage unique survey distribution links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create personalized links for users to access this survey and track their responses.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${params.id}/milestones`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Milestone className="h-5 w-5 mr-2" />
                  Milestone Triggers
                </CardTitle>
                <Badge variant="outline">{survey?.milestone_count || 0}</Badge>
              </div>
              <CardDescription>
                Configure user actions that trigger this survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Set up specific milestone events that will prompt users to complete this survey.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${params.id}/results`} className="block">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Survey Results
                </CardTitle>
                <Badge variant="outline">{responseCount}</Badge>
              </div>
              <CardDescription>
                View and analyze survey responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore detailed analytics and individual responses to gain valuable insights.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/admin/research/surveys/${params.id}/export`} className="block">
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

      {/* Survey content preview */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Content</CardTitle>
          <CardDescription>
            Preview of the survey questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {survey?.questions ? (
            <div className="space-y-4">
              {survey.questions.map((question: any, index: number) => (
                <div key={question.id || index} className="border rounded-md p-4">
                  <p className="font-medium">{index + 1}. {question.text}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Type: {question.type || 'Unknown'}
                  </p>
                  {question.options && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Options:</p>
                      <ul className="list-disc list-inside mt-1">
                        {question.options.map((option: any, optIndex: number) => (
                          <li key={optIndex} className="text-sm">
                            {typeof option === 'string' ? option : option.text || 'Unnamed option'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No questions available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 