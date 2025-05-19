import type { Meta, StoryObj } from '@storybook/react';
import { PlaceCategory } from './PlaceCategory';
import { PlaceCategory as PlaceCategoryEnum } from '@/types/places';

const meta: Meta<typeof PlaceCategory> = {
  title: 'Features/Places/Atoms/PlaceCategory',
  component: PlaceCategory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: Object.values(PlaceCategoryEnum),
      description: 'The category of the place'
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the icon'
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the label'
    },
    variant: {
      control: 'radio',
      options: ['badge', 'text', 'inline'],
      description: 'Visual style variant'
    },
    iconSize: {
      control: { type: 'range', min: 12, max: 32, step: 2 },
      description: 'Size of the icon in pixels'
    }
  },
};

export default meta;
type Story = StoryObj<typeof PlaceCategory>;

// Default text variant
export const Default: Story = {
  args: {
    category: PlaceCategoryEnum.RESTAURANT,
    showIcon: true,
    showLabel: true,
    variant: 'text',
    iconSize: 18,
  },
};

// Badge variant
export const Badge: Story = {
  args: {
    category: PlaceCategoryEnum.LANDMARK,
    showIcon: true,
    showLabel: true,
    variant: 'badge',
    iconSize: 16,
  },
};

// Inline variant
export const Inline: Story = {
  args: {
    category: PlaceCategoryEnum.HOTEL,
    showIcon: true,
    showLabel: true,
    variant: 'inline',
    iconSize: 16,
  },
};

// Icon only
export const IconOnly: Story = {
  args: {
    category: PlaceCategoryEnum.CAFE,
    showIcon: true,
    showLabel: false,
    iconSize: 24,
  },
};

// Label only
export const LabelOnly: Story = {
  args: {
    category: PlaceCategoryEnum.SHOPPING,
    showIcon: false,
    showLabel: true,
  },
};

// All categories showcase
export const AllCategories: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.values(PlaceCategoryEnum).map((category) => (
        <PlaceCategory 
          key={category}
          category={category} 
          variant="badge"
        />
      ))}
    </div>
  ),
}; 