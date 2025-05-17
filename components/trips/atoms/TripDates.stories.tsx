import type { Meta, StoryObj } from '@storybook/react';
import { TripDates } from './TripDates';

const meta: Meta<typeof TripDates> = {
  title: 'Trips/Atoms/TripDates',
  component: TripDates,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['short', 'medium', 'long'],
    },
    showDuration: {
      control: 'boolean',
    },
    showMonth: {
      control: 'boolean',
    },
    showYear: {
      control: 'boolean',
    },
    separator: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TripDates>;

export const Default: Story = {
  args: {
    startDate: '2023-06-15',
    endDate: '2023-06-22',
    format: 'medium',
    showDuration: false,
    showMonth: true,
    showYear: true,
    separator: ' - ',
  },
};

export const WithDuration: Story = {
  args: {
    ...Default.args,
    showDuration: true,
  },
};

export const ShortFormat: Story = {
  args: {
    ...Default.args,
    format: 'short',
  },
};

export const LongFormat: Story = {
  args: {
    ...Default.args,
    format: 'long',
  },
};

export const NoYear: Story = {
  args: {
    ...Default.args,
    showYear: false,
  },
};

export const CustomSeparator: Story = {
  args: {
    ...Default.args,
    separator: ' → ',
  },
};

export const NoEndDate: Story = {
  args: {
    ...Default.args,
    endDate: null,
  },
};

export const NoDates: Story = {
  args: {
    startDate: null,
    endDate: null,
  },
}; 