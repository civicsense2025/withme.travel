import type { Meta, StoryObj } from '@storybook/react';
import { MilestoneTriggerEditor } from './MilestoneTriggerEditor';
import { useState } from 'react';
import { action } from '@storybook/addon-actions';

/**
 * `MilestoneTriggerEditor` allows for editing milestone triggers that define
 * when to show surveys based on user actions or milestones.
 */
const meta: Meta<typeof MilestoneTriggerEditor> = {
  title: 'UI/MilestoneTriggerEditor',
  component: MilestoneTriggerEditor,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg p-6 border rounded-lg shadow-sm bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MilestoneTriggerEditor>;

// Default milestone options
const defaultMilestoneOptions = [
  { value: 'trip_created', label: 'Trip Created' },
  { value: 'trip_completed', label: 'Trip Completed' },
  { value: 'itinerary_edited', label: 'Itinerary Edited' },
  { value: 'group_created', label: 'Group Created' },
  { value: 'user_onboarded', label: 'User Onboarded' },
];

// Interactive component with state
const InteractiveMilestoneTriggerEditor = ({ initialTrigger, milestoneOptions }: any) => {
  const [trigger, setTrigger] = useState(initialTrigger);
  
  const handleChange = (newTrigger: any) => {
    setTrigger(newTrigger);
    action('onChange')(newTrigger);
  };
  
  return (
    <MilestoneTriggerEditor
      trigger={trigger}
      onChange={handleChange}
      onDelete={action('onDelete')}
      milestoneOptions={milestoneOptions}
    />
  );
};

/**
 * Default state with a trip created trigger
 */
export const Default: Story = {
  render: () => (
    <InteractiveMilestoneTriggerEditor
      initialTrigger={{
        id: 'trigger-1',
        milestone: 'trip_created',
        priority: 'medium',
        is_required: false,
        trigger_delay: 'immediately',
      }}
      milestoneOptions={defaultMilestoneOptions}
    />
  ),
};

/**
 * High priority required trigger
 */
export const HighPriorityRequired: Story = {
  render: () => (
    <InteractiveMilestoneTriggerEditor
      initialTrigger={{
        id: 'trigger-2',
        milestone: 'user_onboarded',
        priority: 'high',
        is_required: true,
        trigger_delay: 'immediately',
      }}
      milestoneOptions={defaultMilestoneOptions}
    />
  ),
};

/**
 * Delayed trigger after trip completion
 */
export const DelayedTrigger: Story = {
  render: () => (
    <InteractiveMilestoneTriggerEditor
      initialTrigger={{
        id: 'trigger-3',
        milestone: 'trip_completed',
        priority: 'medium',
        is_required: false,
        trigger_delay: 'delayed',
      }}
      milestoneOptions={defaultMilestoneOptions}
    />
  ),
};

/**
 * Multiple triggers example
 */
export const MultipleTriggers: Story = {
  render: () => (
    <div className="space-y-4">
      <InteractiveMilestoneTriggerEditor
        initialTrigger={{
          id: 'trigger-4',
          milestone: 'trip_created',
          priority: 'medium',
          is_required: false,
          trigger_delay: 'immediately',
        }}
        milestoneOptions={defaultMilestoneOptions}
      />
      
      <InteractiveMilestoneTriggerEditor
        initialTrigger={{
          id: 'trigger-5',
          milestone: 'itinerary_edited',
          priority: 'low',
          is_required: false,
          trigger_delay: 'delayed',
        }}
        milestoneOptions={defaultMilestoneOptions}
      />
      
      <InteractiveMilestoneTriggerEditor
        initialTrigger={{
          id: 'trigger-6',
          milestone: 'user_onboarded',
          priority: 'high',
          is_required: true,
          trigger_delay: 'immediately',
        }}
        milestoneOptions={defaultMilestoneOptions}
      />
    </div>
  ),
}; 