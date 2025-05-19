import type { Meta, StoryObj } from '@storybook/react';
import { PlaceRating } from './PlaceRating';

const meta: Meta<typeof PlaceRating> = {
  title: 'Features/Places/Atoms/PlaceRating',
  component: PlaceRating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      description: 'Rating value (0-5)'
    },
    count: {
      control: { type: 'number' },
      description: 'Number of ratings'
    },
    maxRating: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Maximum rating value'
    },
    starSize: {
      control: { type: 'range', min: 12, max: 32, step: 2 },
      description: 'Size of stars in pixels'
    },
    showNumeric: {
      control: 'boolean',
      description: 'Show numeric rating value'
    },
    showCount: {
      control: 'boolean',
      description: 'Show count of ratings'
    },
    colorFilled: {
      control: 'color',
      description: 'Color for filled stars'
    },
    colorEmpty: {
      control: 'color',
      description: 'Color for empty stars'
    }
  },
};

export default meta;
type Story = StoryObj<typeof PlaceRating>;

// Default story
export const Default: Story = {
  args: {
    rating: 4.5,
    count: 123,
    maxRating: 5,
    starSize: 16,
    showNumeric: true,
    showCount: true,
  },
};

// Perfect rating
export const Perfect: Story = {
  args: {
    rating: 5,
    count: 42,
    maxRating: 5,
    starSize: 18,
    showNumeric: true,
    showCount: true,
  },
};

// Low rating
export const LowRating: Story = {
  args: {
    rating: 2.3,
    count: 18,
    maxRating: 5,
    starSize: 16,
    showNumeric: true,
    showCount: true,
  },
};

// Large stars
export const LargeStars: Story = {
  args: {
    rating: 4.2,
    count: 87,
    maxRating: 5,
    starSize: 28,
    showNumeric: true,
    showCount: true,
  },
};

// Without numeric display
export const StarsOnly: Story = {
  args: {
    rating: 3.7,
    count: 56,
    maxRating: 5,
    starSize: 20,
    showNumeric: false,
    showCount: false,
  },
};

// With custom colors
export const CustomColors: Story = {
  args: {
    rating: 4.0,
    count: 129,
    maxRating: 5,
    starSize: 16,
    showNumeric: true,
    showCount: true,
    colorFilled: 'text-green-500',
    colorEmpty: 'text-slate-200',
  },
};

// Different variants in a group
export const RatingVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <PlaceRating rating={5} count={1248} />
      <PlaceRating rating={4.5} count={623} />
      <PlaceRating rating={3.7} count={98} />
      <PlaceRating rating={2.9} count={45} />
      <PlaceRating rating={1.2} count={12} />
    </div>
  ),
}; 