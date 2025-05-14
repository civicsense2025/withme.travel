import type { Meta, StoryObj } from '@storybook/react';
import { CollaboratorList } from './collaborator-list';

const meta: Meta<typeof CollaboratorList> = {
  title: 'Features/Trip/CollaboratorList',
  component: CollaboratorList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'CollaboratorList shows the avatars and names of users collaborating on the whiteboard. If this component requires context, wrap it in the appropriate provider in your app.',
      },
    },
  },
  tags: ['autodocs'],
  // Add argTypes if props exist
};

export default meta;
type Story = StoryObj<typeof CollaboratorList>;

export const Default: Story = {
  args: {
    // Add default/mock props here if needed
  },
};
