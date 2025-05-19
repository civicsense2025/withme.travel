import type { Meta, StoryObj } from '@storybook/react';
import { CollaborativeEditor } from './CollaborativeEditor';

/**
 * Storybook stories for the CollaborativeEditor molecule
 * Real-time collaborative note editing
 */
const meta: Meta<typeof CollaborativeEditor> = {
  title: 'Features/Notes/Molecules/CollaborativeEditor',
  component: CollaborativeEditor,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CollaborativeEditor>;

export const Default: Story = {
  args: {
    value: 'Collaborative editing in progress...',
    onChange: () => {},
    users: [
      { id: 'user-1', name: 'Alice' },
      { id: 'user-2', name: 'Bob' },
    ],
  },
}; 