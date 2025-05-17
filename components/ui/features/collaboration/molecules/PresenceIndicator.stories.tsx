/**
 * PresenceIndicator Component Stories
 * 
 * Storybook stories for the PresenceIndicator component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { PresenceIndicator } from './PresenceIndicator';
import { useState, useEffect } from 'react';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof PresenceIndicator> = {
  title: 'UI/Features/collaboration/PresenceIndicator',
  component: PresenceIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 
          'The PresenceIndicator component shows which users are currently active on the page. ' +
          'This is a mock version for Storybook - the real component connects to Supabase Realtime.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    labelText: { control: 'text' },
    inactiveThresholdMinutes: { control: { type: 'number', min: 1, max: 60, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof PresenceIndicator>;

// ============================================================================
// MOCK COMPONENT
// ============================================================================

/**
 * Mock version of the PresenceIndicator for Storybook
 */
function MockPresenceIndicator({ 
  className = '', 
  labelText = 'Currently viewing:', 
  inactiveThresholdMinutes = 5 
}) {
  const [mockUsers, setMockUsers] = useState([
    {
      id: '1',
      name: 'Jane Davis',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      last_active: Date.now(),
    },
    {
      id: '2',
      name: 'Alex Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      last_active: Date.now() - 1 * 60 * 1000, // 1 minute ago
    },
    {
      id: '3',
      name: 'Michael Brown',
      avatar_url: null,
      last_active: Date.now() - 2 * 60 * 1000, // 2 minutes ago
    },
  ]);
  
  // Periodically update the last_active time to simulate real users
  useEffect(() => {
    const interval = setInterval(() => {
      setMockUsers(prev => 
        prev.map(user => ({
          ...user,
          last_active: Date.now() - Math.floor(Math.random() * 3 * 60 * 1000), // 0-3 min ago
        }))
      );
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Only show users who are active within the threshold
  const activeUsers = mockUsers.filter(
    user => Date.now() - user.last_active < inactiveThresholdMinutes * 60 * 1000
  );
  
  return (
    <div className={className}>
      <div className="flex items-center space-x-1">
        <span className="text-sm text-muted-foreground mr-2">{labelText}</span>
        <div className="flex -space-x-2">
          {activeUsers.map((user) => (
            <div key={user.id} className="relative">
              <img 
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} 
                alt={user.name}
                className="h-8 w-8 rounded-full border-2 border-background"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <em>Note: This is a mocked component for Storybook display only</em>
      </div>
    </div>
  );
}

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default presence indicator with multiple users
 */
export const Default: Story = {
  render: (args) => <MockPresenceIndicator {...args} />,
  args: {
    labelText: 'Currently viewing:',
    inactiveThresholdMinutes: 5,
  },
};

/**
 * With custom label
 */
export const CustomLabel: Story = {
  render: (args) => <MockPresenceIndicator {...args} />,
  args: {
    labelText: 'Active collaborators:',
    inactiveThresholdMinutes: 5,
  },
};

/**
 * With shorter inactivity threshold
 */
export const ShortThreshold: Story = {
  render: (args) => <MockPresenceIndicator {...args} />,
  args: {
    labelText: 'Online now:',
    inactiveThresholdMinutes: 2,
  },
}; 