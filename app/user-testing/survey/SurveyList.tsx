'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SurveyGrid, Survey } from './SurveyGrid';
import { useSearchParams, useRouter } from 'next/navigation';
import DevModeControls from './DevModeControls';

/**
 * Component that displays a list of available surveys for user testing
 */
export default function SurveyList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      setError(null);
      setSurveys([]);
      
      try {
        // Fetch surveys directly from /api/forms
        console.log('SurveyList: Fetching surveys');
        const response = await fetch('/api/forms');
        if (!response.ok) throw new Error('Failed to fetch surveys');
        const data = await response.json();
        setSurveys(data.forms || []);
        console.log('SurveyList: Loaded surveys:', data.forms?.length || 0);
      } catch (err) {
        console.error('SurveyList: Error loading surveys:', err);
        setError('Failed to load surveys');
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="mr-2" />
        <span>Loading available surveys...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No surveys available</h3>
        <p className="text-muted-foreground">
          There are no surveys available at the moment. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {process.env.NODE_ENV !== 'production' && <DevModeControls />}
      <h1 className="text-2xl font-bold mb-4">Available Surveys</h1>
      <div className="space-y-6">
        <SurveyGrid surveys={surveys} />
      </div>
    </div>
  );
} 