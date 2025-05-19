import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeed } from './ActivityFeed';

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

const meta: Meta<typeof ActivityFeed> = {
  title: 'Features/Activities/Organisms/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    activities: {
      control: 'object',
      description: 'Array of activity items to display in the feed',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the feed is currently loading',
    },
    error: {
      control: 'text',
      description: 'Error message to display if loading failed',
    },
    onActivityClick: { action: 'activity clicked' },
    showFilters: {
      control: 'boolean',
      description: 'Whether to show filtering options',
    },
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
    emptyStateMessage: {
      control: 'text',
      description: 'Message to display when there are no activities',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

export const Default: Story = {
  args: {
    activities: sampleActivities,
    isLoading: false,
    error: null,
    showFilters: true,
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: true,
    emptyStateMessage: 'No activity to show',
  },
};

export const Loading: Story = {
  args: {
    activities: [],
    isLoading: true,
    error: null,
    showFilters: true,
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    emptyStateMessage: 'No activity to show',
  },
};

export const WithError: Story = {
  args: {
    activities: [],
    isLoading: false,
    error: 'Failed to load activities. Please try again later.',
    showFilters: true,
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    emptyStateMessage: 'No activity to show',
  },
};

export const Empty: Story = {
  args: {
    activities: [],
    isLoading: false,
    error: null,
    showFilters: true,
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    emptyStateMessage: 'No activities found. Try adjusting your filters.',
  },
};

export const WithFilters: Story = {
  args: {
    activities: sampleActivities.filter(a => a.type === 'comment' || a.type === 'create'),
    isLoading: false,
    error: null,
    showFilters: true,
    filterState: {
      selectedTypes: ['comment', 'create'],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: false,
    emptyStateMessage: 'No activity to show',
  },
};

export const WithoutFilters: Story = {
  args: {
    activities: sampleActivities,
    isLoading: false,
    error: null,
    showFilters: false,
    filterState: {
      selectedTypes: [],
      selectedEntities: [],
      dateRange: { start: null, end: null },
      userFilter: '',
    },
    hasMore: true,
    emptyStateMessage: 'No activity to show',
  },
}; 