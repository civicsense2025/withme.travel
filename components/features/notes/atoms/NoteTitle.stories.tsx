import type { Meta, StoryObj } from '@storybook/react';
import { NoteTitle } from './NoteTitle';

/**
 * Storybook stories for the NoteTitle atom
 * Displays and optionally edits a note title
 */
const meta: Meta<typeof NoteTitle> = {
  title: 'Features/Notes/Atoms/NoteTitle',
  component: NoteTitle,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NoteTitle>;

export const Default: Story = {
  args: {
    title: 'Trip Notes',
    editable: false,
    onEdit: () => {},
  },
};

export const Editable: Story = {
  args: {
    title: 'Editable Note Title',
    editable: true,
    onEdit: (newTitle: string) => alert(`Edited: ${newTitle}`),
  },
}; 