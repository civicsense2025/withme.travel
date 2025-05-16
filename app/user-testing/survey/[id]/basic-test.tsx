'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function BasicTest({ id }: { id: string }) {
  const [survey, setSurvey] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      try {
        // Get token from URL
        const token = searchParams?.get('token');
        console.log('BasicTest: Token from URL:', token ? 'present' : 'missing');

        if (!token) {
          throw new Error('No token available');
        }

        console.log('BasicTest: Fetching survey with ID:', id);
        const response = await fetch(`/api/forms/${id}?token=${token}`);
        console.log('BasicTest: API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('BasicTest: Survey data:', data);
        setSurvey(data.form);
      } catch (err: any) {
        console.error('BasicTest: Error fetching survey:', err);
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [id, searchParams]);

  if (loading) {
    return <div>Loading survey {id}...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>;
  }

  if (!survey) {
    return <div>No survey found</div>;
  }

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-md">
      <h2 className="text-3xl font-bold">{survey.name}</h2>
      <p className="text-gray-600 mt-2">{survey.description}</p>
      <div className="mt-4">
        <p><strong>ID:</strong> {survey.id}</p>
        <p><strong>Type:</strong> {survey.type}</p> 
        <p><strong>Active:</strong> {survey.is_active ? 'Yes' : 'No'}</p>
        <p><strong>Cohort:</strong> {survey.cohort}</p>
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Raw Data:</h3>
        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-sm">
          {JSON.stringify(survey, null, 2)}
        </pre>
      </div>
    </div>
  );
} 