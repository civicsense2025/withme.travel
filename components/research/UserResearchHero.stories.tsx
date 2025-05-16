import { Meta, StoryObj } from '@storybook/react';
import { UserResearchHero } from './UserResearchHero';

const meta: Meta<typeof UserResearchHero> = {
  title: 'Research/UserResearchHero',
  component: UserResearchHero,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    headline: {
      control: 'text',
      description: 'Main headline for the hero section',
    },
    subheadline: {
      control: 'text',
      description: 'Supporting text below the headline',
    },
    showBackgroundAnimation: {
      control: 'boolean',
      description: 'Whether to show animated background elements',
    },
  },
};

export default meta;

type Story = StoryObj<typeof UserResearchHero>;

// Basic hero with default props
export const Default: Story = {
  args: {
    headline: '✈️ Join us in reimagining group travel',
    subheadline: 'Get early access to withme.travel and help shape how friends plan adventures together. Be part of our community building the future of trip planning.',
  },
};

// Hero without background animation
export const NoBackgroundAnimation: Story = {
  args: {
    ...Default.args,
    showBackgroundAnimation: false,
  },
};

// Hero with children content
export const WithContent: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => (
    <UserResearchHero {...args}>
      <div className="p-6 rounded-lg text-center border border-border bg-card">
        <h3 className="text-xl font-bold mb-2 text-foreground">Custom Content</h3>
        <p className="text-muted-foreground">This is custom content rendered as children of the hero component.</p>
      </div>
    </UserResearchHero>
  ),
};

// Mobile view
export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}; 