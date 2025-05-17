import type { Meta, StoryObj } from '@storybook/react';
import { ActivityItem } from './ActivityItem';

const meta: Meta<typeof ActivityItem> = {
  title: 'Trips/Molecules/ActivityItem',
  component: ActivityItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'food', 'lodging', 'flight', 'location', 'ticket', 'event', 'attraction', 'cafe', 'beach', 'museum', 'biking', 'nature', 'bus', 'train', 'car', 'shopping', 'photo', 'music', 'sunset', 'boat', 'drink', 'camping', 'hiking', 'architecture', 'other'
      ],
    },
    onClick: { action: 'clicked' },
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
type Story = StoryObj<typeof ActivityItem>;

export const Default: Story = {
  args: {
    type: 'food',
    title: 'Dinner at Le Meurice',
    description: 'Classic French cuisine in a beautiful setting.',
    startDate: '2023-06-16',
    endDate: '2023-06-16',
  },
};

export const WithAction: Story = {
  args: {
    ...Default.args,
    action: <button className="text-blue-600 hover:underline">Edit</button>,
  },
};

export const WithLongDescription: Story = {
  args: {
    ...Default.args,
    description: 'A very long description that will be truncated in the UI. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.',
  },
};

export const NoDates: Story = {
  args: {
    ...Default.args,
    startDate: null,
    endDate: null,
  },
}; 