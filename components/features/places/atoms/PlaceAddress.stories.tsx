import type { Meta, StoryObj } from '@storybook/react';
import { PlaceAddress } from './PlaceAddress';

const meta: Meta<typeof PlaceAddress> = {
  title: 'Features/Places/Atoms/PlaceAddress',
  component: PlaceAddress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    address: {
      control: 'text',
      description: 'The address to display'
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the map pin icon'
    },
    iconSize: {
      control: { type: 'range', min: 12, max: 32, step: 2 },
      description: 'Size of the icon in pixels'
    },
    maxLength: {
      control: { type: 'number' },
      description: 'Maximum length before truncating (0 for no truncation)'
    },
    interactive: {
      control: 'boolean',
      description: 'Whether to show tooltip on hover for truncated text'
    }
  },
};

export default meta;
type Story = StoryObj<typeof PlaceAddress>;

// Default story
export const Default: Story = {
  args: {
    address: '123 Main Street, New York, NY 10001',
    showIcon: true,
    iconSize: 16,
    maxLength: 0,
    interactive: true,
  },
};

// With truncation
export const Truncated: Story = {
  args: {
    address: '123 Main Street, Apartment 4B, New York, NY 10001, United States of America',
    showIcon: true,
    iconSize: 16,
    maxLength: 30,
    interactive: true,
  },
};

// Without icon
export const WithoutIcon: Story = {
  args: {
    address: '123 Main Street, New York, NY 10001',
    showIcon: false,
  },
};

// Larger icon
export const LargeIcon: Story = {
  args: {
    address: '123 Main Street, New York, NY 10001',
    showIcon: true,
    iconSize: 24,
  },
};

// Multiple address variants
export const AddressVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <PlaceAddress 
        address="123 Main Street, New York, NY 10001" 
      />
      <PlaceAddress 
        address="Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France" 
        maxLength={40}
      />
      <PlaceAddress 
        address="Via del Colosseo, 00184 Roma RM, Italy" 
        showIcon={false}
      />
      <PlaceAddress 
        address="1-1 Chiyoda, Chiyoda City, Tokyo 100-8111, Japan" 
        iconSize={20}
        textClassName="font-medium"
      />
    </div>
  ),
}; 