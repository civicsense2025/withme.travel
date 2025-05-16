import { Meta, StoryObj } from '@storybook/react';
import { TodoList } from './TodoList';
import { TodoItem } from '../types';

const meta: Meta<typeof TodoList> = {
  title: 'Features/Todo/Organisms/TodoList',
  component: TodoList,
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
type Story = StoryObj<typeof TodoList>;

const sampleItems: TodoItem[] = [
  {
    id: '1',
    text: 'Complete project documentation',
    completed: false,
    priority: 'medium',
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
    text: 'Submit quarterly report',
    completed: true,
    category: 'work',
    priority: 'high',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    text: 'Buy groceries',
    completed: false,
    category: 'shopping',
    priority: 'low',
  },
  {
    id: '5',
    text: 'Schedule dentist appointment',
    completed: false,
    category: 'personal',
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    text: 'Review design mockups',
    completed: false,
    category: 'work',
    priority: 'high',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    text: 'Research vacation destinations',
    completed: false,
    category: 'travel',
    priority: 'low',
  },
  {
    id: '8',
    text: 'Update resume',
    completed: true,
    category: 'personal',
    priority: 'medium',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    title: 'Advanced Todo List',
  },
};

export const WithGrouping: Story = {
  args: {
    items: sampleItems,
    title: 'Grouped Tasks',
    enableGroupBy: true,
    enableFilters: true,
    enableSorting: true,
  },
};

export const FiltersOnly: Story = {
  args: {
    items: sampleItems,
    title: 'Filterable Tasks',
    enableGroupBy: false,
    enableFilters: true,
    enableSorting: false,
  },
};

export const SortingOnly: Story = {
  args: {
    items: sampleItems,
    title: 'Sortable Tasks',
    enableGroupBy: false,
    enableFilters: false,
    enableSorting: true,
  },
};

export const ReadOnly: Story = {
  args: {
    items: sampleItems,
    title: 'View Only Tasks',
    canEdit: false,
  },
}; 