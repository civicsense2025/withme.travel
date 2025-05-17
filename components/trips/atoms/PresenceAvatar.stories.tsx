import type { Meta, StoryObj } from '@storybook/react';
import { PresenceAvatar } from './PresenceAvatar';

const meta: Meta<typeof PresenceAvatar> = {
  title: 'Trips/Atoms/PresenceAvatar',
  component: PresenceAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy', 'none'],
    },
    border: {
      control: 'select',
      options: ['none', 'thin', 'thick'],
    },
    showStatus: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PresenceAvatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
    status: 'online',
    showStatus: true,
    border: 'thin',
  },
};

export const WithImage: Story = {
  args: {
    ...Default.args,
    imageUrl: 'https://i.pravatar.cc/300?u=john',
  },
};

export const Offline: Story = {
  args: {
    ...Default.args,
    status: 'offline',
  },
};

export const Away: Story = {
  args: {
    ...Default.args,
    status: 'away',
  },
};

export const Busy: Story = {
  args: {
    ...Default.args,
    status: 'busy',
  },
};

export const NoStatus: Story = {
  args: {
    ...Default.args,
    status: 'none',
  },
};

export const ExtraSmall: Story = {
  args: {
    ...Default.args,
    size: 'xs',
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

export const ExtraLarge: Story = {
  args: {
    ...Default.args,
    size: 'xl',
  },
};

export const ThickBorder: Story = {
  args: {
    ...Default.args,
    border: 'thick',
  },
};

export const NoBorder: Story = {
  args: {
    ...Default.args,
    border: 'none',
  },
};

export const InitialsGeneration: Story = {
  args: {
    ...Default.args,
    name: 'Jane Smith'
  }
};

export const LongName: Story = {
  args: {
    ...Default.args,
    name: 'Ana Maria Rodriguez Garcia'
  }
};

// Group of avatars to demonstrate z-index stacking
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-3">
      <PresenceAvatar
        name="John Doe"
        status="online"
        zIndex={4}
      />
      <PresenceAvatar
        name="Jane Smith"
        status="away"
        zIndex={3}
      />
      <PresenceAvatar
        name="Bob Johnson"
        status="offline"
        zIndex={2}
      />
      <PresenceAvatar
        name="Alice Brown"
        status="busy"
        zIndex={1}
      />
    </div>
  ),
}; 