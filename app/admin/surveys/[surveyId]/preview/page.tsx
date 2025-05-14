'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Eye } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { SurveyQuestion } from '@/types/research';
import { SurveyPreviewModal } from '@/components/admin/SurveyPreviewModal';

interface SurveyPreview {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
}

export default function SurveyPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<SurveyPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const surveyId = typeof params?.surveyId === 'string' ? params.surveyId : '';

  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the preview API endpoint
        const response = await fetch(`/api/admin/surveys/${surveyId}/preview`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Survey not found');
          } else {
            throw new Error('Failed to fetch survey details');
          }
          return;
        }

        const data = await response.json();
        setSurvey(data.survey);

        // Automatically open the preview modal when survey is loaded
        setPreviewOpen(true);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('Failed to load survey preview');
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId]);

  const handleClosePreview = () => {
    setPreviewOpen(false);
    // Navigate back to the survey details page
    router.push(`/admin/surveys/${surveyId}`);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-base text-muted-foreground">Loading survey preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/surveys">
                <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Surveys
                </div>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>

        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Link href="/admin/surveys">
            <Button variant="default">Return to Surveys List</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/surveys">
              <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3 w-3" />
                Back to Surveys
              </div>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {survey && (
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/surveys/${surveyId}`}>
                <div className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {survey.title}
                </div>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </div>

      <PageHeader
        title="Survey Preview"
        description="View how this survey will appear to research participants"
      />

      <Card className="mt-6">
        <CardContent className="p-6">
          {survey ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">{survey.title}</h2>
              {survey.description && (
                <p className="text-muted-foreground mb-6">{survey.description}</p>
              )}
              <p className="mb-8">
                This survey contains {survey.questions.length} question
                {survey.questions.length !== 1 ? 's' : ''}.
              </p>
              <Button onClick={() => setPreviewOpen(true)} size="lg" className="mx-auto">
                <Eye className="mr-2 h-4 w-4" />
                Preview Survey
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Survey not available for preview.</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {survey && previewOpen && (
        <SurveyPreviewModal
          survey={{
            id: survey.id,
            title: survey.title,
            description: survey.description || undefined,
            questions: survey.questions,
            type: 'survey',
            isActive: survey.is_active,
            createdAt: new Date().toISOString(),
          }}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
}
