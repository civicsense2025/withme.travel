/**
 * Storybook stories for FullBleedSection
 * 
 * @module ui/features/core/atoms/FullBleedSection.stories
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FullBleedSection } from './FullBleedSection';

const meta: Meta<typeof FullBleedSection> = {
  title: 'UI/Core/Atoms/FullBleedSection',
  component: FullBleedSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof FullBleedSection>;

export const Default: Story = {
  args: {
    children: (
      <div className="text-center text-2xl font-bold text-white bg-blue-500/80 rounded-xl p-12 mx-auto max-w-2xl">
        This is a full-bleed section. Content stretches edge-to-edge.
      </div>
    ),
  },
};

export const WithBackgroundAndPadding: Story = {
  args: {
    backgroundClassName: 'bg-gradient-to-r from-purple-500 to-pink-500',
    paddingClassName: 'py-32',
    children: (
      <div className="text-center text-3xl font-semibold text-white">
        FullBleedSection with gradient background and extra vertical padding
      </div>
    ),
  },
}; 