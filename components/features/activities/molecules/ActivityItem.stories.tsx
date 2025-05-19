import type { Meta, StoryObj } from '@storybook/react';
import { ActivityItem } from './ActivityItem';

const meta: Meta<typeof ActivityItem> = {
  title: 'Features/Activities/Molecules/ActivityItem',
  component: ActivityItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'Unique identifier for the activity',
    },
    type: {
      control: 'select',
      options: ['comment', 'create', 'update', 'delete', 'join', 'leave'],
      description: 'Type of activity',
    },
    userName: {
      control: 'text',
      description: 'Name of the user who performed the activity',
    },
    userAvatar: {
      control: 'text',
      description: 'URL of user avatar image',
    },
    entityType: {
      control: 'select',
      options: ['trip', 'itinerary', 'comment', 'destination', 'group'],
      description: 'Type of entity the activity is related to',
    },
    entityName: {
      control: 'text',
      description: 'Name of the entity the activity is related to',
    },
    timestamp: {
      control: 'date',
      description: 'When the activity occurred',
    },
    onClick: { action: 'clicked' },
    isHighlighted: {
      control: 'boolean',
      description: 'Whether the activity item should be highlighted',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityItem>;

// Current timestamp for all stories
const now = new Date();
const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const Default: Story = {
  args: {
    id: '1',
    type: 'comment',
    userName: 'Jane Doe',
    userAvatar: 'https://i.pravatar.cc/150?u=jane',
    entityType: 'trip',
    entityName: 'Weekend in Paris',
    timestamp: hourAgo.toISOString(),
    isHighlighted: false,
  },
};

export const CreateTrip: Story = {
  args: {
    id: '2',
    type: 'create',
    userName: 'John Smith',
    userAvatar: 'https://i.pravatar.cc/150?u=john',
    entityType: 'trip',
    entityName: 'Barcelona Adventure',
    timestamp: dayAgo.toISOString(),
    isHighlighted: false,
  },
};

export const UpdateItinerary: Story = {
  args: {
    id: '3',
    type: 'update',
    userName: 'Alex Wong',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    entityType: 'itinerary',
    entityName: 'Day 1 Plans',
    timestamp: hourAgo.toISOString(),
    isHighlighted: false,
  },
};

export const DeleteComment: Story = {
  args: {
    id: '4',
    type: 'delete',
    userName: 'Lisa Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=lisa',
    entityType: 'comment',
    entityName: '',
    timestamp: now.toISOString(),
    isHighlighted: false,
  },
};

export const JoinGroup: Story = {
  args: {
    id: '5',
    type: 'join',
    userName: 'Mike Brown',
    userAvatar: 'https://i.pravatar.cc/150?u=mike',
    entityType: 'group',
    entityName: 'Europe Summer 2024',
    timestamp: hourAgo.toISOString(),
    isHighlighted: false,
  },
};

export const Highlighted: Story = {
  args: {
    id: '6',
    type: 'create',
    userName: 'Sarah Davis',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    entityType: 'trip',
    entityName: 'Japan Cherry Blossoms',
    timestamp: dayAgo.toISOString(),
    isHighlighted: true,
  },
}; 