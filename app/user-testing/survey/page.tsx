import { Suspense } from 'react';
import SurveyList from './SurveyList';
import { Spinner } from '@/components/ui/spinner';

/**
 * Page for displaying available user testing surveys
 */
export default function SurveyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">User Testing Surveys</h1>
        <p className="text-lg text-muted-foreground">
          Help us improve withme.travel by completing these surveys. Your feedback is invaluable!
        </p>
      </div>
      
      <Suspense fallback={<div className="flex justify-center p-10"><Spinner size="lg" /></div>}>
        <SurveyList />
      </Suspense>
    </div>
  );
}

/**
 * Static metadata for the user testing survey page
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata = {
  title: 'User Testing Surveys | withme.travel',
  description: 'Participate in user testing surveys to help us build a better travel planning experience.',
};
