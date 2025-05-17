import type { Meta, StoryObj } from '@storybook/react';
import { SurveyProgressBar } from './SurveyProgressBar';

/**
 * The `SurveyProgressBar` is a visual indicator of progress through a multi-step survey,
 * showing completed steps and remaining steps.
 */
const meta: Meta<typeof SurveyProgressBar> = {
  title: 'UI/SurveyProgressBar',
  component: SurveyProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value (0-100)',
    },
    steps: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Optional step information to display',
    },
    currentStep: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Current step (1-based)',
    },
    showStepText: {
      control: 'boolean',
      description: 'Whether to show step text (e.g., "Step 2 of 5")',
    },
    variant: {
      control: { type: 'select', options: ['default', 'success', 'info'] },
      description: 'Variant of the progress bar',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SurveyProgressBar>;

/**
 * Default state of the progress bar showing 40% completion.
 */
export const Default: Story = {
  args: {
    value: 40,
    steps: 5,
    currentStep: 2,
    showStepText: true,
    variant: 'default',
  },
};

/**
 * Progress bar in the early stages of completion.
 */
export const Starting: Story = {
  args: {
    value: 20,
    steps: 5,
    currentStep: 1,
    showStepText: true,
  },
};

/**
 * Progress bar nearly complete.
 */
export const AlmostComplete: Story = {
  args: {
    value: 80,
    steps: 5,
    currentStep: 4,
    showStepText: true,
  },
};

/**
 * Progress bar with success variant, useful for completed steps.
 */
export const SuccessVariant: Story = {
  args: {
    value: 100,
    steps: 5,
    currentStep: 5,
    showStepText: true,
    variant: 'success',
  },
};

/**
 * Progress bar with info variant, useful for informational steps.
 */
export const InfoVariant: Story = {
  args: {
    value: 60,
    steps: 5,
    currentStep: 3,
    showStepText: true,
    variant: 'info',
  },
};

/**
 * Progress bar without step text, showing only the visual indicator.
 */
export const WithoutStepText: Story = {
  args: {
    value: 60,
    showStepText: false,
  },
};

/**
 * Example showing progress bar sizes with different classes 
 */
export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <SurveyProgressBar 
          value={60} 
          steps={5} 
          currentStep={3} 
          className="h-1 max-w-xs"
          showStepText={false}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Medium (Default)</h3>
        <SurveyProgressBar 
          value={60} 
          steps={5} 
          currentStep={3} 
          className="max-w-md"
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <SurveyProgressBar 
          value={60} 
          steps={5} 
          currentStep={3} 
          className="max-w-xl h-3"
        />
      </div>
    </div>
  ),
}; 