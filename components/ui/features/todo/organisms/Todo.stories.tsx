import { Meta, StoryObj } from '@storybook/react';
import { Todo } from './Todo';
import { TodoItem } from '../types';

const meta: Meta<typeof Todo> = {
  title: 'UI/Features/todo/Todo',
  component: Todo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onToggle: { action: 'toggled' },
    onDelete: { action: 'deleted' },
    onAdd: { action: 'added' },
    onUpdate: { action: 'updated' },
  },
};

export default meta;
type Story = StoryObj<typeof Todo>;

const sampleItems: TodoItem[] = [
  {
    id: '1',
    text: 'Complete project documentation',
    completed: false,
  },
  {
    id: '2',
    text: 'Book flight tickets',
    completed: false,
    category: 'travel',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    text: 'Prepare presentation slides',
    completed: true,
    category: 'work',
    priority: 'high',
  },
  {
    id: '4',
    text: 'Buy groceries',
    completed: false,
    category: 'shopping',
    priority: 'medium',
  },
];

export const Default: Story = {
  args: {
    initialItems: sampleItems,
    title: 'My Tasks',
  },
};

export const Empty: Story = {
  args: {
    initialItems: [],
    title: 'No Tasks',
  },
};

export const ReadOnly: Story = {
  args: {
    initialItems: sampleItems,
    canEdit: false,
    title: 'View Only Tasks',
  },
};

export const CustomTitle: Story = {
  args: {
    initialItems: sampleItems,
    title: 'Work In Progress',
  },
}; 