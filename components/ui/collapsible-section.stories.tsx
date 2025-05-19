import type { Meta, StoryObj } from '@storybook/react';
import { FileText, Map, Users } from 'lucide-react';
import { CollapsibleSection } from './collapsible-section';
import React from 'react';

// Redefine the meta type more specifically with args
const meta = {
  title: 'UI/CollapsibleSection',
  component: CollapsibleSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Trip Details',
    defaultOpen: false,
    children: <p className="text-muted-foreground">This section contains details about your trip, including dates, destination, and other important information.</p>,
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Accommodation',
    icon: <FileText size={16} />,
    defaultOpen: true,
    children: (
      <div className="space-y-2">
        <p>Grand Hotel</p>
        <p className="text-muted-foreground text-sm">123 Main Street, Downtown</p>
        <p className="text-muted-foreground text-sm">Check-in: Jun 15, 2023</p>
        <p className="text-muted-foreground text-sm">Check-out: Jun 20, 2023</p>
      </div>
    ),
  },
};

export const CustomStyles: Story = {
  args: {
    title: 'Location',
    icon: <Map size={16} />,
    defaultOpen: true,
    className: 'border-primary/20',
    headerClassName: 'bg-primary/5',
    contentClassName: 'bg-background/50',
    children: (
      <div className="p-2 bg-background rounded">
        <p>Paris, France</p>
        <p className="text-muted-foreground text-sm">Popular attractions nearby</p>
      </div>
    ),
  },
};

// For the multiple example, define as a separate named story
export const Multiple: Story = {
  name: 'Multiple Collapsibles',
  args: {
    title: 'Dummy Title',  // Required but not used in render
    children: <></>,  // Required but not used in render
  },
  // Override the rendering with custom component
  render: function Render() {
    return (
      <div className="space-y-2 w-[400px]">
        <CollapsibleSection 
          title="Trip Details" 
          defaultOpen={true}
        >
          <p className="text-sm">Summer vacation in Europe</p>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Participants" 
          icon={<Users size={16} />}
        >
          <ul className="list-disc pl-4 text-sm">
            <li>John Doe</li>
            <li>Jane Smith</li>
            <li>Alex Johnson</li>
          </ul>
        </CollapsibleSection>
        
        <CollapsibleSection 
          title="Accommodations" 
          icon={<FileText size={16} />}
        >
          <div className="text-sm">
            <p>Grand Hotel Paris</p>
            <p className="text-muted-foreground">3 rooms, 5 nights</p>
          </div>
        </CollapsibleSection>
      </div>
    );
  },
}; 