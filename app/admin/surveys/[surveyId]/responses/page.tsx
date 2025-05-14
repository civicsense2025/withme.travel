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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft, Eye, Download, FileDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
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

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface SurveyInfo {
  id: string;
  name: string;
}

export default function SurveyResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params?.surveyId as string || '';
  
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [survey, setSurvey] = useState<SurveyInfo | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = async (page: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}/responses?page=${page}&pageSize=${pagination.pageSize}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch responses');
      }
      
      const data = await response.json();
      setResponses(data.responses);
      setPagination(data.pagination);
      setSurvey(data.survey);
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (surveyId) {
      fetchResponses(1);
    }
  }, [surveyId]);

  const handlePageChange = (page: number) => {
    fetchResponses(page);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    
    if (totalPages <= 1) return null;
    
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    
    // Ensure we show at least 5 pages (or all if less than 5)
    if (endPage - startPage + 1 < 5) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }
    
    // Add first page
    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === page}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add last page
    if (endPage < totalPages) {
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pages}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const exportResponsesCSV = () => {
    if (!responses.length || !survey) return;
    
    // Extract all unique field keys from responses
    const allFields = new Set<string>();
    responses.forEach(response => {
      Object.keys(response.responses).forEach(key => allFields.add(key));
    });
    
    // Create headers
    const headers = ['ResponseID', 'UserID', 'Timestamp', ...Array.from(allFields)];
    
    // Create CSV rows
    const rows = responses.map(response => {
      const row: string[] = [
        response.id,
        response.user_id || 'Anonymous',
        response.created_at
      ];
      
      // Add each field value
      allFields.forEach(field => {
        const value = response.responses[field];
        row.push(value !== undefined ? String(value) : '');
      });
      
      return row;
    });
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${survey.name}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !responses.length) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive text-lg">Error: {error}</p>
          <Button onClick={() => router.push(`/admin/surveys/${surveyId}`)}>
            Back to Survey
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={survey ? `Responses: ${survey.name}` : 'Survey Responses'}
          description="View all responses collected for this survey"
        />
        <Button 
          variant="outline" 
          onClick={() => router.push(`/admin/surveys/${surveyId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Survey
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pagination.total} {pagination.total === 1 ? 'Response' : 'Responses'} Total
          </Badge>
          <Badge variant="outline">
            Page {pagination.page} of {pagination.totalPages || 1}
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={exportResponsesCSV}
          disabled={!responses.length}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableCaption>
              {responses.length === 0
                ? 'No responses have been collected for this survey yet.'
                : `A list of all responses for this survey. Page ${pagination.page} of ${pagination.totalPages || 1}.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Respondent</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Milestone</TableHead>
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {response.user?.avatar_url && (
                            <AvatarImage src={response.user.avatar_url} alt={response.user.name || "User"} />
                          )}
                          <AvatarFallback>
                            {response.user?.name 
                              ? getInitials(response.user.name)
                              : "??"
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{response.user?.name || "Anonymous User"}</div>
                          {response.user?.email && (
                            <div className="text-xs text-muted-foreground">
                              {response.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(response.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell>
                      {response.milestone ? (
                        <Badge variant="outline">
                          {response.milestone}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/surveys/${surveyId}/responses/${response.id}`)}
                        className="gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {renderPagination()}
    </div>
  );
}
