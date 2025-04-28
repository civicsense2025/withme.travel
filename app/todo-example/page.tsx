'use client';

import React from 'react';
import { Todo } from '@/components/Todo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example data
const todoItems = [
  {
    id: '1',
    title: 'Plan itinerary for trip to Japan',
    description: 'Research attractions, accommodations, and transportation options for a 7-day trip to Tokyo and Kyoto.',
    status: 'pending' as const,
    dueDate: '2023-11-15',
    priority: 'high' as const,
    votes: {
      up: 4,
      down: 1,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Maria Garcia', avatar_url: null, username: 'mariagarcia' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' }
      ],
      downVoters: [
        { id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' }
      ],
      userVote: 'up' as const
    }
  },
  {
    id: '2',
    title: 'Book flights for winter vacation',
    description: 'Compare airline prices and select seats for the trip to Europe in December.',
    status: 'completed' as const,
    dueDate: '2023-10-01',
    priority: 'medium' as const,
    votes: {
      up: 3,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' }
      ],
      downVoters: [],
      userVote: null
    }
  },
  {
    id: '3',
    title: 'Research restaurants for Barcelona trip',
    description: 'Find popular local restaurants and make reservations for our stay in Barcelona.',
    status: 'pending' as const,
    dueDate: '2023-11-20',
    priority: 'low' as const,
    votes: {
      up: 2,
      down: 1,
      upVoters: [
        { id: 'user2', name: 'Maria Garcia', avatar_url: null, username: 'mariagarcia' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' }
      ],
      downVoters: [
        { id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' }
      ],
      userVote: 'down' as const
    }
  },
  {
    id: '4',
    title: 'Cancel hotel reservation in Paris',
    description: 'Cancel the hotel booking for the dates we changed in our itinerary.',
    status: 'cancelled' as const,
    dueDate: '2023-09-30',
    priority: 'high' as const,
    votes: {
      up: 0,
      down: 3,
      upVoters: [],
      downVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' }
      ],
      userVote: null
    }
  },
  {
    id: '5',
    title: 'Apply for travel visa',
    description: 'Complete the visa application process for our upcoming international trip.',
    status: 'pending' as const,
    dueDate: '2023-12-01',
    priority: 'high' as const,
    votes: {
      up: 6,
      down: 0,
      upVoters: [
        { id: 'user1', name: 'Alex Johnson', avatar_url: null, username: 'alexj' },
        { id: 'user2', name: 'Maria Garcia', avatar_url: null, username: 'mariagarcia' },
        { id: 'user3', name: 'John Smith', avatar_url: null, username: 'johnsmith' },
        { id: 'user4', name: 'Sarah Lee', avatar_url: null, username: 'sarahlee' },
        { id: 'user5', name: 'David Wilson', avatar_url: null, username: 'dwilson' },
        { id: 'user6', name: 'Emma Thompson', avatar_url: null, username: 'emmathompson' }
      ],
      downVoters: [],
      userVote: 'up' as const
    }
  }
];

export default function TodoExamplePage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Trip Planning Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            These are group tasks for our upcoming trip. Vote on priority items and mark them as complete when finished.
          </p>
          <Todo initialItems={todoItems} canEdit={true} />
        </CardContent>
      </Card>
    </div>
  );
} 