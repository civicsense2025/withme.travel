import type { Meta, StoryObj } from '@storybook/react';
import { TripHeader } from '@/components/ui/features/trips/organisms/TripHeader';

const meta: Meta<typeof TripHeader> = {
  title: 'UI/Features/trips/trip-header',
  component: TripHeader,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof TripHeader>;

const mockProps = {
  coverImageUrl: '/images/default-trip-image.jpg',
  name: 'Summer in Europe',
  imageMetadata: {
    alt_text: 'Summer in Europe - Trip cover image',
    photographer: 'Jane Doe',
    source: 'Unsplash',
  },
};

export const Default: Story = { args: { ...mockProps } };
export const LightMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'light' } },
};
export const DarkMode: Story = {
  args: { ...mockProps },
  parameters: { backgrounds: { default: 'dark' } },
};
