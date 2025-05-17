import type { Meta, StoryObj } from '@storybook/react';
import { SurveyCompletion } from './SurveyCompletion';

/**
 * `SurveyCompletion` is a screen shown after a survey is successfully submitted.
 * It provides confirmation and next steps for the user.
 */
const meta: Meta<typeof SurveyCompletion> = {
  title: 'Research/Molecules/SurveyCompletion',
  component: SurveyCompletion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The main title of the completion screen',
    },
    description: {
      control: 'text',
      description: 'A description message thanking the user',
    },
    nextStepUrl: {
      control: 'text',
      description: 'URL for the "return" button',
    },
    nextStepLabel: {
      control: 'text',
      description: 'Label for the "return" button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SurveyCompletion>;

/**
 * Default completion screen after survey submission
 */
export const Default: Story = {
  args: {
    title: 'Thank you for your feedback!',
    description: 'Your responses help us make withme.travel better for everyone.',
    nextStepUrl: '/',
    nextStepLabel: 'Return to Home',
  },
};

/**
 * Completion screen for user testing session
 */
export const UserTestingCompletion: Story = {
  args: {
    title: 'User Testing Complete!',
    description: 'Thanks for participating in our user testing session. Your insights are incredibly valuable.',
    nextStepUrl: '/',
    nextStepLabel: 'Back to Dashboard',
  },
};

/**
 * Completion screen with reward information
 */
export const WithReward: Story = {
  args: {
    title: 'Survey Complete - Thanks!',
    description: 'Your responses have been recorded. As a token of our appreciation, we\'ve added a $10 credit to your account.',
    nextStepUrl: '/account/credits',
    nextStepLabel: 'View My Credits',
  },
};

/**
 * Completion screen for beta feature feedback
 */
export const BetaFeedback: Story = {
  args: {
    title: 'Beta Feedback Received',
    description: 'Your insights on our beta features will help us refine the experience before the full launch.',
    nextStepUrl: '/beta-features',
    nextStepLabel: 'Back to Beta Features',
  },
}; 