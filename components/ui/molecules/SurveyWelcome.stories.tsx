import type { Meta, StoryObj } from '@storybook/react';
import { SurveyWelcome } from './SurveyWelcome';
import { action } from '@storybook/addon-actions';

/**
 * `SurveyWelcome` is a welcome screen shown before starting a survey.
 * It introduces the survey purpose and sets expectations.
 */
const meta: Meta<typeof SurveyWelcome> = {
  title: 'UI/SurveyWelcome',
  component: SurveyWelcome,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the survey',
    },
    description: {
      control: 'text',
      description: 'A brief description of the survey purpose',
    },
    onStart: { 
      action: 'started',
      description: 'Function called when user clicks Start button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SurveyWelcome>;

/**
 * Default welcome screen for a user feedback survey
 */
export const Default: Story = {
  args: {
    title: 'Help us improve withme.travel',
    description: 'We\'re gathering feedback to make your trip planning experience even better.',
    onStart: action('Started Survey'),
  },
};

/**
 * Welcome screen for a user testing session
 */
export const UserTesting: Story = {
  args: {
    title: 'User Testing Session',
    description: 'Thank you for participating in this user testing session. Your feedback will directly shape our product development.',
    onStart: action('Started User Testing'),
  },
};

/**
 * Welcome screen for a post-trip feedback survey
 */
export const PostTripFeedback: Story = {
  args: {
    title: 'How was your trip?',
    description: 'Now that you\'ve returned from your adventure, we\'d love to hear about your experience.',
    onStart: action('Started Post-Trip Survey'),
  },
};

/**
 * Welcome screen with a longer description
 */
export const LongDescription: Story = {
  args: {
    title: 'Product Satisfaction Survey',
    description: 'We\'re always looking to improve our product and your experience. This short survey will help us understand what\'s working well and what could be better. All responses are anonymous and will be used solely for improving withme.travel. Thank you in advance for your valuable feedback!',
    onStart: action('Started Survey with Long Description'),
  },
}; 