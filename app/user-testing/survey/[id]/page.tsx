import { Suspense } from 'react';
import SurveyDetail from './SurveyDetail';
import BasicTest from './basic-test';
import { Spinner } from '@/components/ui/spinner';

export const metadata = {
  title: 'User Testing Survey | withme.travel',
  description: 'Complete this survey to help us improve withme.travel',
};

/**
 * Page for displaying a specific survey by ID
 */
export default function SurveyDetailPage({ params, searchParams }: { 
  params: { id: string },
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  console.log('SurveyDetailPage: Rendering with ID:', params.id); // Add server-side log
  console.log('SurveyDetailPage: Search params:', searchParams); // Log search params

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Survey: {params.id}</h1>
      
      <div className="mb-8">
        <Suspense fallback={<div className="flex justify-center p-10 min-h-[200px]"><Spinner size="lg" /></div>}>
          <SurveyDetail id={params.id} />
        </Suspense>
      </div>
    </div>
  );
} 