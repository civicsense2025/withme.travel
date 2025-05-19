import type { Meta, StoryObj } from '@storybook/react';
import { GroupIdeaForm } from './GroupIdeaForm';

const meta: Meta<typeof GroupIdeaForm> = {
  title: 'Features/Groups/Molecules/GroupIdeaForm',
  component: GroupIdeaForm,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof GroupIdeaForm>;

export const Default: Story = {
  args: {
    onSubmit: async (data) => alert('Submitted: ' + JSON.stringify(data)),
  },
};

export const EditMode: Story = {
  args: {
    initialData: {
      id: '1',
      title: 'Edit Idea',
      description: 'Editing an existing idea',
      type: 'activity',
    },
    onSubmit: async (data) => alert('Submitted: ' + JSON.stringify(data)),
  },
}; 