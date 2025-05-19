import type { Meta, StoryObj } from '@storybook/react';
import { NoteCard } from './NoteCard';

/**
 * Storybook stories for the NoteCard molecule
 * Displays a note with optional actions
 */
const meta: Meta<typeof NoteCard> = {
  title: 'Features/Notes/Molecules/NoteCard',
  component: NoteCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NoteCard>;

export const Default: Story = {
  args: {
    note: {
      id: '1',
      title: 'Sample Note',
      content: 'This is a sample note for Storybook.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1',
    },
    onEdit: () => {},
    onDelete: () => {},
  },
}; 