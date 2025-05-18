import type { Meta, StoryObj } from '@storybook/react';
import { DestinationHeader } from './DestinationHeader';
import { Card } from '@/components/ui/card';

const meta: Meta<typeof DestinationHeader> = {
  title: 'Destinations/Molecules/DestinationHeader',
  component: DestinationHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { 
      control: 'text',
      description: 'The destination name'
    },
    country: {
      control: 'text',
      description: 'The country name'
    },
    emoji: {
      control: 'text',
      description: 'Emoji representing the destination'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  },
  decorators: [
    (Story) => (
      <Card className="w-[400px]">
        <Story />
      </Card>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DestinationHeader>;

export const Default: Story = {
  args: {
    name: 'Paris',
    country: 'France',
    emoji: '🇫🇷',
  },
};

export const WithoutEmoji: Story = {
  args: {
    name: 'Rome',
    country: 'Italy',
  },
};

export const WithoutCountry: Story = {
  args: {
    name: 'Tokyo',
    emoji: '🇯🇵',
  },
};

export const LongName: Story = {
  args: {
    name: 'São Paulo Metropolitan Area',
    country: 'Brazil',
    emoji: '🇧🇷',
  },
};

export const AsianDestination: Story = {
  args: {
    name: '東京',
    country: 'Japan',
    emoji: '🗼',
  },
}; 