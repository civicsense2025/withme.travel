import type { Meta, StoryObj } from '@storybook/react';
import { ActivityIcon, ActivityType } from './ActivityIcon';

const meta: Meta<typeof ActivityIcon> = {
  title: 'Trips/Atoms/ActivityIcon',
  component: ActivityIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'food', 'lodging', 'flight', 'location', 'ticket', 
        'event', 'attraction', 'cafe', 'beach', 'museum', 
        'biking', 'nature', 'bus', 'train', 'car', 
        'shopping', 'photo', 'music', 'sunset', 'boat', 
        'drink', 'camping', 'hiking', 'architecture', 'other'
      ],
    },
    size: {
      control: 'number',
    },
    withBackground: {
      control: 'boolean',
    },
    bgColor: {
      control: 'select',
      options: ['default', 'primary', 'muted', 'none', 'auto'],
    },
    strokeWidth: {
      control: 'number',
    },
    solid: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityIcon>;

export const Default: Story = {
  args: {
    type: 'food',
    size: 24,
    withBackground: false,
    bgColor: 'auto',
    strokeWidth: 2,
    solid: false,
  },
};

export const WithBackground: Story = {
  args: {
    ...Default.args,
    withBackground: true,
  },
};

export const SolidBackground: Story = {
  args: {
    ...Default.args,
    withBackground: true,
    solid: true,
  },
};

export const DifferentSize: Story = {
  args: {
    ...Default.args,
    size: 32,
  },
};

export const ThinnerStroke: Story = {
  args: {
    ...Default.args,
    strokeWidth: 1.5,
  },
};

export const PrimaryBackground: Story = {
  args: {
    ...Default.args,
    withBackground: true,
    bgColor: 'primary',
  },
};

// Show all activity types
export const AllActivityTypes: Story = {
  render: () => {
    // All activity types
    const allTypes: ActivityType[] = [
      'food', 'lodging', 'flight', 'location', 'ticket', 
      'event', 'attraction', 'cafe', 'beach', 'museum', 
      'biking', 'nature', 'bus', 'train', 'car', 
      'shopping', 'photo', 'music', 'sunset', 'boat', 
      'drink', 'camping', 'hiking', 'architecture', 'other'
    ];
    
    return (
      <div className="grid grid-cols-5 gap-4">
        {allTypes.map((type) => (
          <div key={type} className="flex flex-col items-center">
            <ActivityIcon type={type} size={24} />
            <span className="mt-2 text-xs">{type}</span>
          </div>
        ))}
      </div>
    );
  },
};

// Show all with background
export const AllWithBackground: Story = {
  render: () => {
    // All activity types
    const allTypes: ActivityType[] = [
      'food', 'lodging', 'flight', 'location', 'ticket', 
      'event', 'attraction', 'cafe', 'beach', 'museum', 
      'biking', 'nature', 'bus', 'train', 'car', 
      'shopping', 'photo', 'music', 'sunset', 'boat', 
      'drink', 'camping', 'hiking', 'architecture', 'other'
    ];
    
    return (
      <div className="grid grid-cols-5 gap-4">
        {allTypes.map((type) => (
          <div key={type} className="flex flex-col items-center">
            <ActivityIcon type={type} size={24} withBackground />
            <span className="mt-2 text-xs">{type}</span>
          </div>
        ))}
      </div>
    );
  },
};

// Show all with solid background
export const AllWithSolidBackground: Story = {
  render: () => {
    // All activity types
    const allTypes: ActivityType[] = [
      'food', 'lodging', 'flight', 'location', 'ticket', 
      'event', 'attraction', 'cafe', 'beach', 'museum', 
      'biking', 'nature', 'bus', 'train', 'car', 
      'shopping', 'photo', 'music', 'sunset', 'boat', 
      'drink', 'camping', 'hiking', 'architecture', 'other'
    ];
    
    return (
      <div className="grid grid-cols-5 gap-4">
        {allTypes.map((type) => (
          <div key={type} className="flex flex-col items-center">
            <ActivityIcon 
              type={type} 
              size={24} 
              withBackground 
              solid 
            />
            <span className="mt-2 text-xs">{type}</span>
          </div>
        ))}
      </div>
    );
  },
}; 