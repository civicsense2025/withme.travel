import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Todo } from '@/components/shared/Todo';

const meta: Meta<typeof Todo> = {
  title: 'Design System/Patterns/Todo',
  component: Todo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible, accessible Todo list component that supports categories, priority levels, due dates, and filtering. This component demonstrates how multiple UI elements work together in a complex interface pattern.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    initialItems: {
      description: 'Initial todo items to display',
      control: 'object',
      table: {
        type: { summary: 'TodoItem[]' },
      },
    },
    canEdit: {
      description: 'Whether the user can add, edit, or remove items',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    title: {
      description: 'Optional title for the todo list',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Todo List' },
      },
    },
    onToggle: {
      action: 'toggled',
      description: 'Callback when an item is toggled',
      table: {
        type: { summary: '(id: string, completed: boolean) => Promise<void>' },
      },
    },
    onDelete: {
      action: 'deleted',
      description: 'Callback when an item is deleted',
      table: {
        type: { summary: '(id: string) => Promise<void>' },
      },
    },
    onAdd: {
      action: 'added',
      description: 'Callback when a new item is added',
      table: {
        type: { summary: '(text: string) => Promise<void>' },
      },
    },
    onUpdate: {
      action: 'updated',
      description: 'Callback when an item is updated',
      table: {
        type: { summary: '(id: string, updates: Partial<TodoItem>) => Promise<void>' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl mx-auto p-4 bg-background rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Todo>;

const sampleTodos: TodoItem[] = [
  {
    id: '1',
    text: 'Book flights to destination',
    completed: false,
    category: 'travel',
    priority: 'high',
  },
  {
    id: '2',
    text: 'Research local attractions',
    completed: true,
    category: 'travel',
    priority: 'medium',
    dueDate: new Date('2023-12-15'),
  },
  {
    id: '3',
    text: 'Pack suitcase',
    completed: false,
    category: 'travel',
    priority: 'low',
  },
  {
    id: '4',
    text: 'Buy travel insurance',
    completed: false,
    category: 'shopping',
    priority: 'high',
  },
  {
    id: '5',
    text: 'Schedule team meeting',
    completed: true,
    category: 'work',
    priority: 'medium',
  },
];

// Helper function to create mock async handlers
const createAsyncHandler = (actionName: string) => {
  return async (...args: any[]) => {
    action(actionName)(...args);
    await new Promise((resolve) => setTimeout(resolve, 300));
  };
};

// Default story
export const Default: Story = {
  args: {
    title: 'Todo List',
    initialItems: sampleTodos,
    canEdit: true,
    onToggle: createAsyncHandler('toggled'),
    onDelete: createAsyncHandler('deleted'),
    onAdd: createAsyncHandler('added'),
    onUpdate: createAsyncHandler('updated'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'The default Todo list with a mix of todos in different states, categories, and priorities.',
      },
    },
  },
};

// Read-only variant
export const ReadOnly: Story = {
  args: {
    ...Default.args,
    title: 'Read-Only Todo List',
    canEdit: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'A read-only view of todos where users cannot add, edit, or delete items.',
      },
    },
  },
};

// Empty state
export const Empty: Story = {
  args: {
    ...Default.args,
    title: 'Empty Todo List',
    initialItems: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state of the Todo list, with a prompt to add new items.',
      },
    },
  },
};

// With travel planning tasks
export const TravelPlanning: Story = {
  args: {
    ...Default.args,
    title: 'Trip Planning Tasks',
    initialItems: sampleTodos.filter((todo) => todo.category === 'travel'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Todo list filtered to show only travel-related tasks - demonstrating how this component can be used for trip planning.',
      },
    },
  },
};

// With completed tasks
export const CompletedTasks: Story = {
  args: {
    ...Default.args,
    title: 'Completed Tasks',
    initialItems: [
      {
        id: '1',
        text: 'Book hotel reservation',
        completed: true,
        category: 'travel',
        priority: 'high',
      },
      {
        id: '2',
        text: 'Buy travel insurance',
        completed: true,
        category: 'shopping',
        priority: 'medium',
      },
      {
        id: '3',
        text: 'Get passport photos',
        completed: true,
        category: 'personal',
        priority: 'low',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all completed tasks with visual indicators for their completed state.',
      },
    },
  },
};

// With all priority levels
export const PriorityLevels: Story = {
  args: {
    ...Default.args,
    title: 'Priority Levels',
    initialItems: [
      {
        id: '1',
        text: 'High priority task',
        completed: false,
        priority: 'high',
      },
      {
        id: '2',
        text: 'Medium priority task',
        completed: false,
        priority: 'medium',
      },
      {
        id: '3',
        text: 'Low priority task',
        completed: false,
        priority: 'low',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the three priority levels (high, medium, low) with their corresponding visual indicators.',
      },
    },
  },
};

// With due dates
export const WithDueDates: Story = {
  args: {
    ...Default.args,
    title: 'Tasks With Due Dates',
    initialItems: [
      {
        id: '1',
        text: 'Task due today',
        completed: false,
        priority: 'high',
        dueDate: new Date(),
      },
      {
        id: '2',
        text: 'Task due tomorrow',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
      },
      {
        id: '3',
        text: 'Task due next week',
        completed: false,
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 7),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows tasks with different due dates and how they are displayed with calendar indicators.',
      },
    },
  },
};

// All categories
export const AllCategories: Story = {
  args: {
    ...Default.args,
    title: 'All Categories',
    initialItems: [
      {
        id: '1',
        text: 'Personal task',
        completed: false,
        category: 'personal',
      },
      {
        id: '2',
        text: 'Work task',
        completed: false,
        category: 'work',
      },
      {
        id: '3',
        text: 'Travel task',
        completed: false,
        category: 'travel',
      },
      {
        id: '4',
        text: 'Shopping task',
        completed: false,
        category: 'shopping',
      },
      {
        id: '5',
        text: 'Other task',
        completed: false,
        category: 'other',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates all available task categories with their unique color-coding.',
      },
    },
  },
};
