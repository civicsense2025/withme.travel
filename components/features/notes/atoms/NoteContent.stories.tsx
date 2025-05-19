import type { Meta, StoryObj } from '@storybook/react';
import { NoteContent } from './NoteContent';

/**
 * Storybook stories for the NoteContent atom
 * Displays note content, optionally with Markdown support
 */
const meta: Meta<typeof NoteContent> = {
  title: 'Features/Notes/Atoms/NoteContent',
  component: NoteContent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof NoteContent>;

export const Default: Story = {
  args: {
    content: 'This is a simple note.',
  },
};

export const Markdown: Story = {
  args: {
    content: '# Markdown Note\n\nThis note supports **Markdown** formatting.',
  },
}; 