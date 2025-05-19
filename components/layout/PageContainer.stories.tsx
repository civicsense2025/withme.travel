import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Storybook stories for the PageContainer component
 * Shows container with children and custom background
 */
const meta: Meta<typeof PageContainer> = {
  title: 'Layout/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text', description: 'Content inside the container' },
  },
};
export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {
    children: 'This is a page container.',
  },
};

