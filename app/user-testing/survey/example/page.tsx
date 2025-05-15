/**
 * Example Survey Page
 * 
 * A demonstration of the complete survey flow with mock data
 */

import { SurveyForm, Survey } from '@/components/research/SurveyForm';

/**
 * Example survey data to demonstrate the flow
 */
const EXAMPLE_SURVEY: Survey = {
  id: 'example-survey',
  title: 'User Experience Survey',
  description: 'Help us improve withme.travel by sharing your feedback about your experience using our platform.',
  questions: [
    {
      id: 'usage-frequency',
      text: 'How often do you use withme.travel?',
      type: 'radio',
      required: true,
      options: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'rarely', label: 'Rarely' },
        { value: 'first-time', label: 'This is my first time' }
      ]
    },
    {
      id: 'favorite-features',
      text: 'What features do you find most useful?',
      type: 'checkbox',
      required: false,
      options: [
        { value: 'trip-planning', label: 'Trip Planning' },
        { value: 'itinerary-builder', label: 'Itinerary Builder' },
        { value: 'destination-guides', label: 'Destination Guides' },
        { value: 'travel-map', label: 'Travel Map' },
        { value: 'collaborative-editing', label: 'Collaborative Editing' }
      ]
    },
    {
      id: 'satisfaction',
      text: 'On a scale of 1-5, how satisfied are you with withme.travel?',
      type: 'rating',
      required: true,
      min: 1,
      max: 5,
      description: '1 = Not satisfied at all, 5 = Extremely satisfied'
    },
    {
      id: 'improvement',
      text: 'What would you like us to improve?',
      type: 'textarea',
      required: false,
      placeholder: 'Please share any suggestions for improvement...'
    },
    {
      id: 'recommendation-likelihood',
      text: 'How likely are you to recommend withme.travel to a friend?',
      type: 'rating',
      required: true,
      min: 0,
      max: 10,
      description: '0 = Not at all likely, 10 = Extremely likely'
    }
  ]
};

/**
 * Example Survey Page
 */
export default function ExampleSurveyPage() {
  /**
   * Handle survey submission
   */
  async function handleSubmit(responses: Record<string, any>) {
    // In a real application, this would submit to an API
    console.log('Survey responses:', responses);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Promise.resolve();
  }
  
  return (
    <div className="container max-w-3xl mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Survey Example</h1>
      <SurveyForm 
        survey={EXAMPLE_SURVEY}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export const metadata = {
  title: 'Survey Example | withme.travel',
  description: 'Example of the withme.travel survey system'
}; 