import type { Meta, StoryObj } from '@storybook/react';
import { QuestionRenderer } from './QuestionRenderer';

const meta: Meta<typeof QuestionRenderer> = {
  title: 'Features/UserTesting/Molecules/QuestionRenderer',
  component: QuestionRenderer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    response: {
      control: { type: 'object' },
      description: 'Current response value'
    },
    onChange: {
      action: 'changed',
      description: 'Called when the answer changes'
    },
    error: {
      control: 'text',
      description: 'Error message to display'
    }
  }
};

export default meta;
type Story = StoryObj<typeof QuestionRenderer>;

export const TextQuestion: Story = {
  args: {
    question: {
      id: 'q1',
      milestone: 'basic_info',
      label: 'What is your name?',
      type: 'text',
      required: true
    },
    response: '',
    error: undefined
  }
};

export const TextAreaQuestion: Story = {
  args: {
    question: {
      id: 'q2',
      milestone: 'feedback',
      label: 'Please describe your experience with our product',
      type: 'textarea',
      required: true
    },
    response: '',
    error: undefined
  }
};

export const SelectQuestion: Story = {
  args: {
    question: {
      id: 'q3',
      milestone: 'demographics',
      label: 'What is your age range?',
      type: 'select',
      options: [
        { value: 'under18', label: 'Under 18' },
        { value: '18-24', label: '18-24' },
        { value: '25-34', label: '25-34' },
        { value: '35-44', label: '35-44' },
        { value: '45-54', label: '45-54' },
        { value: '55+', label: '55+' }
      ],
      required: true
    },
    response: '',
    error: undefined
  }
};

export const RadioQuestion: Story = {
  args: {
    question: {
      id: 'q4',
      milestone: 'preferences',
      label: 'How do you prefer to be contacted?',
      type: 'radio',
      options: ['Email', 'Phone', 'SMS', 'Post'],
      required: true
    },
    response: '',
    error: undefined
  }
};

export const CheckboxQuestion: Story = {
  args: {
    question: {
      id: 'q5',
      milestone: 'interests',
      label: 'Which travel destinations interest you? (Select all that apply)',
      type: 'checkbox',
      options: ['Beach', 'Mountains', 'City', 'Countryside', 'Cultural Sites'],
      required: true
    },
    response: [],
    error: undefined
  }
};

export const RatingQuestion: Story = {
  args: {
    question: {
      id: 'q6',
      milestone: 'satisfaction',
      label: 'How would you rate our service?',
      type: 'rating',
      required: true
    },
    response: 3,
    error: undefined
  }
};

export const BooleanQuestion: Story = {
  args: {
    question: {
      id: 'q7',
      milestone: 'preferences',
      label: 'Would you recommend our service to others?',
      type: 'boolean',
      required: true
    },
    response: undefined,
    error: undefined
  }
};

export const WithError: Story = {
  args: {
    question: {
      id: 'q8',
      milestone: 'contact',
      label: 'What is your email address?',
      type: 'text',
      required: true
    },
    response: 'invalid-email',
    error: 'Please enter a valid email address'
  }
};

export const OptionalQuestion: Story = {
  args: {
    question: {
      id: 'q9',
      milestone: 'additional',
      label: 'Any additional comments? (Optional)',
      type: 'textarea',
      required: false
    },
    response: '',
    error: undefined
  }
}; 