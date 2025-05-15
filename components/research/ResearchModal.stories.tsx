import type { Meta, StoryObj } from '@storybook/react';
import { ResearchModal } from './ResearchModal';
import { action } from '@storybook/addon-actions';
import { SurveyContainer } from './SurveyContainer';

/**
 * `ResearchModal` is a modal dialog for displaying surveys and research prompts
 * to users without navigating away from their current context.
 */
const meta: Meta<typeof ResearchModal> = {
  title: 'Research/Molecules/ResearchModal',
  component: ResearchModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ResearchModal>;

// Mock survey data with required properties
const mockSurvey = {
  id: 'survey-1',
  title: 'Quick Feedback',
  name: 'Quick Feedback',
  description: 'We\'d love to hear your thoughts on our new feature.',
  type: 'feedback',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  config: {
    fields: [
      {
        id: 'q1',
        label: 'How satisfied are you with this feature?',
        type: 'radio',
        required: true,
        options: [
          { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
          { value: 'dissatisfied', label: 'Dissatisfied' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'satisfied', label: 'Satisfied' },
          { value: 'very-satisfied', label: 'Very Satisfied' },
        ],
      },
    ],
  },
};

/**
 * Default modal with basic survey content
 */
export const Default: Story = {
  args: {
    survey: mockSurvey,
    onClose: action('Modal Closed'),
    children: <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{mockSurvey.title}</h2>
      <p className="mb-4">{mockSurvey.description}</p>
      <div className="space-y-4">
        <div className="border p-4 rounded-md">
          <p className="font-medium mb-2">{mockSurvey.config.fields[0].label}</p>
          <div className="space-y-2">
            {mockSurvey.config.fields[0].options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={option.value}
                  name="satisfaction"
                  value={option.value}
                  className="mr-2"
                />
                <label htmlFor={option.value}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={action('Submit Clicked')}
        >
          Submit
        </button>
      </div>
    </div>,
  },
};

/**
 * Modal containing a full SurveyContainer
 * Note: This would require proper mocking to function in Storybook
 */
export const WithSurveyContainer: Story = {
  parameters: {
    docs: {
      source: {
        code: `
// Example usage in a real component
import { ResearchModal } from '@/components/research/ResearchModal';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import { useResearchContext } from '@/context/research-context';

function MyComponent() {
  const { activeSurvey, closeActiveSurvey } = useResearchContext();
  
  return (
    <>
      {/* Your regular component content */}
      <div>Regular app content</div>
      
      {/* Research modal appears when a survey is triggered */}
      <ResearchModal survey={activeSurvey} onClose={closeActiveSurvey}>
        {activeSurvey && (
          <SurveyContainer
            survey={activeSurvey}
            onComplete={closeActiveSurvey}
          />
        )}
      </ResearchModal>
    </>
  );
}
`,
      },
    },
  },
  render: () => (
    <div className="p-6 max-w-md mx-auto bg-muted rounded-lg">
      <h2 className="text-lg font-semibold mb-2">ResearchModal with SurveyContainer</h2>
      <p className="text-sm text-muted-foreground mb-4">
        In a real application, the ResearchModal would contain a full SurveyContainer
        component. See the source code tab for implementation example.
      </p>
    </div>
  ),
}; 