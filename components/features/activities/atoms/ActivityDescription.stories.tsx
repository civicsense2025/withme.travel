import type { Meta, StoryObj } from '@storybook/react';
import { ActivityDescription } from './ActivityDescription';

const meta: Meta<typeof ActivityDescription> = {
  title: 'Features/Activities/Atoms/ActivityDescription',
  component: ActivityDescription,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    description: {
      control: 'text',
      description: 'The primary text description of the activity',
    },
    userName: {
      control: 'text',
      description: 'Name of the user who performed the activity',
    },
    entityName: {
      control: 'text',
      description: 'Name of the entity the activity is related to',
    },
    details: {
      control: 'text',
      description: 'Additional details about the activity',
    },
    truncate: {
      control: 'boolean',
      description: 'Whether to truncate long descriptions',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum length before truncation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDescription>;

export const CommentActivity: Story = {
  args: {
    description: '{user} commented on the {entity}',
    userName: 'Jane Doe',
    entityName: 'Weekend in Paris',
    truncate: false,
  },
};

export const CreateActivity: Story = {
  args: {
    description: '{user} created a new {entity}',
    userName: 'John Smith',
    entityName: 'Museum Visit',
    truncate: false,
  },
};

export const UpdateActivity: Story = {
  args: {
    description: '{user} updated the {entity}',
    userName: 'Alex Wong',
    entityName: 'Barcelona',
    truncate: false,
  },
};

export const DeleteActivity: Story = {
  args: {
    description: '{user} deleted the {entity}',
    userName: 'Lisa Johnson',
    entityName: 'comment',
    truncate: false,
  },
};

export const JoinActivity: Story = {
  args: {
    description: '{user} joined the {entity}',
    userName: 'Mike Brown',
    entityName: 'Europe Summer 2024',
    truncate: false,
  },
};

export const LeaveActivity: Story = {
  args: {
    description: '{user} left the {entity}',
    userName: 'Sarah Davis',
    entityName: 'Beach Vacation',
    truncate: false,
  },
};

export const Truncated: Story = {
  args: {
    description: '{user} created a very long description about {entity} that needs to be truncated because it contains a lot of details about the {entity}',
    userName: 'John Smith',
    entityName: 'Weekend in Paris',
    truncate: true,
    maxLength: 50,
  },
}; 