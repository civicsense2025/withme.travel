import type { Meta, StoryObj } from '@storybook/react';
import { ActivityGeneratorWidget } from './ActivityGeneratorWidget';

const meta: Meta<typeof ActivityGeneratorWidget> = {
  title: 'Features/Groups/Organisms/ActivityGeneratorWidget',
  component: ActivityGeneratorWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityGeneratorWidget>;

export const Default: Story = {
  args: {
    groupId: 'group123',
    planId: 'plan456',
    onAddIdea: async (idea) => {
      console.log('Adding idea:', idea);
      return Promise.resolve();
    },
    onClose: () => console.log('Closing widget'),
  },
};

export const WithDestination: Story = {
  args: {
    groupId: 'group123',
    planId: 'plan456',
    destinationId: 'destination789',
    onAddIdea: async (idea) => {
      console.log('Adding idea:', idea);
      return Promise.resolve();
    },
    onClose: () => console.log('Closing widget'),
  },
}; 