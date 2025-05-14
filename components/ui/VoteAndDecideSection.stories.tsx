import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VoteAndDecideSection } from './VoteAndDecideSection';

const meta: Meta<typeof VoteAndDecideSection> = {
  title: 'Product Marketing/VoteAndDecideSection',
  component: VoteAndDecideSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A collaborative poll/voting section demo for group decision making. Fully themeable and design-system compliant.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VoteAndDecideSection>;

export const Default: Story = {
  render: () => <VoteAndDecideSection />,
  parameters: {
    docs: {
      description: {
        story: 'Default voting section in light mode.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: { mode: 'dark' },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Voting section in dark mode.',
      },
    },
  },
};
