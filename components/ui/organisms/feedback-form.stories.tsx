import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackForm } from './feedback-form';

const meta: Meta<typeof FeedbackForm> = {
  title: 'Feedback/Feedback Form',
  component: FeedbackForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    initialRating: {
      control: { type: 'range', min: 1, max: 5 },
      description: 'Initial rating value',
    },
    maxRating: {
      control: { type: 'number', min: 3, max: 10 },
      description: 'Maximum rating value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeedbackForm>;

export const Default: Story = {
  args: {
    initialRating: 0,
    maxRating: 5,
  },
};

export const WithPresetRating: Story = {
  args: {
    initialRating: 4,
    maxRating: 5,
  },
};

export const CustomMaxRating: Story = {
  args: {
    initialRating: 0,
    maxRating: 10,
  },
};
