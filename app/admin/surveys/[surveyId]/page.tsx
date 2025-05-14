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
import { AlertCircle, ArrowLeft, Edit, Eye, FileDown } from 'lucide-react';

// Internal components
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
  survey_id: string; // This maps to the id field from the survey_definitions table
  title: string;
  description: string | null;
  questions: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SurveyResponse {
  id: string;
  participant_id: string;
  survey_id: string;
  answers: any[];
  created_at: string;
  user_id?: string;
  user_email?: string;
}

interface SurveyPreviewModalProps {
  survey: Survey;
  onClose: () => void;
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
  const supabase = getBrowserClient();

  // State management
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

      // Get survey and responses
      // Type assertion to unknown first to avoid TypeScript errors
      const surveysTable = 'surveys' as unknown;
      const { data, error } = await supabase
        .from(surveysTable as any)
        .select('*, survey_id:id')
        .eq('id', params.surveyId)
        .single();

      if (error) {
        throw error;
      }

      // Type guard to ensure data is a valid SurveyDefinition
      if (!data || typeof data !== 'object' || !('id' in data)) {
        throw new Error('Survey not found or invalid survey data');
      }

      // Cast to the expected type
      const surveyData = data as unknown as SurveyDefinition;
      setSurvey(surveyData);

      // Get responses using properly typed table constant
      const { data: responses, error: responsesError } = await supabase
        .from(TABLES.SURVEY_RESPONSES as any)
        .select('*, user_email:profiles(email), survey_id')
        .eq('survey_id', surveyData.survey_id);

      if (responsesError) throw responsesError;
      setResponses(responses as unknown as SurveyResponse[]);
    } catch (error: any) {
      console.error('Error loading survey:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [params?.surveyId, supabase]);

  /**
   * Exports survey responses to a CSV file
   */
  const exportResponsesToCSV = useCallback(() => {
    if (!survey || !responses.length) return;

    // Generate CSV headers
    const questions = survey.questions || [];
    let headers = ['Participant ID', 'User ID', 'Email', 'Date Submitted'];
    questions.forEach((q) => {
      headers.push(q.text || q.question || 'Unnamed Question');
    });

    // Generate row data
    const rows = responses.map((response) => {
      const row: any = {
        'Participant ID': response.participant_id,
        'User ID': response.user_id || 'N/A',
        Email: response.user_email || 'N/A',
        'Date Submitted': new Date(response.created_at).toLocaleString(),
      };

      // Add answers
      questions.forEach((question) => {
        const answer = response.answers.find((a) => a.question_id === question.id);
        row[question.text || question.question || 'Unnamed Question'] =
          answer?.value || 'Not answered';
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
    a.setAttribute('download', `survey_responses_${survey.title}.csv`);
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
      title: survey.title,
      description: survey.description || undefined,
      // Add required properties to fix type errors
      type: 'survey',
      isActive: Boolean(survey.is_active),
      createdAt: survey.created_at,
      // Convert the questions format to match SurveyQuestionType
      questions: (survey.questions || []).map(
        (q: any): SurveyQuestion => ({
          id: q.id || q.question_id || String(Math.random()),
          surveyId: survey.id,
          text: q.question || q.text || 'Unnamed Question',
          type: q.type || 'text',
          options: q.options || [],
          required: q.required || false,
          order: q.order || 0,
          config: q.config || {},
        })
      ),
    };
  }, [survey]);

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
    <div className="container py-8 space-y-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Surveys
      </Button>

      {/* Header section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
          <p className="text-muted-foreground">{survey.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Survey
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Survey
          </Button>
          <Button size="sm" onClick={exportResponsesToCSV} disabled={!responses.length}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Responses
          </Button>
        </div>
      </div>

      {/* Survey info cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Survey metadata card */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      survey.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                    }`}
                  >
                    {survey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Survey ID</dt>
                <dd className="text-sm font-medium">{survey.survey_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm">
                  {format(new Date(survey.created_at), 'MMM d, yyyy h:mm a')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm">
                  {format(new Date(survey.updated_at), 'MMM d, yyyy h:mm a')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Questions</dt>
                <dd className="text-sm">{survey.questions?.length || 0} questions</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Responses</dt>
                <dd className="text-sm">{responses.length} responses</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Survey statistics card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
            <CardDescription>Survey completion statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Responses</span>
                  <span className="font-medium">{responses.length}</span>
                </div>
                <Progress value={responses.length > 0 ? 100 : 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Questions</h3>
                <div className="grid gap-2">
                  {survey.questions?.map((question, index) => (
                    <div key={question.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate max-w-[250px]">
                          {index + 1}.{' '}
                          {question.question ||
                            question.question_text ||
                            question.text ||
                            'Unnamed Question'}
                        </span>
                        <span>
                          {question.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responses table */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
          <CardDescription>All responses collected for this survey</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {responses.length > 0
                ? `A list of all responses to the "${survey.title}" survey.`
                : 'No responses have been collected for this survey yet.'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Participant ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No responses have been collected for this survey yet.
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.participant_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {response.user_id ? response.user_id.substring(0, 8) + '...' : 'N/A'}
                    </TableCell>
                    <TableCell>{response.user_email || 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(response.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {survey && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Edit Survey</DialogTitle>
            <div className="py-6">
              <p className="text-muted-foreground">
                Survey editing functionality is not yet implemented.
              </p>
            </div>
            <Button onClick={() => setEditOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Modal */}
      {survey && previewOpen && (
        <SurveyPreviewModal survey={getPreviewSurvey()} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
