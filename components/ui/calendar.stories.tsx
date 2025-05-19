import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from './calendar';

/**
 * Storybook stories for the Calendar component
 * @module ui/Calendar
 */
const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {},
};

export const WithSelectedDate: Story = {
  args: {
    selectedDate: new Date(),
  },
}; 