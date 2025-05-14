import type { Meta, StoryObj } from '@storybook/react';
import { WhiteboardToolbar } from './WhiteboardToolbar';

const meta: Meta<typeof WhiteboardToolbar> = {
  title: 'Features/Trip/WhiteboardToolbar',
  component: WhiteboardToolbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'WhiteboardToolbar is used in the Ideas Whiteboard for quick actions. If this component requires context, wrap it in the appropriate provider in your app.',
      },
    },
  },
  tags: ['autodocs'],
  // Add argTypes if props exist
};

export default meta;
type Story = StoryObj<typeof WhiteboardToolbar>;

export const Default: Story = {
  args: {
    // Add default/mock props here if needed
  },
};
