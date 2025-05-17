import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseMarketingSection } from './ExpenseMarketingSection';

const meta: Meta<typeof ExpenseMarketingSection> = {
  title: 'Product Marketing/ExpenseMarketingSection',
  component: ExpenseMarketingSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpenseMarketingSection>;

export const Default: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const Dark: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}; 