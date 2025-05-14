import type { Meta, StoryObj } from '@storybook/react';
import { TripTabsWrapper, TabItem } from './TripTabsWrapper';

const meta: Meta<typeof TripTabsWrapper> = {
  title: 'Trip Features/TripTabsWrapper',
  component: TripTabsWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TripTabsWrapper>;

const mockTabs: TabItem[] = [
  { value: 'overview', label: 'Overview', content: 'Overview content' },
  { value: 'itinerary', label: 'Itinerary', content: 'Itinerary content' },
  { value: 'members', label: 'Members', content: 'Members content' },
];

export const Default: Story = {
  args: {
    tabs: mockTabs,
    defaultValue: 'overview',
  },
};

export const SingleTab: Story = {
  args: {
    tabs: [{ value: 'overview', label: 'Overview', content: 'Overview content' }],
    defaultValue: 'overview',
  },
};
