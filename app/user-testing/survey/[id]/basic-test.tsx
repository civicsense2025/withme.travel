'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { getDevModeEnabled } from '../../survey/page-client';

export default function BasicTest({ id }: { id: string }) {
  const [survey, setSurvey] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [devMode, setDevMode] = useState<boolean>(getDevModeEnabled());

  // Monitor dev mode changes
  useEffect(() => {
    const checkDevMode = () => {
      const currentDevMode = getDevModeEnabled();
      if (currentDevMode !== devMode) {
        setDevMode(currentDevMode);
        // Reload data with new setting
        setLoading(true);
        setError(null); 
        setSurvey(null);
      }
    };
    
    // Check for changes when the component is visible
    const interval = setInterval(checkDevMode, 1000);
    window.addEventListener('storage', checkDevMode);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkDevMode);
    };
  }, [devMode]);

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      try {
        // DEV MODE: Use mock data
        if (devMode) {
          console.warn('BasicTest: DEV MODE - Using mock survey data');
          // Fake network delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Mock survey data
          const mockSurvey = {
            id,
            name: 'Development Test Survey',
            description: 'This is a mock survey for development testing',
            type: 'survey',
            is_active: true,
            cohort: 'dev-cohort',
            milestones: ['step1', 'step2', 'step3'],
            fields: [
              {
                id: 'q1',
                type: 'text',
                label: 'Sample Question 1',
                required: true,
                milestone: 'step1',
                description: 'This is a sample question'
              },
              {
                id: 'q2',
                type: 'select',
                label: 'Sample Question 2',
                options: ['Option 1', 'Option 2', 'Option 3'],
                required: false,
                milestone: 'step2',
                description: 'This is a sample select question'
              }
            ]
          };
          
          setSurvey(mockSurvey);
        } else {
          // PRODUCTION MODE: Fetch real data
          const token = searchParams?.get('token') || '';
          console.log('BasicTest: Fetching real survey data for ID:', id);
          
          // Add dev-mode header to control API behavior
          const headers = new Headers();
          headers.append('x-dev-mode', 'false');
          
          const response = await fetch(`/api/forms/${id}?token=${token}&dev-mode=false`, {
            headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch survey: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('BasicTest: Got real survey data:', data);
          setSurvey(data.form);
        }
        setError(null);
      } catch (err) {
        console.error('BasicTest: Error fetching survey:', err);
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSurvey();
  }, [id, searchParams, devMode]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
        
        {/* Display milestone information */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Milestones</h3>
          {Array.isArray(survey.milestones) ? (
            <ul className="list-disc pl-6 mt-2">
              {survey.milestones.map((milestone: string, index: number) => (
                <li key={`${milestone}-${index}`} className="text-blue-600">{milestone}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No milestones found!</p>
          )}
        </div>
        
        {/* Display fields/questions */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Fields/Questions</h3>
          {Array.isArray(survey.fields) && survey.fields.length > 0 ? (
            <div className="space-y-4 mt-2">
              {survey.fields.map((field: any, index: number) => (
                <div key={field.id || index} className="border p-3 rounded">
                  <p><strong>Question {index + 1}:</strong> {field.label}</p>
                  <p><strong>Type:</strong> {field.type}</p>
                  <p><strong>Milestone:</strong> {field.milestone || 'Not specified'}</p>
                  <p><strong>Required:</strong> {field.required ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-500">No fields/questions found!</p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Raw Data:</h3>
        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto text-sm max-h-80">
          {JSON.stringify(survey, null, 2)}
        </pre>
      </div>
    </div>
  );
} 