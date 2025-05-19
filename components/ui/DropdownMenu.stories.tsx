import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from './dropdown-menu';

/**
 * Storybook stories for the DropdownMenu component
 * @module ui/DropdownMenu
 */
const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ],
  },
};

export const WithManyOptions: Story = {
  args: {
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
    ],
  },
}; 