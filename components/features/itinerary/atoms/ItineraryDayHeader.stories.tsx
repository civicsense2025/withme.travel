import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryDayHeader } from './ItineraryDayHeader';

const meta: Meta<typeof ItineraryDayHeader> = {
  title: 'Itinerary/Atoms/ItineraryDayHeader',
  component: ItineraryDayHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ItineraryDayHeader>;

export const Default: Story = {
  args: {
    title: 'Day 1',
    date: 'Monday, June 15, 2024',
  },
};

export const WithoutDate: Story = {
  args: {
    title: 'Day 2',
  },
};

export const Unscheduled: Story = {
  args: {
    title: 'Unscheduled Items',
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Free Day',
    date: 'Wednesday, June 17, 2024',
  },
}; 