import type { Meta, StoryObj } from '@storybook/react';
import { ActivityTabTemplate } from './ActivityTabTemplate';

// Sample activity data for stories
const sampleActivities = [
  {
    id: '1',
    type: 'comment',
    userName: 'Jane Doe',
    userAvatar: 'https://i.pravatar.cc/150?u=jane',
    entityType: 'trip',
    entityName: 'Weekend in Paris',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'create',
    userName: 'John Smith',
    userAvatar: 'https://i.pravatar.cc/150?u=john',
    entityType: 'trip',
    entityName: 'Barcelona Adventure',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'update',
    userName: 'Alex Wong',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    entityType: 'itinerary',
    entityName: 'Day 1 Plans',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'delete',
    userName: 'Lisa Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=lisa',
    entityType: 'comment',
    entityName: '',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'join',
    userName: 'Mike Brown',
    userAvatar: 'https://i.pravatar.cc/150?u=mike',
    entityType: 'group',
    entityName: 'Europe Summer 2024',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'leave',
    userName: 'Sarah Davis',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    entityType: 'group',
    entityName: 'Winter Ski Trip',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const meta: Meta<typeof ActivityTabTemplate> = {
  title: 'Features/Activities/Templates/ActivityTabTemplate',
  component: ActivityTabTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    activities: {
      control: 'object',
      description: 'Array of activity items to display',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the content is currently loading',
    },
    error: {
      control: 'text',
      description: 'Error message to display if loading failed',
    },
    onActivityClick: { action: 'activity clicked' },
    viewMode: {
      control: 'radio',
      options: ['feed', 'timeline'],
      description: 'Whether to show activities as a feed or timeline',
    },
    onViewModeChange: { action: 'view mode changed' },
    filterState: {
      control: 'object',
      description: 'Current state of filters',
    },
    onFilterChange: { action: 'filter changed' },
    hasMore: {
      control: 'boolean',
      description: 'Whether more activities can be loaded',
    },
    onLoadMore: { action: 'load more clicked' },
    trip: {
      control: 'object',
      description: 'Trip details if this is a trip activity tab',
    },
    group: {
      control: 'object',
      description: 'Group details if this is a group activity tab',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTabTemplate>;

export const FeedView: Story = {
  args: {
    activities: sampleActivities,
    isLoading: false,
    error: null,
    viewMode: 'feed',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: true,
    trip: {
      id: 'trip-123',
      name: 'Weekend in Paris',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    },
    group: null,
  },
};

export const TimelineView: Story = {
  args: {
    activities: sampleActivities,
    isLoading: false,
    error: null,
    viewMode: 'timeline',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: true,
    trip: {
      id: 'trip-123',
      name: 'Weekend in Paris',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    },
    group: null,
  },
};

export const Loading: Story = {
  args: {
    activities: [],
    isLoading: true,
    error: null,
    viewMode: 'feed',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    trip: {
      id: 'trip-123',
      name: 'Weekend in Paris',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    },
    group: null,
  },
};

export const WithError: Story = {
  args: {
    activities: [],
    isLoading: false,
    error: 'Failed to load activities. Please try again later.',
    viewMode: 'feed',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    trip: {
      id: 'trip-123',
      name: 'Weekend in Paris',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    },
    group: null,
  },
};

export const Empty: Story = {
  args: {
    activities: [],
    isLoading: false,
    error: null,
    viewMode: 'feed',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    trip: {
      id: 'trip-123',
      name: 'Weekend in Paris',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
    },
    group: null,
  },
};

export const GroupActivities: Story = {
  args: {
    activities: sampleActivities,
    isLoading: false,
    error: null,
    viewMode: 'feed',
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: true,
    trip: null,
    group: {
      id: 'group-456',
      name: 'Europe Summer 2024',
      memberCount: 12,
    },
  },
}; 