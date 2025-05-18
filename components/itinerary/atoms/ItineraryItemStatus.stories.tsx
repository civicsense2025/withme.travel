import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryItemStatus } from './ItineraryItemStatus';
import { ITEM_STATUSES } from '@/utils/constants/status';

const meta: Meta<typeof ItineraryItemStatus> = {
  title: 'Itinerary/Atoms/ItineraryItemStatus',
  component: ItineraryItemStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryItemStatus>;

export const Confirmed: Story = {
  args: {
    status: ITEM_STATUSES.CONFIRMED,
  },
};

export const Suggested: Story = {
  args: {
    status: ITEM_STATUSES.SUGGESTED,
  },
};

export const Rejected: Story = {
  args: {
    status: ITEM_STATUSES.REJECTED,
  },
};

export const CompactConfirmed: Story = {
  args: {
    status: ITEM_STATUSES.CONFIRMED,
    compact: true,
  },
};

export const CompactSuggested: Story = {
  args: {
    status: ITEM_STATUSES.SUGGESTED,
    compact: true,
  },
};

export const CompactRejected: Story = {
  args: {
    status: ITEM_STATUSES.REJECTED,
    compact: true,
  },
}; 