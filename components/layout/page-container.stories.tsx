import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from './page-container';

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
    background: { control: 'color', description: 'Background color' },
  },
};
export default meta;
type Story = StoryObj<typeof PageContainer>;

export const Default: Story = {
  args: {
    children: 'This is a page container.',
  },
};

export const CustomBackground: Story = {
  args: {
    children: 'Custom background example.',
    background: '#f0f0f0',
  },
}; 