import type { Meta, StoryObj } from '@storybook/react';
import { QuestionRenderer, type Question } from './QuestionRenderer';
import { useState } from 'react';

/**
 * `QuestionRenderer` is a component that renders different types of survey questions based on question type,
 * with validation and error handling.
 */
const meta: Meta<typeof QuestionRenderer> = {
  title: 'Research/Molecules/QuestionRenderer',
  component: QuestionRenderer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6 border rounded-lg shadow-sm bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuestionRenderer>;

// Sample questions of different types
const textQuestion: Question = {
  id: 'text-question',
  text: 'What is your name?',
  type: 'text',
  required: true,
  placeholder: 'Enter your name',
};

const textareaQuestion: Question = {
  id: 'textarea-question',
  text: 'Please provide any additional feedback',
  type: 'textarea',
  required: false,
  description: 'Your feedback helps us improve our service',
  placeholder: 'Write your feedback here...',
};

const selectQuestion: Question = {
  id: 'select-question',
  text: 'How did you hear about us?',
  type: 'select',
  required: true,
  options: [
    { value: 'friend', label: 'Friend or colleague' },
    { value: 'social', label: 'Social media' },
    { value: 'search', label: 'Search engine' },
    { value: 'ad', label: 'Advertisement' },
    { value: 'other', label: 'Other' },
  ],
  placeholder: 'Select an option',
};

const radioQuestion: Question = {
  id: 'radio-question',
  text: 'How satisfied are you with our service?',
  type: 'radio',
  required: true,
  options: [
    { value: 'very-dissatisfied', label: 'Very Dissatisfied' },
    { value: 'dissatisfied', label: 'Dissatisfied' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'satisfied', label: 'Satisfied' },
    { value: 'very-satisfied', label: 'Very Satisfied' },
  ],
};

const checkboxQuestion: Question = {
  id: 'checkbox-question',
  text: 'Terms and Conditions',
  type: 'checkbox',
  required: true,
  placeholder: 'I agree to the terms and conditions',
};

const ratingQuestion: Question = {
  id: 'rating-question',
  text: 'How likely are you to recommend our service to others?',
  type: 'rating',
  required: true,
  min: 0,
  max: 10,
  description: '0 = Not likely at all, 10 = Extremely likely',
};

// Interactive renderer with state management
const InteractiveQuestionRenderer = ({ question }: { question: Question }) => {
  const [value, setValue] = useState<any>(
    question.type === 'rating' ? question.min || 0 : ''
  );
  
  return (
    <QuestionRenderer
      question={question}
      value={value}
      onChange={setValue}
      showValidation={true}
    />
  );
};

/**
 * Text input question example
 */
export const TextQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={textQuestion} />,
};

/**
 * Textarea question example for longer text inputs
 */
export const TextareaQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={textareaQuestion} />,
};

/**
 * Select/dropdown question example
 */
export const SelectQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={selectQuestion} />,
};

/**
 * Radio button question example
 */
export const RadioQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={radioQuestion} />,
};

/**
 * Checkbox question example
 */
export const CheckboxQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={checkboxQuestion} />,
};

/**
 * Rating slider question example
 */
export const RatingQuestion: Story = {
  render: () => <InteractiveQuestionRenderer question={ratingQuestion} />,
};

/**
 * All question types displayed together
 */
export const AllQuestionTypes: Story = {
  render: () => (
    <div className="space-y-8">
      <InteractiveQuestionRenderer question={textQuestion} />
      <InteractiveQuestionRenderer question={textareaQuestion} />
      <InteractiveQuestionRenderer question={selectQuestion} />
      <InteractiveQuestionRenderer question={radioQuestion} />
      <InteractiveQuestionRenderer question={checkboxQuestion} />
      <InteractiveQuestionRenderer question={ratingQuestion} />
    </div>
  ),
}; 