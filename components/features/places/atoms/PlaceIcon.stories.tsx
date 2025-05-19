import type { Meta, StoryObj } from '@storybook/react';
import { PlaceIcon } from './PlaceIcon';
import { PlaceCategory } from '@/types/places';

const meta: Meta<typeof PlaceIcon> = {
  title: 'Features/Places/Atoms/PlaceIcon',
  component: PlaceIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: Object.values(PlaceCategory),
      description: 'The category of the place'
    },
    size: {
      control: { type: 'range', min: 16, max: 48, step: 4 },
      description: 'Size of the icon in pixels'
    },
    color: {
      control: 'color',
      description: 'Color of the icon'
    }
  },
};

export default meta;
type Story = StoryObj<typeof PlaceIcon>;

// Base story with default values
export const Default: Story = {
  args: {
    category: PlaceCategory.RESTAURANT,
    size: 24,
    color: 'currentColor',
  },
};

// Story with all icon variants
export const AllCategories: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 items-center justify-center p-4">
      {Object.values(PlaceCategory).map((category) => (
        <div key={category} className="flex flex-col items-center gap-2 w-24">
          <PlaceIcon category={category} size={32} />
          <span className="text-xs text-center">{category}</span>
        </div>
      ))}
    </div>
  ),
};

// Small icons
export const Small: Story = {
  args: {
    category: PlaceCategory.HOTEL,
    size: 16,
  },
};

// Large icons
export const Large: Story = {
  args: {
    category: PlaceCategory.LANDMARK,
    size: 48,
  },
};

// Colored icons
export const Colored: Story = {
  args: {
    category: PlaceCategory.ATTRACTION,
    size: 32,
    color: '#FF5733',
  },
}; 