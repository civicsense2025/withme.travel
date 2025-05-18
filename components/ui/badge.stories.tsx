import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'danger', 'warning'],
      description: 'The color variant of the badge',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
    color: 'default',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Badge',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Badge',
    color: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Badge',
    color: 'success',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Badge',
    color: 'danger',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning Badge',
    color: 'warning',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M20 6L9 17L4 12"></path>
        </svg>
        Badge with Icon
      </>
    ),
    color: 'success',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge color="default">Default</Badge>
      <Badge color="primary">Primary</Badge>
      <Badge color="secondary">Secondary</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="danger">Danger</Badge>
      <Badge color="warning">Warning</Badge>
    </div>
  ),
};
