'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  BarChart, 
  Calendar, 
  Edit, 
  FileDown, 
  FileText, 
  Users 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Progress } from '@/components/ui/progress';

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
  responses: any;
  started_at: string;
  completed_at: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export default function SurveyDetailPage() {
  const params = useParams();
  const surveyId = params?.surveyId as string;
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgCompletionTimeSeconds: 0,
    dropOffRate: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchSurveyData = async () => {
      setIsLoading(true);
      try {
        const [surveyResponse, responsesResponse] = await Promise.all([
          fetch(`/api/admin/surveys/${surveyId}`),
          fetch(`/api/admin/surveys/${surveyId}/responses`)
        ]);

        if (!surveyResponse.ok) {
          throw new Error('Failed to fetch survey details');
        }
        if (!responsesResponse.ok) {
          throw new Error('Failed to fetch survey responses');
        }

        const surveyData = await surveyResponse.json();
        const responsesData = await responsesResponse.json();

        setSurvey(surveyData.survey);
        setResponses(responsesData.responses);

        // Calculate stats if there are responses
        if (responsesData.responses.length > 0) {
          calculateStats(responsesData.responses, surveyData.survey);
        }
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId]);

  const calculateStats = (responseData: SurveyResponse[], surveyData: SurveyDefinition) => {
    // Calculate completion rate
    const completedResponses = responseData.filter(r => r.completed_at);
    const completionRate = (completedResponses.length / responseData.length) * 100;
    const dropOffRate = 100 - completionRate;

    // Calculate average completion time (in seconds)
    let totalCompletionTime = 0;
    let count = 0;
    completedResponses.forEach(response => {
      if (response.started_at && response.completed_at) {
        const startTime = new Date(response.started_at).getTime();
        const endTime = new Date(response.completed_at).getTime();
        const durationSeconds = (endTime - startTime) / 1000;
        
        // Only count reasonable durations (less than 1 hour)
        if (durationSeconds > 0 && durationSeconds < 3600) {
          totalCompletionTime += durationSeconds;
          count++;
        }
      }
    });

    const avgCompletionTimeSeconds = count > 0 ? Math.round(totalCompletionTime / count) : 0;

    setStats({
      avgCompletionTimeSeconds,
      dropOffRate,
      completionRate
    });
  };

  // Get aggregated responses for each question
  const getQuestionStats = (questionId: string) => {
    const question = survey?.questions.find(q => q.id === questionId);
    if (!question) return null;

    const allAnswers = responses
      .filter(r => r.responses && r.responses[questionId] !== undefined)
      .map(r => r.responses[questionId]);

    const totalResponses = allAnswers.length;
    
    if (totalResponses === 0) {
      return { totalResponses: 0, data: [] };
    }

    // Handle different question types
    switch (question.type) {
      case 'multiple_choice':
      case 'checkbox':
      case 'dropdown':
        const options = question.options || [];
        const counts: Record<string, number> = {};
        
        // Initialize all options with 0 count
        options.forEach((opt: any) => {
          const optionValue = typeof opt === 'string' ? opt : (opt.value || opt.text);
          counts[optionValue] = 0;
        });
        
        // Count responses
        allAnswers.forEach(answer => {
          if (Array.isArray(answer)) {
            // Multiple selections (checkbox)
            answer.forEach(a => {
              if (counts[a] !== undefined) counts[a]++;
            });
          } else {
            // Single selection
            if (counts[answer] !== undefined) counts[answer]++;
          }
        });
        
        // Convert to percentage data
        const optionData = Object.entries(counts).map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / totalResponses) * 100)
        }));
        
        return { totalResponses, data: optionData };
        
      case 'rating':
      case 'scale':
        // For numeric ratings, calculate average
        const numericAnswers = allAnswers.filter(a => !isNaN(Number(a)));
        const sum = numericAnswers.reduce((sum, val) => sum + Number(val), 0);
        const average = numericAnswers.length > 0 ? sum / numericAnswers.length : 0;
        
        // Create distribution of ratings
        const ratings: Record<string, number> = {};
        numericAnswers.forEach(answer => {
          ratings[answer] = (ratings[answer] || 0) + 1;
        });
        
        const ratingData = Object.entries(ratings).map(([rating, count]) => ({
          label: rating,
          count,
          percentage: Math.round((count / numericAnswers.length) * 100)
        }));
        
        return { 
          totalResponses, 
          average: average.toFixed(1),
          data: ratingData 
        };
        
      default:
        // For text inputs, just return count of responses
        return { 
          totalResponses,
          data: [] 
        };
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min${minutes !== 1 ? 's' : ''} ${remainingSeconds} sec${remainingSeconds !== 1 ? 's' : ''}`;
  };

  const exportResponsesToCSV = () => {
    if (!survey || !responses.length) return;

    // Create headers based on questions plus metadata
    const allQuestions = survey.questions.map(q => q.text || q.title || `Question ${q.id}`);
    const headers = ['Response ID', 'Name', 'Email', 'Timestamp', ...allQuestions];

    // Create rows for each response
    const rows = responses.map(response => {
      const responseData = response.responses;
      const responseCells = survey.questions.map(question => {
        const answer = responseData[question.id];
        if (Array.isArray(answer)) {
          return answer.join(', ');
        }
        return answer || '';
      });

      return [
        response.id,
        response.name || '',
        response.email || '',
        response.completed_at 
          ? format(new Date(response.completed_at), 'yyyy-MM-dd HH:mm:ss')
          : '',
        ...responseCells
      ];
    });

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell).replace(/"/g, '""');
        return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
      }).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.title.replace(/\s+/g, '_')}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-lg">Survey not found</p>
          <Link href="/admin/surveys">
            <Button>Back to Surveys</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-2">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/surveys">
            <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Back to Surveys
            </div>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <PageHeader
          heading={survey.title}
          description={survey.description || 'No description provided'}
        />
        <div className="flex items-center gap-2">
          <Link href={`/admin/surveys/${surveyId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Survey
            </Button>
          </Link>
          <Button 
            size="sm"
            onClick={exportResponsesToCSV}
            disabled={!responses.length}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Responses
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Survey Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant={survey.is_active ? "default" : "secondary"}>
                {survey.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Survey ID</h3>
              <p className="font-mono text-sm">{survey.survey_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="text-sm">{format(new Date(survey.created_at), 'PPP p')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="text-sm">{format(new Date(survey.updated_at), 'PPP p')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Questions</h3>
              <p className="text-sm">{survey.questions.length} questions</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Responses</h3>
              <p className="text-sm">{responses.length} total responses</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">
                <BarChart className="mr-2 h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="responses">
                <Users className="mr-2 h-4 w-4" />
                Responses ({responses.length})
              </TabsTrigger>
              <TabsTrigger value="questions">
                <FileText className="mr-2 h-4 w-4" />
                Questions ({survey.questions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Performance</CardTitle>
                  <CardDescription>
                    Key metrics about this survey's responses and completion rates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {responses.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No responses collected yet. Stats will appear when users complete the survey.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{responses.length}</div>
                            <p className="text-xs text-muted-foreground">Total Responses</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              {stats.avgCompletionTimeSeconds ? formatTime(stats.avgCompletionTimeSeconds) : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">Avg. Completion Time</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
                            <p className="text-xs text-muted-foreground">Completion Rate</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Completion Rate</h3>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Completed ({Math.round(stats.completionRate)}%)</span>
                            <span>Abandoned ({Math.round(stats.dropOffRate)}%)</span>
                          </div>
                          <Progress value={stats.completionRate} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Response Summary by Question</h3>
                        <div className="space-y-6">
                          {survey.questions.map((question, index) => {
                            const questionStats = getQuestionStats(question.id);
                            return (
                              <div key={question.id} className="border p-4 rounded-md">
                                <h4 className="font-medium mb-2">
                                  {index + 1}. {question.text || question.title}
                                </h4>
                                <div className="text-xs text-muted-foreground mb-3">
                                  {questionStats?.totalResponses || 0} responses
                                </div>
                                
                                {questionStats?.average && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium">Average: </span>
                                    <span>{questionStats.average}</span>
                                  </div>
                                )}
                                
                                {questionStats?.data && questionStats.data.length > 0 ? (
                                  <div className="space-y-2">
                                    {questionStats.data.map((item, i) => (
                                      <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span>{item.label}</span>
                                          <span className="text-muted-foreground">
                                            {item.count} ({item.percentage}%)
                                          </span>
                                        </div>
                                        <Progress value={item.percentage} />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    {question.type === 'text' || question.type === 'textarea' 
                                      ? 'Text responses available in the detailed view' 
                                      : 'No data available for this question'}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="responses" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Responses</CardTitle>
                  <CardDescription>
                    All responses collected for this survey.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>
                      {responses.length 
                        ? `Showing ${responses.length} responses` 
                        : 'No responses collected yet'
                      }
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Respondent</TableHead>
                        <TableHead>Completed At</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No responses have been collected for this survey yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        responses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell>
                              <div className="font-medium">
                                {response.name || 'Anonymous'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {response.email || 'No email provided'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {response.completed_at 
                                ? <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                                    {format(new Date(response.completed_at), 'MMM d, yyyy p')}
                                  </div>
                                : <span className="text-muted-foreground text-sm">Not completed</span>
                              }
                            </TableCell>
                            <TableCell>
                              {response.source || 'Direct'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/admin/surveys/${surveyId}/responses/${response.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Survey Questions</CardTitle>
                  <CardDescription>
                    All questions in this survey.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
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
                        {question.options && question.options.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Options:</h4>
                            <ul className="space-y-1">
                              {question.options.map((option: any, optIndex: number) => (
                                <li key={optIndex} className="text-sm">
                                  {option.text || option.value || option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {question.required && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="mt-2">Required</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 