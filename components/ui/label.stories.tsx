import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';

/**
 * Storybook stories for the Label component
 * @module ui/Label
 */
const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

export const WithHtmlFor: Story = {
  args: {
    children: 'Email',
    htmlFor: 'email-input',
  },
}; 