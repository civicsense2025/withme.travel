import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SharedPresenceSection } from './SharedPresenceSection';

const meta: Meta<typeof SharedPresenceSection> = {
  title: 'Product Marketing/SharedPresenceSection',
  component: SharedPresenceSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A real-time presence and collaboration demo for group trip planning. Fully themeable and design-system compliant.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SharedPresenceSection>;

export const Default: Story = {
  render: () => <SharedPresenceSection />,
  parameters: {
    docs: {
      description: {
        story: 'Default shared presence section in light mode.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Shared presence section in dark mode.',
      },
    },
  },
};
