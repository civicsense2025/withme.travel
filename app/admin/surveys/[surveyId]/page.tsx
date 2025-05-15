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
import { AlertCircle, ArrowLeft, Edit, Eye, FileDown, Pencil, Trash2, BarChart } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';

// Utilities and services
import { getBrowserClient } from '@/utils/supabase/browser-client';
import type { Survey as SurveyType, SurveyQuestion, QuestionType } from '@/types/research';
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
    fields: SurveyField[];
    // Other config properties
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  milestone_trigger?: string | null;
  milestones?: any | null;
  type: string;
  response_count: number;
}

interface SurveyResponse {
  id: string;
  form_id: string;
  user_id?: string;
  data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  session_id?: string;
}

interface SurveyPreviewModalProps {
  survey: SurveyType;
  onClose: () => void;
}

// Define SurveyField locally since it's not exported from types/research.ts
interface SurveyField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  order?: number;
  config?: Record<string, any>;
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
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================================
  // DATA FETCHING & HANDLERS
  // ============================================================================

  // Use React Query for data fetching - surveys
  const { 
    data: surveyData, 
    error: surveyError, 
    isLoading: surveyLoading 
  } = useQuery({
    queryKey: ['survey', params?.surveyId],
    queryFn: async () => {
      if (!params?.surveyId) throw new Error('Survey ID is required');
      
      try {
        const response = await fetch(`/api/admin/surveys/${params.surveyId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch survey details');
        }
        
        const data = await response.json();
        return data.survey;
      } catch (error) {
        console.error('Error fetching survey:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Use React Query for data fetching - responses
  const { 
    data: responsesData, 
    error: responsesError, 
    isLoading: responsesLoading 
  } = useQuery({
    queryKey: ['responses', params?.surveyId],
    queryFn: async () => {
      if (!params?.surveyId) throw new Error('Survey ID is required');
      
      try {
        const response = await fetch(`/api/admin/surveys/${params.surveyId}/responses`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch survey responses');
        }
        
        const data = await response.json();
        return data.responses;
      } catch (error) {
        console.error('Error fetching responses:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!surveyData, // Only fetch responses after survey data is loaded
  });

  /**
   * Exports survey responses to a CSV file
   */
  const exportResponsesToCSV = useCallback(() => {
    if (!survey || !responses.length) return;

    try {
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
      window.URL.revokeObjectURL(url); // Clean up
      
      toast({ 
        title: "Export successful", 
        description: `${rows.length} responses exported to CSV.`
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({ 
        title: "Export failed", 
        description: "Failed to export responses to CSV. Please try again.",
        variant: "destructive"
      });
    }
  }, [survey, responses, toast]);

  /**
   * Converts backend survey format to frontend Survey type
   */
  const getPreviewSurvey = useCallback((): SurveyType => {
    if (!survey) {
      throw new Error('Cannot create preview: Survey is null');
    }

    // Map backend survey format to frontend Survey type
    return {
      id: survey.id,
      title: survey.name,
      description: survey.description || undefined,
      type: 'survey',
      isActive: Boolean(survey.is_active),
      createdAt: survey.created_at,
      questions: (survey.config?.fields || []).map(
        (q: SurveyField): SurveyQuestion => ({
          id: q.id || String(Math.random()),
          surveyId: survey.id,
          text: q.label || 'Unnamed Question',
          type: (q.type as QuestionType) || 'text',
          options: q.options || [],
          required: q.required || false,
          order: q.order || 0,
          config: q.config || {},
        })
      ),
    };
  }, [survey]);

  /**
   * Handles deleting the survey with proper error handling
   */
  const handleDelete = async () => {
    if (!survey) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/surveys/${survey.id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete survey');
      }
      
      toast({ 
        title: 'Survey deleted', 
        description: 'The survey has been deleted successfully.' 
      });
      
      router.push('/admin/surveys');
    } catch (err) {
      console.error('Error deleting survey:', err);
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'An unknown error occurred', 
        variant: 'destructive' 
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

  // Update state from React Query data
  useEffect(() => {
    if (surveyData) {
      setSurvey(surveyData as SurveyDefinition);
    }
    if (responsesData) {
      setResponses(responsesData as SurveyResponse[]);
    }
  }, [surveyData, responsesData]);

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Loading state
  if (surveyLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <Progress className="w-40 mx-auto" value={surveyLoading ? 50 : 75} />
          <p className="text-muted-foreground">Loading survey details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (surveyError || responsesError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {surveyError instanceof Error 
              ? surveyError.message 
              : responsesError instanceof Error 
                ? responsesError.message 
                : 'An unknown error occurred'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/surveys')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
      </div>
    );
  }

  // Not found state
  if (!survey) {
    return (
      <div className="p-8">
        <Alert>
          <AlertTitle>Survey not found</AlertTitle>
          <AlertDescription>
            The requested survey could not be found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/admin/surveys')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
      </div>
    );
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

      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => router.push(`/admin/surveys/${survey.id}/edit`)}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit Survey
        </Button>
        
        <Button 
          onClick={() => setPreviewOpen(true)}
          variant="secondary"
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        
        <Button 
          variant="outline"
          className="gap-2"
          onClick={exportResponsesToCSV}
          disabled={!responses.length}
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
          <TabsTrigger value="responses" disabled={survey.response_count === 0}>
            Responses ({survey.response_count})
          </TabsTrigger>
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
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">No questions have been added to this survey yet.</p>
                  <Button 
                    onClick={() => router.push(`/admin/surveys/${survey.id}/edit`)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Add Questions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {survey.config.fields.map((field, index) => (
                    <Card key={field.id || index} className="overflow-hidden">
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
        
        <TabsContent value="responses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Responses</CardTitle>
              <CardDescription>
                {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No responses have been collected yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.slice(0, 10).map((response) => (
                        <TableRow key={response.id}>
                          <TableCell>{format(new Date(response.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                          <TableCell>{response.user_id || 'Anonymous'}</TableCell>
                          <TableCell>
                            <Badge variant={response.status === 'completed' ? 'default' : 'secondary'}>
                              {response.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {responses.length > 10 && (
                    <div className="p-4 text-center border-t">
                      <Button 
                        variant="link" 
                        onClick={() => router.push(`/admin/surveys/${survey.id}/responses`)}
                      >
                        View all {responses.length} responses
                      </Button>
                    </div>
                  )}
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

      {/* Survey Preview Modal */}
      {previewOpen && (
        <SurveyPreviewModal
          survey={getPreviewSurvey()}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
