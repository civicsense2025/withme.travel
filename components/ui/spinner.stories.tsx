import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 12, max: 96, step: 4 },
      description: 'The size of the spinner in pixels',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 24,
  },
};

export const Small: Story = {
  args: {
    size: 16,
  },
};

export const Medium: Story = {
  args: {
    size: 32,
  },
};

export const Large: Story = {
  args: {
    size: 48,
  },
};

export const CustomColor: Story = {
  args: {
    size: 32,
    className: 'text-green-500',
  },
};

export const InButton: Story = {
  render: () => (
    <button
      className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2 disabled:opacity-70"
      disabled
    >
      <Spinner size={16} className="text-white" />
      Loading...
    </button>
  ),
};

export const SpinnerSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={32} />
      <Spinner size={48} />
    </div>
  ),
};

export const SpinnerColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size={24} className="text-primary" />
      <Spinner size={24} className="text-green-500" />
      <Spinner size={24} className="text-yellow-500" />
      <Spinner size={24} className="text-red-500" />
      <Spinner size={24} className="text-blue-500" />
      <Spinner size={24} className="text-purple-500" />
    </div>
  ),
};
