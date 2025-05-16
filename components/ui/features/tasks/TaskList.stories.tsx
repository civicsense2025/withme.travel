import type { Meta, StoryObj } from '@storybook/react';
import { TaskList } from './TaskList';
import type { TaskItem } from './types';

const meta: Meta<typeof TaskList> = {
  title: 'Features/Tasks/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onCreateTask: { action: 'createTask' },
    onSelectTask: { action: 'selectTask' },
    onStatusChange: { action: 'statusChanged' },
    onVote: { action: 'voted' },
  },
};

export default meta;
type Story = StoryObj<typeof TaskList>;

// Sample data
const sampleTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Research flights to Barcelona',
    description: 'Find the best flight options for our trip in July. Look for direct flights with good departure times.',
    status: 'active',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: {
      up: 4,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'John Doe', avatar_url: null, username: 'johndoe' },
        { id: 'user2', name: 'Jane Smith', avatar_url: null, username: 'janesmith' },
        { id: 'user3', name: 'Bob Johnson', avatar_url: null, username: 'bjohnson' },
        { id: 'user4', name: 'Alice Brown', avatar_url: null, username: 'abrown' },
      ],
      downVoters: [],
      userVote: 'up',
    },
    assignee: {
      id: 'user1',
      name: 'John Doe',
      avatar_url: 'https://i.pravatar.cc/150?u=user1',
      username: 'johndoe',
    },
    tags: ['travel', 'flights', 'urgent'],
  },
  {
    id: '2',
    title: 'Book accommodations in Barcelona',
    description: 'Find and book hotel or Airbnb in Barcelona city center for 5 nights.',
    status: 'suggested',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    votes: {
      up: 3,
      down: 1,
      upVoters: [
        { id: 'user1', name: 'John Doe', avatar_url: null, username: 'johndoe' },
        { id: 'user2', name: 'Jane Smith', avatar_url: null, username: 'janesmith' },
        { id: 'user3', name: 'Bob Johnson', avatar_url: null, username: 'bjohnson' },
      ],
      downVoters: [
        { id: 'user4', name: 'Alice Brown', avatar_url: null, username: 'abrown' },
      ],
      userVote: null,
    },
    tags: ['accommodation', 'booking'],
  },
  {
    id: '3',
    title: 'Create itinerary for Barcelona trip',
    status: 'suggested',
    priority: 'low',
    votes: {
      up: 2,
      down: 0,
      upVoters: [
        { id: 'user2', name: 'Jane Smith', avatar_url: null, username: 'janesmith' },
        { id: 'user3', name: 'Bob Johnson', avatar_url: null, username: 'bjohnson' },
      ],
      downVoters: [],
      userVote: null,
    },
  },
  {
    id: '4',
    title: 'Research restaurants in Barcelona',
    status: 'confirmed',
    priority: 'medium',
    votes: {
      up: 1,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'John Doe', avatar_url: null, username: 'johndoe' },
      ],
      downVoters: [],
      userVote: 'up',
    },
    assignee: {
      id: 'user2',
      name: 'Jane Smith',
      avatar_url: 'https://i.pravatar.cc/150?u=user2',
      username: 'janesmith',
    },
    tags: ['food', 'restaurants', 'barcelona'],
  },
  {
    id: '5',
    title: 'Get travel insurance',
    status: 'rejected',
    votes: {
      up: 0,
      down: 2,
      upVoters: [],
      downVoters: [
        { id: 'user3', name: 'Bob Johnson', avatar_url: null, username: 'bjohnson' },
        { id: 'user4', name: 'Alice Brown', avatar_url: null, username: 'abrown' },
      ],
      userVote: 'down',
    },
  },
];

export const Default: Story = {
  args: {
    tasks: sampleTasks,
    title: 'Barcelona Trip Tasks',
  },
};

export const WithFiltering: Story = {
  args: {
    tasks: sampleTasks,
    title: 'Trip Planning',
    enableFiltering: true,
  },
};

export const WithoutFiltering: Story = {
  args: {
    tasks: sampleTasks,
    title: 'Trip Planning',
    enableFiltering: false,
  },
};

export const EmptyList: Story = {
  args: {
    tasks: [],
    title: 'No Tasks',
  },
};

export const HighPriorityOnly: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.priority === 'high'),
    title: 'High Priority Tasks',
  },
}; 