/**
 * Storybook stories for Task component
 * 
 * @module ui/features/tasks/organisms/Task.stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Task } from './Task';
import { TaskItem } from '../types';

const meta: Meta<typeof Task> = {
  title: 'UI/Features/tasks/Task',
  component: Task,
  tags: ['autodocs'],
  argTypes: {
    canEdit: {
      control: 'boolean',
      description: 'Allow editing of tasks'
    },
    onItemDelete: { action: 'itemDeleted' },
    onStatusChange: { action: 'statusChanged' },
    onVote: { action: 'voted' },
    onAssign: { action: 'assigned' }
  }
};

export default meta;
type Story = StoryObj<typeof Task>;

// Sample task data
const sampleTasks: TaskItem[] = [
  {
    id: '1',
    title: 'Book flights to destination',
    description: 'Find and book the cheapest flights available for our travel dates',
    status: 'active',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    votes: {
      up: 3,
      down: 1,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Sarah Davis', avatar_url: null, username: 'sarahd' },
        { id: 'user3', name: 'Miguel Rodriguez', avatar_url: null, username: 'miguelr' }
      ],
      downVoters: [
        { id: 'user4', name: 'Taylor Kim', avatar_url: null, username: 'taylork' }
      ],
      userVote: null
    },
    tags: ['travel', 'planning']
  },
  {
    id: '2',
    title: 'Research local attractions',
    description: 'Find top-rated attractions and activities at our destination',
    status: 'confirmed',
    priority: 'medium',
    votes: {
      up: 5,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Sarah Davis', avatar_url: null, username: 'sarahd' },
        { id: 'user3', name: 'Miguel Rodriguez', avatar_url: null, username: 'miguelr' },
        { id: 'user4', name: 'Taylor Kim', avatar_url: null, username: 'taylork' },
        { id: 'user5', name: 'Jordan Lee', avatar_url: null, username: 'jordanl' }
      ],
      downVoters: [],
      userVote: 'up'
    },
    assignee: {
      id: 'user2',
      name: 'Sarah Davis',
      avatar_url: null,
      username: 'sarahd'
    },
    tags: ['activities', 'research']
  },
  {
    id: '3',
    title: 'Create trip budget spreadsheet',
    status: 'rejected',
    votes: {
      up: 1,
      down: 4,
      upVoters: [
        { id: 'user5', name: 'Jordan Lee', avatar_url: null, username: 'jordanl' }
      ],
      downVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Sarah Davis', avatar_url: null, username: 'sarahd' },
        { id: 'user3', name: 'Miguel Rodriguez', avatar_url: null, username: 'miguelr' },
        { id: 'user4', name: 'Taylor Kim', avatar_url: null, username: 'taylork' }
      ],
      userVote: 'down'
    },
    priority: 'low',
    tags: ['budget', 'planning']
  }
];

export const Default: Story = {
  args: {
    initialItems: sampleTasks,
    canEdit: false
  }
};

export const Editable: Story = {
  args: {
    initialItems: sampleTasks,
    canEdit: true
  }
};

export const Empty: Story = {
  args: {
    initialItems: [],
    canEdit: true
  }
}; 