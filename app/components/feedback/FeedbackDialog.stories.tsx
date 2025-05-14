import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackDialog } from './FeedbackDialog';

const meta: Meta<typeof FeedbackDialog> = {
  title: 'Feedback/FeedbackDialog',
  component: FeedbackDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeedbackDialog>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    formType: 'quick',
  },
};
