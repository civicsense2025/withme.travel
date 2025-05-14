'use client';

// ============================================================================
// IMPORTS & MODULE SETUP
// ============================================================================

/**
 * Admin Survey Page - Imports
 *
 * This section imports all required dependencies for the admin survey page,
 * following withme.travel's import organization and architectural standards.
 */

// External dependencies
import React, { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Edit, Eye, FileDown, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ResearchModal } from '@/components/research/ResearchModal';
import { PageHeader } from '@/components/page-header';
import {
  BarChart,
} from 'lucide-react';

// Utilities and services
import { getBrowserClient } from '@/utils/supabase/browser-client';
import type { Survey, SurveyQuestion } from '@/types/research';
import { TABLES } from '@/utils/constants/database';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type definitions for survey data structures
 */
interface SurveyDefinition {
  id: string;
  name: string;
  description: string | null;
  config: {
    fields: any[];
    // Other config properties
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  milestone_trigger?: string | null;
  milestones?: any | null;
  type: string;
}

interface SurveyResponse {
  id: string;
  form_id: string;
  user_id?: string;
  data: any;
  status: string;
  created_at: string;
  updated_at: string;
  session_id?: string;
}

interface SurveyPreviewModalProps {
  survey: Survey;
  onClose: () => void;
}

interface SurveyField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Survey {
  id: string;
  name: string;
  description: string | null;
  type: string;
  config: {
    fields: SurveyField[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  response_count: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * SurveyPreviewModal Component
 *
 * Displays a preview of the survey with all questions and answer options
 */
function SurveyPreviewModal({ survey, onClose }: SurveyPreviewModalProps) {
  return (
    <ResearchModal survey={survey} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <h2 className="text-xl font-bold mb-2">{survey.title}</h2>
        {survey.description && <p className="text-gray-600 mb-4">{survey.description}</p>}

        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="border p-4 rounded-lg">
              <div className="font-medium">
                {index + 1}. {question.text}
                {question.required && <span className="text-red-500">*</span>}
              </div>

              {question.type === 'text' && (
                <div className="mt-2">
                  <input
                    type="text"
                    disabled
                    className="w-full p-2 border rounded"
                    placeholder="Text input"
                  />
                </div>
              )}

              {question.type === 'select' && (
                <div className="mt-2">
                  <select disabled className="w-full p-2 border rounded">
                    <option>Select an option...</option>
                    {question.options?.map((option: any) => (
                      <option key={option.value || option}>{option.label || option}</option>
                    ))}
                  </select>
                </div>
              )}

              {question.type === 'radio' && (
                <div className="mt-2 space-y-2">
                  {question.options?.map((option: any) => (
                    <div key={option.value || option} className="flex items-center">
                      <input type="radio" disabled className="mr-2" />
                      <label>{option.label || option}</label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'checkbox' && (
                <div className="mt-2 space-y-2">
                  {question.options?.map((option: any) => (
                    <div key={option.value || option} className="flex items-center">
                      <input type="checkbox" disabled className="mr-2" />
                      <label>{option.label || option}</label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'rating' && (
                <div className="mt-2 flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div
                      key={rating}
                      className="w-8 h-8 flex items-center justify-center border rounded cursor-default"
                    >
                      {rating}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ResearchModal>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * SurveyDetailPage Component
 *
 * Main page component for survey details and management
 */
export default function SurveyDetailPage() {
  // Hooks and state setup
  const params = useParams<{ surveyId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = getBrowserClient();

  // State management
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================================
  // DATA FETCHING & HANDLERS
  // ============================================================================

  /**
   * Fetches survey data and responses from Supabase
   */
  const fetchSurveyData = useCallback(async () => {
    if (!params?.surveyId) return;

    try {
      setLoading(true);

      // Fetch survey data from API
      const surveyResponse = await fetch(`/api/admin/surveys/${params.surveyId}`);
      
      if (!surveyResponse.ok) {
        throw new Error('Failed to fetch survey details');
      }
      
      const { survey: surveyData } = await surveyResponse.json();
      setSurvey(surveyData);

      // Fetch responses
      const responsesResponse = await fetch(`/api/admin/surveys/${params.surveyId}/responses`);
      
      if (!responsesResponse.ok) {
        throw new Error('Failed to fetch survey responses');
      }
      
      const { responses: responseData } = await responsesResponse.json();
      setResponses(responseData);
    } catch (error: any) {
      console.error('Error loading survey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [params?.surveyId]);

  /**
   * Exports survey responses to a CSV file
   */
  const exportResponsesToCSV = useCallback(() => {
    if (!survey || !responses.length) return;

    // Generate CSV headers
    const questions = survey.config?.fields || [];
    let headers = ['Response ID', 'User ID', 'Date Submitted'];
    questions.forEach((q) => {
      headers.push(q.label || 'Unnamed Question');
    });

    // Generate row data
    const rows = responses.map((response) => {
      const row: any = {
        'Response ID': response.id,
        'User ID': response.user_id || 'N/A',
        'Date Submitted': new Date(response.created_at).toLocaleString(),
      };

      // Add answers from the data field
      const responseData = response.data || {};
      questions.forEach((question, index) => {
        const questionId = question.id || index.toString();
        row[question.label || 'Unnamed Question'] = responseData[questionId] || 'Not answered';
      });

      return row;
    });

    // Convert to CSV
    const replacer = (key: string, value: any) => (value === null ? '' : value);
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
      ),
    ].join('\r\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `survey_responses_${survey.name}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [survey, responses]);

  /**
   * Converts backend survey format to frontend Survey type
   */
  const getPreviewSurvey = useCallback((): Survey => {
    if (!survey) {
      throw new Error('Cannot create preview: Survey is null');
    }

    return {
      id: survey.id,
      title: survey.name,
      description: survey.description || undefined,
      // Add required properties to fix type errors
      type: 'survey',
      isActive: Boolean(survey.is_active),
      createdAt: survey.created_at,
      // Convert the questions format to match SurveyQuestionType
      questions: (survey.config?.fields || []).map(
        (q: any, index: number): SurveyQuestion => ({
          id: q.id || String(index),
          surveyId: survey.id,
          text: q.label || 'Unnamed Question',
          type: q.type || 'text',
          options: q.options || [],
          required: q.required || false,
          order: q.order || index,
          config: q.config || {},
        })
      ),
    };
  }, [survey]);

  const handleDelete = async () => {
    if (!survey) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/surveys/${survey.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete survey');
      }
      
      toast({
        title: 'Survey deleted',
        description: 'The survey has been deleted successfully.',
      });
      
      router.push('/admin/surveys');
    } catch (err) {
      console.error('Error deleting survey:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      text: 'Text (Short Answer)',
      textarea: 'Text Area (Long Answer)',
      select: 'Dropdown',
      radio: 'Multiple Choice (Single)',
      checkbox: 'Multiple Choice (Multiple)',
      rating: 'Rating',
    };
    
    return typeMap[type] || type;
  };

  // Effect to fetch data on component mount or surveyId change
  useEffect(() => {
    if (params?.surveyId) {
      fetchSurveyData();
    }
  }, [params?.surveyId, fetchSurveyData]);

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Loading state
  if (loading) {
    return <div className="p-8">Loading survey details...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found state
  if (!survey) {
    return <div className="p-8">Survey not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={survey.name}
          description={survey.description || 'No description provided'}
        />
        <Button variant="outline" onClick={() => router.push('/admin/surveys')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant={survey.is_active ? 'default' : 'secondary'}>
          {survey.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="outline">
          {survey.response_count} {survey.response_count === 1 ? 'Response' : 'Responses'}
        </Badge>
        <Badge variant="outline">
          Created: {format(new Date(survey.created_at), 'MMM d, yyyy')}
        </Badge>
        <Badge variant="outline">
          Last Updated: {format(new Date(survey.updated_at), 'MMM d, yyyy')}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => router.push(`/admin/surveys/${survey.id}/edit`)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit Survey
        </Button>
        
        <Button 
          onClick={() => router.push(`/admin/surveys/${survey.id}/responses`)}
          variant="secondary"
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View Responses
        </Button>
        
        <Button 
          variant="outline"
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export Data
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="gap-2 ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Survey</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this survey? This action cannot be undone.
                {survey.response_count > 0 && (
                  <p className="mt-2 font-medium text-destructive">
                    Warning: This survey has {survey.response_count} responses. Deleting it will also delete all responses.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="analytics" disabled={survey.response_count === 0}>
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Questions</CardTitle>
              <CardDescription>
                {survey.config.fields.length} {survey.config.fields.length === 1 ? 'question' : 'questions'} in this survey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {survey.config.fields.length === 0 ? (
                <p className="text-muted-foreground">No questions in this survey.</p>
              ) : (
                <div className="space-y-4">
                  {survey.config.fields.map((field, index) => (
                    <Card key={field.id} className="overflow-hidden">
                      <CardHeader className="py-3 bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {index + 1}. {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getFieldTypeLabel(field.type)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      {field.options && field.options.length > 0 && (
                        <CardContent className="py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Options:</p>
                            <ul className="text-sm pl-5 list-disc">
                              {field.options.map((option, i) => (
                                <li key={i}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Analytics</CardTitle>
              <CardDescription>
                Response data and insights for this survey
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Analytics dashboard will be available here in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
