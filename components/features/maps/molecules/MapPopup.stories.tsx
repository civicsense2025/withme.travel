import type { Meta, StoryObj } from '@storybook/react';
import { MapPopup } from './MapPopup';

/**
 * Storybook stories for the MapPopup molecule
 * Shows popup for map markers with different content and states
 */
const meta: Meta<typeof MapPopup> = {
  title: 'Features/Maps/Molecules/MapPopup',
  component: MapPopup,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Popup title' },
    description: { control: 'text', description: 'Popup description' },
    isActive: { control: 'boolean', description: 'Whether the popup is active/selected' },
    onClose: { action: 'onClose', description: 'Close handler' },
  },
};
export default meta;
type Story = StoryObj<typeof MapPopup>;

export const Default: Story = {
  args: {
    title: 'Central Park',
    description: 'A large public park in New York City.',
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    title: 'Eiffel Tower',
    description: 'Iconic Paris landmark.',
    isActive: true,
  },
}; 