'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
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
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SurveyDefinition {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  response_count: number;
  type: string;
  config?: any;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<SurveyDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/surveys');
        if (!response.ok) {
          throw new Error('Failed to fetch surveys');
        }
        const data = await response.json();
        setSurveys(data.surveys);
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading surveys...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="User Testing Surveys"
          description="Manage and view user testing surveys and their responses"
        />
        <Link href="/admin/surveys/create">
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      <div className="flex justify-end mb-6">
        <Link href="/admin/surveys/create">
          <Button>Create New Survey</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>
            View and manage all user testing surveys. Click on a survey to view detailed responses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all user testing surveys.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Survey ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No surveys found. Create your first survey to get started.
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">{survey.name}</TableCell>
                    <TableCell>{survey.id}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          survey.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                        }`}
                      >
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{survey.response_count}</TableCell>
                    <TableCell>{format(new Date(survey.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(survey.updated_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/surveys/${survey.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
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
    </div>
  );
}
