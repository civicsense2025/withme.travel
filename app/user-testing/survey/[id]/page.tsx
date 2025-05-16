import { Suspense } from 'react';
import SurveyDetail from './SurveyDetail';
import { Spinner } from '@/components/ui/spinner';

export const metadata = {
  title: 'User Testing Survey | withme.travel',
  description: 'Complete this survey to help us improve withme.travel',
};

/**
 * Page for displaying a specific survey by ID
 */
export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-12 px-4">
      <Suspense fallback={<div className="flex justify-center p-10"><Spinner size="lg" /></div>}>
        <SurveyDetail id={params.id} />
      </Suspense>
    </div>
  );
} 