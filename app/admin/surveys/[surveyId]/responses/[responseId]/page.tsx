'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Clock, CalendarIcon, User, FileDown } from 'lucide-react';

interface SurveyField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface SurveyResponse {
  id: string;
  form_id: string;
  user_id: string | null;
  session_id: string | null;
  responses: Record<string, any>;
  milestone: string | null;
  created_at: string;
  user: User | null;
}

interface Survey {
  id: string;
  name: string;
  description: string | null;
  fields: SurveyField[];
}

export default function ResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params?.surveyId as string || '';
  const responseId = params?.responseId as string || '';
  
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponseDetails = async () => {
      if (!surveyId || !responseId) return;
      
      setIsLoading(true);
      
      try {
        const res = await fetch(`/api/admin/surveys/${surveyId}/responses/${responseId}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch response details');
        }
        
        const data = await res.json();
        setResponse(data.response);
        setSurvey(data.survey);
      } catch (err) {
        console.error('Error fetching response details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponseDetails();
  }, [surveyId, responseId]);

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const exportResponseAsJSON = () => {
    if (!response || !survey) return;
    
    const dataToExport = {
      respondent: response.user ? {
        id: response.user_id,
        name: response.user.name,
        email: response.user.email
      } : {
        id: response.user_id || response.session_id,
        type: response.user_id ? 'Registered User' : 'Anonymous'
      },
      survey: {
        id: survey.id,
        name: survey.name
      },
      submittedAt: response.created_at,
      milestone: response.milestone,
      responses: response.responses
    };
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `response_${responseId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatResponseValue = (value: any, fieldType?: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">No response</span>;
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (fieldType === 'rating' && typeof value === 'number') {
      return '⭐'.repeat(value);
    }
    
    return String(value);
  };

  const renderResponseFields = () => {
    if (!response || !survey) return null;
    
    // Get fields from survey config
    const fields = survey.fields || [];
    
    return (
      <div className="space-y-6">
        {fields.map((field) => {
          const value = response.responses[field.id];
          
          return (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center">
                <div className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="ml-2 text-xs text-muted-foreground">
                  ({field.type})
                </div>
              </div>
              <div className="p-3 border rounded-md bg-muted/30">
                {formatResponseValue(value, field.type)}
              </div>
            </div>
          );
        })}
        
        {/* Display any additional responses not in the field config */}
        {Object.entries(response.responses).filter(
          ([key]) => !fields.some(field => field.id === key)
        ).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center">
              <div className="text-sm font-medium">{key}</div>
              <Badge variant="outline" className="ml-2">Custom Field</Badge>
            </div>
            <div className="p-3 border rounded-md bg-muted/30">
              {formatResponseValue(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading response details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => router.push(`/admin/surveys/${surveyId}/responses`)}>
            Back to Responses
          </Button>
        </div>
      </div>
    );
  }

  if (!response || !survey) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-lg">No response data found</p>
          <Button onClick={() => router.push(`/admin/surveys/${surveyId}/responses`)}>
            Back to Responses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Response Details"
          description={`Response to survey: ${survey.name}`}
        />
        <Button 
          variant="outline" 
          onClick={() => router.push(`/admin/surveys/${surveyId}/responses`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Responses
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Response Information</CardTitle>
            <CardDescription>Details about this survey submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Response ID</div>
              <div className="font-mono text-xs">{response.id}</div>
            </div>

            <Separator />
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" /> Submitted
              </div>
              <div>
                {format(new Date(response.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>

            {response.milestone && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Milestone</div>
                  <Badge>{response.milestone}</Badge>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <User className="mr-1 h-4 w-4" /> Respondent
              </div>
              {response.user ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {response.user.avatar_url && (
                      <AvatarImage src={response.user.avatar_url} alt={response.user.name || "User"} />
                    )}
                    <AvatarFallback>
                      {getInitials(response.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{response.user.name || "Unnamed User"}</div>
                    {response.user.email && (
                      <div className="text-xs text-muted-foreground">{response.user.email}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Anonymous Response</div>
              )}
            </div>

            {response.session_id && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Session ID</div>
                  <div className="font-mono text-xs">{response.session_id}</div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full gap-2"
              onClick={exportResponseAsJSON}
            >
              <FileDown className="h-4 w-4" />
              Export JSON
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Survey Responses</CardTitle>
            <CardDescription>
              Answers submitted for survey "{survey.name}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderResponseFields()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
