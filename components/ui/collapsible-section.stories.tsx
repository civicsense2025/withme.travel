import type { Meta, StoryObj } from '@storybook/react';
import { CollapsibleSection } from './collapsible-section';

/**
 * Storybook stories for the CollapsibleSection component
 * @module ui/CollapsibleSection
 */
const meta: Meta<typeof CollapsibleSection> = {
  title: 'UI/CollapsibleSection',
  component: CollapsibleSection,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    children: 'Section content goes here.',
  },
};

export const OpenByDefault: Story = {
  args: {
    title: 'Open Section',
    children: 'This section is open by default.',
    defaultOpen: true,
  },
}; 