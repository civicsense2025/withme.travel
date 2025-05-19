import type { Meta, StoryObj } from '@storybook/react';
import { CommentForm } from './comment-form';

/**
 * Storybook stories for the CommentForm component
 * Shows comment form with and without pre-filled value
 */
const meta: Meta<typeof CommentForm> = {
  title: 'Features/Comments/CommentForm',
  component: CommentForm,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Current comment value' },
    onChange: { action: 'onChange', description: 'Change handler' },
    onSubmit: { action: 'onSubmit', description: 'Submit handler' },
  },
};
export default meta;
type Story = StoryObj<typeof CommentForm>;

export const Default: Story = {
  args: {
    value: '',
  },
};

export const Prefilled: Story = {
  args: {
    value: 'This is a pre-filled comment.',
  },
}; 