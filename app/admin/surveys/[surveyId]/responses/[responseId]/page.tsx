'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarIcon, UserIcon, AtSign, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
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
    async function fetchData() {
      if (!surveyId || !responseId) return;

      setIsLoading(true);
      try {
        // Fetch survey definition and response in parallel
        const [surveyRes, responseRes] = await Promise.all([
          fetch(`/api/admin/surveys/${surveyId}`),
          fetch(`/api/admin/surveys/${surveyId}/responses/${responseId}`),
        ]);

        if (!surveyRes.ok) {
          throw new Error('Failed to fetch survey definition');
        }

        if (!responseRes.ok) {
          throw new Error('Failed to fetch survey response');
        }

        const surveyData = await surveyRes.json();
        const responseData = await responseRes.json();

        setSurvey(surveyData.survey);
        setResponse(responseData.response);
      } catch (err) {
        console.error('Error fetching response details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [surveyId, responseId]);

  const calculateDuration = () => {
    if (!response?.started_at || !response?.completed_at) return 'N/A';

    const startTime = new Date(response.started_at).getTime();
    const endTime = new Date(response.completed_at).getTime();
    const durationMs = endTime - startTime;

    if (durationMs < 60000) {
      return `${Math.round(durationMs / 1000)} seconds`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.round((durationMs % 60000) / 1000);
      return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
    }
  };

  const formatResponseValue = (value: any, questionType: string) => {
    if (value === undefined || value === null) return 'Not answered';

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  };

  const getOptionLabel = (questionId: string, value: string): string => {
    if (!survey) return value;

    const question = survey.questions.find((q) => q.id === questionId);
    if (!question || !question.options) return value;

    const option = question.options.find((opt: any) => opt.value === value || opt.id === value);

    return option ? option.label || value : value;
  };

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

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!survey || !response) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-lg">Response not found</p>
          <Link href={`/admin/surveys/${surveyId}`}>
            <Button>Back to Survey</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-2">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/surveys">Surveys</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/admin/surveys/${surveyId}`}>{survey.title}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/admin/surveys/${surveyId}/responses`}>Responses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>Response Details</BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <PageHeader title="Response Details" description={`For ${survey.title}`} />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Respondent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4 mr-2" />
                Name
              </div>
              <p className="font-medium">{response.name || 'Anonymous'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <AtSign className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="font-medium">{response.email || 'Not provided'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Submitted
              </div>
              <p className="font-medium">
                {response.completed_at
                  ? format(new Date(response.completed_at), 'PPP p')
                  : 'Not completed'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Status
              </div>
              <Badge variant={response.completed_at ? 'default' : 'secondary'}>
                {response.completed_at ? 'Completed' : 'Incomplete'}
              </Badge>
            </div>

            {response.completed_at && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completion Time</p>
                <p className="font-medium">{calculateDuration()}</p>
              </div>
            )}

            {response.source && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{response.source}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {survey.questions.map((question, index) => {
                  const responseValue = response.responses[question.id];

                  return (
                    <li key={question.id} className="space-y-2">
                      <div className="flex items-start">
                        <span className="text-muted-foreground mr-2">{index + 1}.</span>
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{question.text}</p>
                          {question.description && (
                            <p className="text-sm text-muted-foreground">{question.description}</p>
                          )}
                        </div>
                        {question.required && (
                          <Badge variant="outline" className="ml-2">
                            Required
                          </Badge>
                        )}
                      </div>

                      <div className="pl-6 mt-2">
                        <Separator className="mb-2" />

                        {/* Format based on question type */}
                        {responseValue === undefined || responseValue === null ? (
                          <p className="text-muted-foreground italic">Not answered</p>
                        ) : question.type === 'radio' ? (
                          <p className="py-1 px-2 bg-muted rounded-md inline-block">
                            {getOptionLabel(question.id, responseValue)}
                          </p>
                        ) : question.type === 'checkbox' && Array.isArray(responseValue) ? (
                          <div className="space-y-1">
                            {responseValue.length > 0 ? (
                              responseValue.map((val, i) => (
                                <p
                                  key={i}
                                  className="py-1 px-2 bg-muted rounded-md inline-block mr-2"
                                >
                                  {getOptionLabel(question.id, val)}
                                </p>
                              ))
                            ) : (
                              <p className="text-muted-foreground italic">No options selected</p>
                            )}
                          </div>
                        ) : question.type === 'textarea' ? (
                          <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                            {responseValue}
                          </div>
                        ) : (
                          <p className="py-1 px-2 bg-muted rounded-md">
                            {formatResponseValue(responseValue, question.type)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
