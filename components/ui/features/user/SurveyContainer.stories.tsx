import type { Meta, StoryObj } from '@storybook/react';
import { SurveyContainer } from '@/components/ui/atoms/SurveyContainer';
import { action } from '@storybook/addon-actions';

// Mock the useSurvey hook
jest.mock('@/hooks/use-survey', () => ({
  useSurvey: () => ({
    submitSurveyResponse: async () => {
      action('submitSurveyResponse')();
      return { success: true };
    },
    trackEvent: async () => {
      action('trackEvent')();
      return { success: true };
    },
    submitting: false,
  }),
}));

/**
 * `SurveyContainer` is a multi-step container for user testing and research flows.
 * It manages the full survey experience from welcome screen to completion.
 */
const meta: Meta<typeof SurveyContainer> = {
  title: 'UI/Features/user/SurveyContainer',
  component: SurveyContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SurveyContainer>;

// Mock survey data
const mockSurvey = {
  id: 'survey-1',
  name: 'Product Feedback Survey',
  description: 'Help us improve your experience with withme.travel',
  type: 'feedback',
  is_active: true,
  config: {
    fields: [
      {
        id: 'q1',
        label: 'How satisfied are you with our service?',
        type: 'radio',
        required: true,
        milestone: 'satisfaction',
        options: [
          { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
          { value: 'dissatisfied', label: 'Dissatisfied' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'satisfied', label: 'Satisfied' },
          { value: 'very-satisfied', label: 'Very Satisfied' },
        ],
      },
      {
        id: 'q2',
        label: 'What features do you use most often?',
        type: 'select',
        required: true,
        milestone: 'satisfaction',
        options: [
          { value: 'trip-planning', label: 'Trip Planning' },
          { value: 'itinerary-sharing', label: 'Itinerary Sharing' },
          { value: 'destination-discovery', label: 'Destination Discovery' },
          { value: 'group-collaboration', label: 'Group Collaboration' },
        ],
      },
      {
        id: 'q3',
        label: 'Would you recommend our service to others?',
        type: 'rating',
        required: true,
        milestone: 'recommendation',
        min: 0,
        max: 10,
        description: '0 = Not at all likely, 10 = Extremely likely',
      },
      {
        id: 'q4',
        label: 'Any additional feedback for us?',
        type: 'textarea',
        required: false,
        milestone: 'recommendation',
        placeholder: 'Your thoughts here...',
      },
    ],
  },
  created_at: '2025-01-01T00:00:00Z',
};

/**
 * Default survey container with multi-step flow
 */
export const Default: Story = {
  args: {
    survey: mockSurvey,
    sessionId: 'session-123',
    onComplete: action('Survey Completed'),
  },
};

/**
 * A single-milestone survey
 */
export const SingleMilestoneSurvey: Story = {
  args: {
    survey: {
      ...mockSurvey,
      name: 'Quick Feedback',
      description: 'A quick single-step feedback form',
      config: {
        fields: mockSurvey.config.fields.filter(
          (field) => field.milestone === 'satisfaction'
        ),
      },
    },
    sessionId: 'session-123',
    onComplete: action('Single-Milestone Survey Completed'),
  },
};

/**
 * A simple implementation without mocking, for documentation purposes.
 * Note: This will not function in Storybook without proper API implementation.
 */
export const Implementation: Story = {
  parameters: {
    docs: {
      source: {
        code: `
// Usage in a page or component
import { SurveyContainer } from '@/components/research/SurveyContainer';
import { useParams } from 'next/navigation';
import { useSurveyLoader } from '@/hooks/use-survey-loader';

export default function SurveyPage() {
  const { surveyId } = useParams();
  const { survey, state, error } = useSurveyLoader(surveyId);
  
  if (state === 'loading') return <div>Loading survey...</div>;
  if (state === 'error') return <div>Error: {error?.message}</div>;
  if (!survey) return <div>Survey not found</div>;
  
  return (
    <SurveyContainer
      survey={survey}
      sessionId="user-session-id" // Generate or get from context
      onComplete={() => {
        // Handle completion, e.g., redirect
        console.log('Survey completed!');
      }}
    />
  );
}
`,
      },
    },
  },
  render: () => (
    <div className="p-6 max-w-3xl mx-auto bg-muted rounded-lg">
      <h2 className="text-lg font-semibold mb-2">SurveyContainer Implementation</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The SurveyContainer orchestrates the entire survey flow from welcome to completion.
        See source code tab for implementation example.
      </p>
    </div>
  ),
}; 