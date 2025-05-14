import type { Meta, StoryObj } from '@storybook/react';
import { IdeasBoardHelpDialog } from './ideas-board-help-dialog';

const meta: Meta<typeof IdeasBoardHelpDialog> = {
  title: 'Features/Trip/IdeasBoardHelpDialog',
  component: IdeasBoardHelpDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'IdeasBoardHelpDialog provides help and onboarding for the Ideas Whiteboard. If this component requires context, wrap it in the appropriate provider in your app.',
      },
    },
  },
  tags: ['autodocs'],
  // Add argTypes if props exist
};

export default meta;
type Story = StoryObj<typeof IdeasBoardHelpDialog>;

export const Default: Story = {
  args: {
    // Add default/mock props here if needed
  },
};
