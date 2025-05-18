import type { Meta, StoryObj } from '@storybook/react';
import { TaskItem } from './TaskItem';

/**
 * `TaskItem` is a molecule component that displays a single task with actions like 
 * completion toggling, assignment, and tagging.
 * 
 * This component is used in task lists, boards, and detail views to represent
 * individual task items.
 */
const meta: Meta<typeof TaskItem> = {
  title: 'UI/Molecules/TaskItem',
  component: TaskItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component representing a single task with various actions and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'text',
      description: 'Task ID',
    },
    title: {
      control: 'text',
      description: 'Task title',
    },
    description: {
      control: 'text',
      description: 'Task description',
    },
    dueDate: {
      control: 'date',
      description: 'Due date (ISO string)',
    },
    isCompleted: {
      control: 'boolean',
      description: 'Whether the task is completed',
    },
    priority: {
      control: { type: 'range', min: 1, max: 5, step: 1 },
      description: 'Task priority (1-5, 5 being highest)',
    },
    assignee: {
      control: 'object',
      description: 'Assignee information',
    },
    tags: {
      control: 'object',
      description: 'Task tags',
    },
    onToggleComplete: {
      action: 'toggleComplete',
      description: 'Handler for task completion toggle',
    },
    onAssign: {
      action: 'assign',
      description: 'Handler for task assignment',
    },
    onDelete: {
      action: 'delete',
      description: 'Handler for task deletion',
    },
    onRemoveTag: {
      action: 'removeTag',
      description: 'Handler for task tag removal',
    },
    loading: {
      control: 'object',
      description: 'Loading states for various actions',
    },
    onClick: {
      action: 'click',
      description: 'Handler for clicking the task',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;

type Story = StoryObj<typeof TaskItem>;

// Sample assignee for stories
const sampleAssignee = {
  id: 'user1',
  name: 'Jane Smith',
  avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Jane',
};

// Sample tags for stories
const sampleTags = [
  { name: 'Bug', id: '1' },
  { name: 'Frontend', id: '2' },
  { name: 'Urgent', id: '3' },
];

/**
 * Default task item with title and description.
 */
export const Default: Story = {
  args: {
    id: 'task1',
    title: 'Fix navigation bug',
    description: 'The dropdown menu doesn\'t close when clicking outside of it',
    priority: 3,
  },
};

/**
 * Task item with due date, priority, and assignee.
 */
export const WithMetadata: Story = {
  args: {
    id: 'task2',
    title: 'Design new homepage',
    description: 'Create mockups for the new homepage layout',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    priority: 4,
    assignee: sampleAssignee,
  },
};

/**
 * Task item with tags.
 */
export const WithTags: Story = {
  args: {
    id: 'task3',
    title: 'Fix CSS layout issues',
    tags: sampleTags,
    priority: 3,
  },
};

/**
 * Completed task item.
 */
export const Completed: Story = {
  args: {
    id: 'task4',
    title: 'Update dependencies',
    description: 'Update all npm packages to their latest versions',
    isCompleted: true,
    priority: 2,
  },
};

/**
 * Task item with loading states.
 */
export const Loading: Story = {
  args: {
    id: 'task5',
    title: 'Deploy to production',
    description: 'Deploy the latest changes to the production environment',
    priority: 5,
    loading: {
      completion: true,
    },
  },
};

/**
 * Task variations side by side.
 */
export const Variations: Story = {
  render: () => (
    <div className="flex flex-col space-y-4 w-[600px]">
      <TaskItem
        id="task1"
        title="High priority task"
        priority={5}
        dueDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()}
      />
      <TaskItem
        id="task2"
        title="Medium priority task"
        priority={3}
        assignee={sampleAssignee}
      />
      <TaskItem
        id="task3"
        title="Low priority task"
        priority={1}
        tags={sampleTags}
      />
      <TaskItem
        id="task4"
        title="Completed task"
        isCompleted={true}
        priority={3}
      />
    </div>
  ),
}; 