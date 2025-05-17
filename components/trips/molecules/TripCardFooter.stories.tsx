import type { Meta, StoryObj } from '@storybook/react';
import { TripCardFooter } from './TripCardFooter';

const meta: Meta<typeof TripCardFooter> = {
  title: 'Trips/Molecules/TripCardFooter',
  component: TripCardFooter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    dateFormat: {
      control: 'select',
      options: ['short', 'medium', 'long'],
    },
    maxMembers: {
      control: { type: 'number', min: 1, max: 10 },
    },
    onMembersClick: { action: 'members clicked' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TripCardFooter>;

// Generate a list of members for the stories
const sampleMembers = [
  {
    id: '1',
    name: 'John Doe',
    imageUrl: 'https://i.pravatar.cc/300?img=1',
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    imageUrl: 'https://i.pravatar.cc/300?img=2',
    status: 'offline' as const,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    imageUrl: 'https://i.pravatar.cc/300?img=3',
    status: 'offline' as const,
  },
  {
    id: '4',
    name: 'Alice Williams',
    imageUrl: 'https://i.pravatar.cc/300?img=4',
    status: 'away' as const,
  },
  {
    id: '5',
    name: 'Charlie Brown',
    imageUrl: 'https://i.pravatar.cc/300?img=5',
    status: 'offline' as const,
  },
];

export const Default: Story = {
  args: {
    startDate: '2023-06-15',
    endDate: '2023-06-22',
    members: sampleMembers.slice(0, 3),
    dateFormat: 'medium',
    maxMembers: 3,
  },
};

export const ShortDates: Story = {
  args: {
    ...Default.args,
    dateFormat: 'short',
  },
};

export const LongDates: Story = {
  args: {
    ...Default.args,
    dateFormat: 'long',
  },
};

export const ManyMembers: Story = {
  args: {
    ...Default.args,
    members: sampleMembers,
    maxMembers: 3,
  },
};

export const NoMembers: Story = {
  args: {
    ...Default.args,
    members: [],
  },
};

export const WithMembersCount: Story = {
  args: {
    ...Default.args,
    members: sampleMembers.slice(0, 3),
    membersCount: 8, // Show that there are 5 more members not displayed
  },
}; 