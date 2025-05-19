import type { Meta, StoryObj } from '@storybook/react';
import { LiveRegion } from './live-region';

/**
 * Storybook stories for the LiveRegion component
 * @module ui/LiveRegion
 */
const meta: Meta<typeof LiveRegion> = {
  title: 'UI/LiveRegion',
  component: LiveRegion,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof LiveRegion>;

export const Polite: Story = {
  args: {
    message: 'This is a polite live region message.',
    politeness: 'polite',
  },
};

export const Assertive: Story = {
  args: {
    message: 'This is an assertive live region message!',
    politeness: 'assertive',
  },
};

export const Visible: Story = {
  args: {
    message: 'Visible live region message.',
    visuallyHidden: false,
  },
}; 