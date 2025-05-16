/**
 * Storybook stories for TaskItem component
 * 
 * @module ui/features/tasks/molecules/TaskItem.stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TaskItem } from './TaskItem';
import { TaskItem as TaskItemType } from '../types';

const meta: Meta<typeof TaskItem> = {
  title: 'UI/Features/Tasks/Molecules/TaskItem',
  component: TaskItem,
  tags: ['autodocs'],
  argTypes: {
    isVoting: { control: 'boolean' },
    isUpdatingStatus: { control: 'boolean' },
    isDeleting: { control: 'boolean' },
    onUpvote: { action: 'upvoted' },
    onDownvote: { action: 'downvoted' },
    onStatusChange: { action: 'statusChanged' },
    onDelete: { action: 'deleted' }
  }
};

export default meta;
type Story = StoryObj<typeof TaskItem>;

// Sample task
const sampleTask: TaskItemType = {
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
  tags: ['travel', 'planning'],
  assignee: {
    id: 'user2',
    name: 'Sarah Davis',
    avatar_url: null,
    username: 'sarahd'
  }
};

export const Default: Story = {
  args: {
    task: sampleTask
  }
};

export const Active: Story = {
  args: {
    task: {
      ...sampleTask,
      status: 'active',
      votes: {
        ...sampleTask.votes,
        userVote: 'up'
      }
    }
  }
};

export const Confirmed: Story = {
  args: {
    task: {
      ...sampleTask,
      status: 'confirmed',
      priority: 'medium'
    }
  }
};

export const Rejected: Story = {
  args: {
    task: {
      ...sampleTask,
      status: 'rejected',
      priority: 'low',
      votes: {
        ...sampleTask.votes,
        userVote: 'down'
      }
    }
  }
};

export const Loading: Story = {
  args: {
    task: sampleTask,
    isVoting: true,
    isUpdatingStatus: true
  }
}; 