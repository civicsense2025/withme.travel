import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Core UI/Data Display/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Badges are used to highlight status, categories, or labels. They come in various colors and styles to convey different meanings.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'travel-purple',
        'travel-blue',
        'travel-pink',
        'travel-yellow',
        'travel-mint',
        'travel-peach',
        'success',
        'warning',
        'info',
        'error',
      ],
      description: 'Badge visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    radius: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full', 'none'],
      description: 'Border radius of the badge',
      table: {
        defaultValue: { summary: 'full' },
      },
    },
    children: {
      control: 'text',
      description: 'Badge content',
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
    variant: 'default',
    radius: 'full',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The standard badge variants.',
      },
    },
  },
};

export const TravelColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="travel-purple">Purple</Badge>
      <Badge variant="travel-blue">Blue</Badge>
      <Badge variant="travel-pink">Pink</Badge>
      <Badge variant="travel-yellow">Yellow</Badge>
      <Badge variant="travel-mint">Mint</Badge>
      <Badge variant="travel-peach">Peach</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Travel-themed color variants for branding consistency.',
      },
    },
  },
};

export const Status: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="error">Error</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges for communicating system states.',
      },
    },
  },
};

export const BorderRadius: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge radius="none">No Radius</Badge>
      <Badge radius="sm">Small Radius</Badge>
      <Badge radius="md">Medium Radius</Badge>
      <Badge radius="lg">Large Radius</Badge>
      <Badge radius="xl">Extra Large Radius</Badge>
      <Badge radius="full">Full Radius</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different border radius options for badges.',
      },
    },
  },
};

export const Usage: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span className="text-sm">Feature status:</span>
        <Badge variant="success" radius="md">
          Stable
        </Badge>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm">Trip category:</span>
        <Badge variant="travel-blue" radius="md">
          Beach Vacation
        </Badge>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm">Membership tier:</span>
        <Badge variant="travel-purple">Premium</Badge>
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-sm">Notification:</span>
        <Badge variant="warning" radius="md">
          2 days left
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of badges in real-world usage scenarios.',
      },
    },
  },
};

export const LightMode: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
    radius: 'full',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: { description: { story: 'Badge in light mode.' } },
  },
};

export const DarkMode: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
    radius: 'full',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: { description: { story: 'Badge in dark mode.' } },
  },
};
