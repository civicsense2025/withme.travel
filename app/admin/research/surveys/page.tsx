'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Eye, Trash2, Link } from 'lucide-react';

// Define types for our survey data
interface Survey {
  id: string;
  name: string;
  description: string | null;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  response_count: number;
  config?: {
    fields?: any[];
  };
}

/**
 * Survey Management Admin Page
 * TODO: Implement survey list, create/edit form, and survey analytics
 */
export default function SurveyManagementPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch surveys
  const fetchSurveys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research/surveys');
      if (!response.ok) {
        throw new Error(`Failed to fetch surveys: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Handle response format from the updated API
      if (data.surveys && Array.isArray(data.surveys)) {
        setSurveys(data.surveys);
      } else if (Array.isArray(data)) {
        setSurveys(data);
      } else {
        throw new Error('Unexpected response format from API');
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load surveys';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Survey Management</h1>
        <Button onClick={() => router.push('/admin/research/surveys/create')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Survey
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>
            Manage surveys, forms, and user testing flows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                variant="outline"
                onClick={fetchSurveys}
              >
                Try Again
              </Button>
            </div>
          ) : surveys.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No surveys found</p>
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/research/surveys/create')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first survey
              </Button>
            </div>
          ) : (
            // Survey list
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      {survey.name || 'Untitled Survey'}
                    </TableCell>
                    <TableCell>{survey.type || 'general'}</TableCell>
                    <TableCell>
                      <Badge variant={survey.is_active ? "default" : "secondary"}>
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {survey.created_at ? new Date(survey.created_at).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {survey.response_count ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => router.push(`/admin/research/surveys/${survey.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => router.push(`/admin/research/surveys/${survey.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => router.push(`/admin/research/surveys/${survey.id}/links`)}
                          title="Generate unique links"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
