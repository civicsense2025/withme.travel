import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './accordion';

/**
 * Storybook stories for the Accordion component
 * @module ui/Accordion
 */
const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    items: [
      { id: 'panel1', title: 'Panel 1', content: 'Content for panel 1' },
      { id: 'panel2', title: 'Panel 2', content: 'Content for panel 2' },
    ],
  },
};

export const MultipleOpen: Story = {
  args: {
    items: [
      { id: 'panel1', title: 'Panel 1', content: 'Content for panel 1', open: true },
      { id: 'panel2', title: 'Panel 2', content: 'Content for panel 2', open: true },
    ],
  },
}; 