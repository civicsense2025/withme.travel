'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileDown,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SurveyDefinition {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  questions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  responses: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params?.surveyId as string;
  const responseId = params?.responseId as string;
  
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch survey definition and response data in parallel
        const [surveyRes, responseRes] = await Promise.all([
          fetch(`/api/admin/surveys/${surveyId}`),
          fetch(`/api/admin/surveys/${surveyId}/responses/${responseId}`)
        ]);

        if (!surveyRes.ok) {
          throw new Error('Failed to fetch survey definition');
        }
        if (!responseRes.ok) {
          throw new Error('Failed to fetch response data');
        }

        const surveyData = await surveyRes.json();
        const responseData = await responseRes.json();

        setSurvey(surveyData.survey);
        setResponse(responseData.response);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (surveyId && responseId) {
      fetchData();
    }
  }, [surveyId, responseId]);

  const navigateBack = () => {
    router.back();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading response data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Button variant="outline" onClick={navigateBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!survey || !response) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-lg">Response or survey not found</p>
          <Link href={`/admin/surveys/${surveyId}`}>
            <Button>Back to Survey</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the answer for a question
  const getAnswer = (questionId: string) => {
    const answer = response.responses[questionId];
    
    if (answer === undefined || answer === null) {
      return <span className="text-muted-foreground italic">No answer provided</span>;
    }
    
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    
    return answer.toString();
  };

  // Get a question by ID
  const getQuestion = (questionId: string) => {
    return survey.questions.find(q => q.id === questionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={navigateBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            heading="Survey Response"
            description={`Response details for ${survey.title}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/surveys/${surveyId}`}>
            <Button variant="outline" size="sm">
              Back to Survey
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Respondent info card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Respondent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-base">{response.name || 'Anonymous'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base">{response.email || 'No email provided'}</p>
            </div>
            
            {response.user_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <p className="text-sm font-mono">{response.user_id}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
              <p className="text-base">
                {response.source || 'Direct'}
              </p>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Submission ID</h3>
              <p className="text-sm font-mono">{response.id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Started At</h3>
              <p className="text-sm">
                {format(new Date(response.started_at), 'PPP p')}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Completed At</h3>
              {response.completed_at ? (
                <p className="text-sm">
                  {format(new Date(response.completed_at), 'PPP p')}
                </p>
              ) : (
                <Badge variant="secondary">Not Completed</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responses card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Survey Responses</CardTitle>
              <CardDescription>
                Answers provided by {response.name || 'the respondent'} 
                for {survey.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-medium">
                      {index + 1}. {question.text || question.title}
                    </h3>
                    <Badge variant="outline">{question.type}</Badge>
                  </div>
                  
                  {question.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {question.description}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Response:
                    </h4>
                    <div className="text-base p-2 bg-muted/50 rounded">
                      {getAnswer(question.id)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 