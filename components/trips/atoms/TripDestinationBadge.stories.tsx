import type { Meta, StoryObj } from '@storybook/react';
import { TripDestinationBadge } from './TripDestinationBadge';

const meta: Meta<typeof TripDestinationBadge> = {
  title: 'Trips/Atoms/TripDestinationBadge',
  component: TripDestinationBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'muted'],
    },
    showIcon: {
      control: 'boolean',
    },
    countryCode: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TripDestinationBadge>;

export const Default: Story = {
  args: {
    destination: 'Paris, France',
    size: 'md',
    color: 'default',
    showIcon: true,
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
};

export const PrimaryColor: Story = {
  args: {
    ...Default.args,
    color: 'primary',
  },
};

export const SecondaryColor: Story = {
  args: {
    ...Default.args,
    color: 'secondary',
  },
};

export const MutedColor: Story = {
  args: {
    ...Default.args,
    color: 'muted',
  },
};

export const NoIcon: Story = {
  args: {
    ...Default.args,
    showIcon: false,
  },
};

export const WithShortDestination: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    destination: 'San Francisco, California, USA',
    shortDestination: 'SF',
  },
};

export const LongDestination: Story = {
  args: {
    ...Default.args,
    destination: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, Wales',
  },
}; 