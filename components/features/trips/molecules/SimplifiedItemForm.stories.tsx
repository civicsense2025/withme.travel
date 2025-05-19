import type { Meta, StoryObj } from '@storybook/react';
import { SimplifiedItemForm, BulkItemForm } from './SimplifiedItemForm';

const meta: Meta<typeof SimplifiedItemForm> = {
  title: 'Features/Trips/Molecules/SimplifiedItemForm',
  component: SimplifiedItemForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tripId: {
      control: 'text',
      description: 'ID of the trip',
    },
    section: {
      control: 'text',
      description: 'Section ID (optional)',
    },
    dayNumber: {
      control: 'number',
      description: 'Day number for the item (optional)',
    },
    onItemAdded: {
      action: 'item added',
      description: 'Called when an item is successfully added',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SimplifiedItemForm>;

export const Default: Story = {
  args: {
    tripId: 'trip-123',
    section: null,
    dayNumber: null,
  },
};

export const WithSection: Story = {
  args: {
    tripId: 'trip-123',
    section: 'section-456',
    dayNumber: null,
  },
};

export const WithDayNumber: Story = {
  args: {
    tripId: 'trip-123',
    section: null,
    dayNumber: 2,
  },
};

export const WithSectionAndDayNumber: Story = {
  args: {
    tripId: 'trip-123',
    section: 'section-456',
    dayNumber: 2,
  },
};

// Create a separate meta for BulkItemForm
const bulkMeta: Meta<typeof BulkItemForm> = {
  title: 'Features/Trips/Molecules/BulkItemForm',
  component: BulkItemForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tripId: {
      control: 'text',
      description: 'ID of the trip',
    },
    section: {
      control: 'text',
      description: 'Section ID (optional)',
    },
    dayNumber: {
      control: 'number',
      description: 'Day number for the items (optional)',
    },
    onItemAdded: {
      action: 'items added',
      description: 'Called when items are successfully added',
    },
  },
};

type BulkStory = StoryObj<typeof BulkItemForm>;

// Export BulkItemForm stories
export const BulkForm: BulkStory = {
  render: (args) => <BulkItemForm {...args} />,
  args: {
    tripId: 'trip-123',
    section: null,
    dayNumber: null,
  },
}; 