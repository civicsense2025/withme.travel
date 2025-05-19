import type { Meta, StoryObj } from '@storybook/react';
import { NoteEditor } from './NoteEditor';

/**
 * Storybook stories for the NoteEditor atom
 * Allows editing and read-only display of notes
 */
const meta: Meta<typeof NoteEditor> = {
  title: 'Features/Notes/Atoms/NoteEditor',
  component: NoteEditor,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NoteEditor>;

export const Default: Story = {
  args: {
    value: 'This is a sample note.',
    onChange: () => {},
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'This is a read-only note.',
    onChange: () => {},
    readOnly: true,
  },
}; 