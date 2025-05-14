'use client';

import { useState } from 'react';
import { Task } from '@/components/Task';
import { ITEM_STATUSES, type ItemStatus } from '@/utils/constants/status';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import type { TaskItem } from '@/components/Task';

export default function TaskDemo() {
  // Ensure initialTasks is TaskItem[] and status values are valid
  const initialTasks: TaskItem[] = [
    {
      id: '1',
      title: 'Sample Task',
      description: 'This is a sample',
      status: ITEM_STATUSES.SUGGESTED,
      dueDate: '2024-06-01',
      priority: 'high',
      votes: { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null },
      assignee: { id: '1', name: 'User', avatar_url: null, username: 'user' },
      tags: ['demo'],
    },
    {
      id: '2',
      title: 'Book flights to Paris',
      description: 'Find the best flight deals for our trip in June',
      status: ITEM_STATUSES.SUGGESTED,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high' as const,
      votes: {
        up: 3,
        down: 1,
        upVoters: [
          { id: 'user1', name: 'Alice Johnson', avatar_url: null, username: 'alice' },
          { id: 'user2', name: 'Bob Smith', avatar_url: null, username: 'bobsmith' },
          { id: 'user3', name: 'Carol Williams', avatar_url: null, username: 'carol' },
        ],
        downVoters: [{ id: 'user4', name: 'Dave Brown', avatar_url: null, username: 'dave' }],
        userVote: null,
      },
      assignee: {
        id: 'user1',
        name: 'Alice Johnson',
        avatar_url: null,
        username: 'alice',
      },
      tags: ['travel', 'planning', 'flight'],
    },
    {
      id: '3',
      title: 'Research accommodations',
      description: 'Find hotels or Airbnbs in the city center',
      status: ITEM_STATUSES.CONFIRMED,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium' as const,
      votes: {
        up: 5,
        down: 0,
        upVoters: [
          { id: 'user1', name: 'Alice Johnson', avatar_url: null, username: 'alice' },
          { id: 'user2', name: 'Bob Smith', avatar_url: null, username: 'bobsmith' },
          { id: 'user3', name: 'Carol Williams', avatar_url: null, username: 'carol' },
          { id: 'user4', name: 'Dave Brown', avatar_url: null, username: 'dave' },
          { id: 'user5', name: 'Eve Davis', avatar_url: null, username: 'eve' },
        ],
        downVoters: [],
        userVote: 'up' as const,
      },
      assignee: {
        id: 'user2',
        name: 'Bob Smith',
        avatar_url: null,
        username: 'bobsmith',
      },
      tags: ['accommodation', 'planning'],
    },
    {
      id: '4',
      title: 'Create itinerary for day 1',
      description: 'Plan activities and sights for our first day in Paris',
      status: ITEM_STATUSES.SUGGESTED,
      priority: 'low' as const,
      votes: {
        up: 2,
        down: 2,
        upVoters: [
          { id: 'user1', name: 'Alice Johnson', avatar_url: null, username: 'alice' },
          { id: 'user5', name: 'Eve Davis', avatar_url: null, username: 'eve' },
        ],
        downVoters: [
          { id: 'user3', name: 'Carol Williams', avatar_url: null, username: 'carol' },
          { id: 'user4', name: 'Dave Brown', avatar_url: null, username: 'dave' },
        ],
        userVote: 'down' as const,
      },
      tags: ['itinerary', 'planning', 'activities'],
    },
    {
      id: '5',
      title: 'Book restaurant for anniversary dinner',
      description: 'Find a romantic restaurant with Eiffel Tower view',
      status: ITEM_STATUSES.REJECTED,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      votes: {
        up: 1,
        down: 4,
        upVoters: [{ id: 'user2', name: 'Bob Smith', avatar_url: null, username: 'bobsmith' }],
        downVoters: [
          { id: 'user1', name: 'Alice Johnson', avatar_url: null, username: 'alice' },
          { id: 'user3', name: 'Carol Williams', avatar_url: null, username: 'carol' },
          { id: 'user4', name: 'Dave Brown', avatar_url: null, username: 'dave' },
          { id: 'user5', name: 'Eve Davis', avatar_url: null, username: 'eve' },
        ],
        userVote: null,
      },
      tags: ['dining', 'special', 'romantic'],
    },
  ];

  // Handler functions for Task component
  const handleStatusChange = async (
    itemId: string,
    newStatus: ItemStatus | 'active' | 'cancelled'
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Status changed',
      description: `Task ${itemId} status changed to ${newStatus}`,
    });

    // In a real application, you would update your database here
    return Promise.resolve();
  };

  const handleDelete = async (itemId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Task deleted',
      description: `Task ${itemId} has been removed`,
    });

    // In a real app, update state here
    return Promise.resolve();
  };

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast({
      title: 'Vote recorded',
      description: `You voted ${voteType} on task ${itemId}`,
    });

    return Promise.resolve();
  };

  const handleAssign = async (itemId: string, userId: string | null) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: 'Task assigned',
      description: userId
        ? `Task ${itemId} assigned to user ${userId}`
        : `Task ${itemId} unassigned`,
    });

    return Promise.resolve();
  };

  const [canEdit, setCanEdit] = useState(true);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Task Component Demo</h1>
      <p className="text-muted-foreground mb-6">
        This page demonstrates the Task component with sample data
      </p>

      <div className="flex items-center mb-6 space-x-4">
        <Button variant={canEdit ? 'default' : 'outline'} onClick={() => setCanEdit(true)}>
          Edit Mode
        </Button>
        <Button variant={!canEdit ? 'default' : 'outline'} onClick={() => setCanEdit(false)}>
          View Mode
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Task List</h2>
        <Task
          initialItems={Array.isArray(initialTasks) ? initialTasks : []}
          canEdit={!!canEdit}
          onItemDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onVote={handleVote}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
}
