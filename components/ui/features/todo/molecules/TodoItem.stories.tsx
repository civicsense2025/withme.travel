import { Meta, StoryObj } from '@storybook/react';
import { TodoItem } from './TodoItem';
import { TodoItem as TodoItemType } from '../types';

const meta: Meta<typeof TodoItem> = {
  title: 'Features/Todo/Molecules/TodoItem',
  component: TodoItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    item: {
      id: 'todo-1',
      text: 'Complete the project documentation',
      completed: false,
    },
    isProcessing: false,
    canEdit: true,
  },
  argTypes: {
    onToggle: { action: 'toggled' },
    onDelete: { action: 'deleted' },
    onUpdate: { action: 'updated' },
  },
};

export default meta;
type Story = StoryObj<typeof TodoItem>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    item: {
      id: 'todo-2',
      text: 'Make coffee',
      completed: true,
    },
  },
};

export const WithPriority: Story = {
  args: {
    item: {
      id: 'todo-3',
      text: 'Prepare presentation for client meeting',
      completed: false,
      priority: 'high',
    },
  },
};

export const WithCategory: Story = {
  args: {
    item: {
      id: 'todo-4',
      text: 'Book flight tickets',
      completed: false,
      category: 'travel',
    },
  },
};

export const WithDueDate: Story = {
  args: {
    item: {
      id: 'todo-5',
      text: 'Submit quarterly report',
      completed: false,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  },
};

export const WithAllDetails: Story = {
  args: {
    item: {
      id: 'todo-6',
      text: 'Finalize budget proposal',
      completed: false,
      priority: 'medium',
      category: 'work',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  },
};

export const Processing: Story = {
  args: {
    item: {
      id: 'todo-7',
      text: 'Processing state example',
      completed: false,
    },
    isProcessing: true,
  },
};

export const ReadOnly: Story = {
  args: {
    item: {
      id: 'todo-8',
      text: 'Read-only example',
      completed: false,
      priority: 'low',
      category: 'personal',
    },
    canEdit: false,
  },
}; 