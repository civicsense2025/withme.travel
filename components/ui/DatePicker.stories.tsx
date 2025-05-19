import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './date-picker';

/**
 * Storybook stories for the DatePicker component
 * @module ui/DatePicker
 */
const meta: Meta<typeof DatePicker> = {
  title: 'UI/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {},
};

export const WithSelectedDate: Story = {
  args: {
    value: new Date(),
  },
}; 