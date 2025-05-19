import type { Meta, StoryObj } from '@storybook/react';
import { CommentsList } from './comments-list';

/**
 * Storybook stories for the CommentsList component
 * Shows a list of comments or an empty state
 */
const meta: Meta<typeof CommentsList> = {
  title: 'Features/Comments/CommentsList',
  component: CommentsList,
  tags: ['autodocs'],
  argTypes: {
    comments: { control: 'object', description: 'Array of comment objects' },
  },
};
export default meta;
type Story = StoryObj<typeof CommentsList>;

const mockComments = [
  { id: '1', author: 'Alice', content: 'First comment!', createdAt: new Date().toISOString() },
  { id: '2', author: 'Bob', content: 'Second comment!', createdAt: new Date().toISOString() },
];

export const Default: Story = {
  args: {
    comments: mockComments,
  },
};

export const Empty: Story = {
  args: {
    comments: [],
  },
}; 