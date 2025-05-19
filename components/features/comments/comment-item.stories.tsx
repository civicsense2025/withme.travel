import type { Meta, StoryObj } from '@storybook/react';
import { CommentItem } from './comment-item';

/**
 * Storybook stories for the CommentItem component
 * Shows comment item with and without edited flag
 */
const meta: Meta<typeof CommentItem> = {
  title: 'Features/Comments/CommentItem',
  component: CommentItem,
  tags: ['autodocs'],
  argTypes: {
    author: { control: 'text', description: 'Author name' },
    content: { control: 'text', description: 'Comment content' },
    isEdited: { control: 'boolean', description: 'Whether the comment is edited' },
    createdAt: { control: 'date', description: 'Creation date' },
  },
};
export default meta;
type Story = StoryObj<typeof CommentItem>;

export const Default: Story = {
  args: {
    author: 'Alice',
    content: 'This is a comment.',
    isEdited: false,
    createdAt: new Date().toISOString(),
  },
};

export const Edited: Story = {
  args: {
    author: 'Bob',
    content: 'This comment was edited.',
    isEdited: true,
    createdAt: new Date().toISOString(),
  },
}; 