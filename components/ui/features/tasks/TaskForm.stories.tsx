import type { Meta, StoryObj } from '@storybook/react';
import { TaskForm } from './TaskForm';
import type { TaskItem, ProfileBasic } from './types';

const meta: Meta<typeof TaskForm> = {
  title: 'UI/Features/tasks/TaskForm',
  component: TaskForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
    onCancel: { action: 'cancelled' },
  },
};

export default meta;
type Story = StoryObj<typeof TaskForm>;

// Mock data
const sampleUsers: ProfileBasic[] = [
  {
    id: 'user1',
    name: 'John Doe',
    avatar_url: 'https://i.pravatar.cc/150?u=user1',
    username: 'johndoe',
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    avatar_url: 'https://i.pravatar.cc/150?u=user2',
    username: 'janesmith',
  },
  {
    id: 'user3',
    name: 'Bob Johnson',
    avatar_url: 'https://i.pravatar.cc/150?u=user3',
    username: 'bjohnson',
  },
  {
    id: 'user4',
    name: 'Alice Brown',
    avatar_url: 'https://i.pravatar.cc/150?u=user4',
    username: 'abrown',
  },
];

const sampleTask: TaskItem = {
  id: '1',
  title: 'Research flights to Barcelona',
  description: 'Find the best flight options for our trip in July. Look for direct flights with good departure times.',
  status: 'active',
  priority: 'high',
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  votes: {
    up: 4,
    down: 0,
    upVoters: [],
    downVoters: [],
    userVote: null,
  },
  assignee: sampleUsers[0],
  tags: ['travel', 'flights', 'urgent'],
};

export const CreateNew: Story = {
  args: {
    mode: 'create',
    availableUsers: sampleUsers,
  },
};

export const Edit: Story = {
  args: {
    mode: 'edit',
    initialTask: sampleTask,
    availableUsers: sampleUsers,
  },
};

export const WithSubmitting: Story = {
  args: {
    initialTask: sampleTask,
    availableUsers: sampleUsers,
    isSubmitting: true,
  },
};

export const WithCustomTitle: Story = {
  args: {
    mode: 'create',
    availableUsers: sampleUsers,
    className: 'p-4 border rounded-lg shadow-sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'TaskForm with custom styling applied through className',
      },
    },
  },
}; 