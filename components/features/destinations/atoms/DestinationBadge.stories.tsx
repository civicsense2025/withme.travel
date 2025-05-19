import type { Meta, StoryObj } from '@storybook/react';
import { Globe, Calendar, Briefcase, Star, Tag } from 'lucide-react';
import { DestinationBadge } from './DestinationBadge';

const meta: Meta<typeof DestinationBadge> = {
  title: 'Destinations/Atoms/DestinationBadge',
  component: DestinationBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Badge Text',
  },
};

export default meta;
type Story = StoryObj<typeof DestinationBadge>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Europe',
    icon: <Globe className="h-4 w-4" />,
    variant: 'continent',
  },
};

export const Season: Story = {
  args: {
    children: 'Summer',
    icon: <Calendar className="h-4 w-4" />,
    variant: 'season',
  },
};

export const Category: Story = {
  args: {
    children: 'Beach',
    icon: <Tag className="h-4 w-4" />,
    variant: 'category',
  },
};

export const Cost: Story = {
  args: {
    children: '$100/day',
    icon: <Briefcase className="h-4 w-4" />,
    variant: 'cost',
  },
};

export const Highlight: Story = {
  args: {
    children: 'Must Visit',
    icon: <Star className="h-4 w-4" />,
    variant: 'highlight',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <DestinationBadge variant="default">Default</DestinationBadge>
      <DestinationBadge variant="continent" icon={<Globe className="h-4 w-4" />}>Continent</DestinationBadge>
      <DestinationBadge variant="season" icon={<Calendar className="h-4 w-4" />}>Season</DestinationBadge>
      <DestinationBadge variant="category" icon={<Tag className="h-4 w-4" />}>Category</DestinationBadge>
      <DestinationBadge variant="cost" icon={<Briefcase className="h-4 w-4" />}>Cost</DestinationBadge>
      <DestinationBadge variant="highlight" icon={<Star className="h-4 w-4" />}>Highlight</DestinationBadge>
    </div>
  ),
}; 