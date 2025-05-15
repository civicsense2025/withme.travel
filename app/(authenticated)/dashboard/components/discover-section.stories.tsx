import type { Meta, StoryObj } from '@storybook/react';
import { DiscoverSection } from './discover-section';

const meta: Meta<typeof DiscoverSection> = {
  title: 'Dashboard/DiscoverSection',
  component: DiscoverSection,
};

export default meta;
type Story = StoryObj<typeof DiscoverSection>;

export const Default: Story = {}; 