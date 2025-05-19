import type { Meta, StoryObj } from '@storybook/react';
import { ActivityDescription } from './activity-description';

const meta: Meta<typeof ActivityDescription> = {
  title: 'Features/Activities/Atoms/ActivityDescription',
  component: ActivityDescription,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    activityType: {
      control: 'select',
      options: ['comment', 'create', 'update', 'delete', 'join', 'leave'],
      description: 'Type of activity',
    },
    userName: {
      control: 'text',
      description: 'Name of the user who performed the activity',
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
    highlighted: {
      control: 'boolean',
      description: 'Whether the description should be highlighted',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDescription>;

export const CommentActivity: Story = {
  args: {
    activityType: 'comment',
    userName: 'Jane Doe',
    entityType: 'trip',
    entityName: 'Weekend in Paris',
    highlighted: false,
  },
};

export const CreateActivity: Story = {
  args: {
    activityType: 'create',
    userName: 'John Smith',
    entityType: 'itinerary',
    entityName: 'Museum Visit',
    highlighted: false,
  },
};

export const -pdateActivity: Story = {
  args: {
    activityType: 'update',
    userName: 'Alex Wong',
    entityType: 'destination',
    entityName: 'Barcelona',
    highlighted: false,
  },
};

export const DeleteActivity: Story = {
  args: {
    activityType: 'delete',
    userName: 'Lisa Johnson',
    entityType: 'comment',
    entityName: '',
    highlighted: false,
  },
};

export const JoinActivity: Story = {
  args: {
    activityType: 'join',
    userName: 'Mike Brown',
    entityType: 'group',
    entityName: 'Europe Summer 2024',
    highlighted: false,
  },
};

export const LeaveActivity: Story = {
  args: {
    activityType: 'leave',
    userName: 'Sarah Davis',
    entityType: 'group',
    entityName: 'Beach Vacation',
    highlighted: false,
  },
};

export const Highlighted: Story = {
  args: {
    activityType: 'create',
    userName: 'John Smith',
    entityType: 'trip',
    entityName: 'Weekend in Paris',
    highlighted: true,
  },
}; 