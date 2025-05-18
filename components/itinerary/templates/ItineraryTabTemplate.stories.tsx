import type { Meta, StoryObj } from '@storybook/react';
import { ItineraryTabTemplate } from './ItineraryTabTemplate';
import { ItineraryDaySection, UnscheduledItemsSection } from '../molecules';

const meta: Meta<typeof ItineraryTabTemplate> = {
  title: 'Itinerary/Templates/ItineraryTabTemplate',
  component: ItineraryTabTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onAddItem: { action: 'add item clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ItineraryTabTemplate>;

// Mock data for stories
const mockItems = [
  {
    id: '1',
    title: 'Visit Eiffel Tower',
    description: 'Experience the iconic landmark',
    day_number: 1,
    category: 'attraction',
    votes: [],
    creatorProfile: null,
    section_id: 'section-1',
    type: 'activity',
    status: 'confirmed',
    position: 1,
    place_id: 'place-1',
    details: {},
  },
  {
    id: '2',
    title: 'Lunch at Le Café Marly',
    description: 'Enjoy the view of the Louvre Pyramid',
    day_number: 1,
    category: 'food',
    votes: [],
    creatorProfile: null,
    section_id: 'section-1',
    type: 'food',
    status: 'confirmed',
    position: 2,
    place_id: 'place-2',
    details: {},
  },
  {
    id: '3',
    title: 'Museum Visit',
    description: 'Check out the modern art museum',
    day_number: null,
    category: 'culture',
    votes: [],
    creatorProfile: null,
    section_id: 'section-unscheduled',
    type: 'activity',
    status: 'suggested',
    position: 1,
    place_id: 'place-3',
    details: {},
  },
];

const day1Items = mockItems.filter(item => item.day_number === 1);
const unscheduledItems = mockItems.filter(item => item.day_number === null);

export const Default: Story = {
  args: {
    sections: (
      <>
        <UnscheduledItemsSection 
          items={unscheduledItems} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
        <ItineraryDaySection
          title="Day 1"
          items={day1Items}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </>
    ),
  },
};

export const CustomButtonText: Story = {
  args: {
    sections: (
      <>
        <UnscheduledItemsSection 
          items={unscheduledItems} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
        <ItineraryDaySection
          title="Day 1"
          items={day1Items}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </>
    ),
    addButtonText: 'Add New Activity',
  },
};

export const EmptyItinerary: Story = {
  args: {
    sections: (
      <div className="p-6 text-center text-muted-foreground">
        No items in the itinerary yet. Click the button below to add your first item.
      </div>
    ),
    addButtonText: 'Create Your First Itinerary Item',
  },
}; 