import type { Meta, StoryObj } from '@storybook/react';
import { WhiteboardControls } from './whiteboard-controls';

const meta: Meta<typeof WhiteboardControls> = {
  title: 'Features/Trip/WhiteboardControls',
  component: WhiteboardControls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'WhiteboardControls provides additional controls for the Ideas Whiteboard. If this component requires context, wrap it in the appropriate provider in your app.',
      },
    },
  },
  tags: ['autodocs'],
  // Add argTypes if props exist
};

export default meta;
type Story = StoryObj<typeof WhiteboardControls>;

export const Default: Story = {
  args: {
    // Add default/mock props here if needed
  },
};
