import type { Meta, StoryObj } from '@storybook/react';
import { NotesTabTemplate } from './NotesTabTemplate';

/**
 * Storybook stories for the NotesTabTemplate template
 * Layout for the collaborative notes tab
 */
const meta: Meta<typeof NotesTabTemplate> = {
  title: 'Features/Notes/Templates/NotesTabTemplate',
  component: NotesTabTemplate,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NotesTabTemplate>;

export const Default: Story = {
  args: {
    notes: [
      { id: '1', title: 'First Note', content: 'This is the first note.' },
      { id: '2', title: 'Second Note', content: 'This is the second note.' },
    ],
    onAddNote: () => {},
    onEditNote: () => {},
    onDeleteNote: () => {},
  },
}; 