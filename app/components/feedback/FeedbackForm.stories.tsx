import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackFormRenderer } from './FeedbackForm';
import { FeedbackType, FormStatus, QuestionType } from './types';

const meta: Meta<typeof FeedbackFormRenderer> = {
  title: 'Feedback/FeedbackForm',
  component: FeedbackFormRenderer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeedbackFormRenderer>;

const mockForm = {
  id: 'quick-feedback',
  title: 'Quick Feedback',
  description: 'Help us improve your experience with a quick feedback.',
  feedbackType: FeedbackType.IN_APP,
  status: FormStatus.ACTIVE,
  showProgressBar: true,
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  completionMessage: 'Thanks for your feedback! We appreciate your input.',
};

const mockQuestions = [
  {
    id: 'rating',
    formId: 'quick-feedback',
    title: 'How would you rate your experience?',
    description: 'Please rate your overall experience with this feature',
    isRequired: true,
    type: QuestionType.RATING as typeof QuestionType.RATING,
    position: 0,
    ratingScale: 5,
    metadata: {},
    placeholder: null,
    conditionalDisplay: undefined,
    maxCharacterCount: undefined,
  },
  {
    id: 'feedback',
    formId: 'quick-feedback',
    title: 'What could we improve?',
    description: 'Please share any suggestions or issues you encountered',
    isRequired: false,
    type: QuestionType.LONG_TEXT as typeof QuestionType.LONG_TEXT,
    position: 1,
    maxCharacterCount: 500,
    metadata: {},
    placeholder: 'Share your thoughts here...',
    conditionalDisplay: undefined,
    ratingScale: undefined,
  },
];

export const Default: Story = {
  args: {
    form: mockForm,
    questions: mockQuestions,
    onSubmit: async () => alert('Feedback submitted!'),
  },
};
