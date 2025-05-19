import type { Meta, StoryObj } from '@storybook/react';
import { ClientFocusMode } from './ClientFocusMode';

// Mock focus session provider for stories
const mockSessionData = {
  // Mock no session
  none: {
    session: null,
    isLoading: false,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  },
  // Mock active session
  active: {
    session: {
      id: 'session-1',
      status: 'active',
      focusTime: 300, // 5 minutes
      activeParticipants: [
        { id: 'user-1', name: 'You' },
        { id: 'user-2', name: 'Jane Doe' },
        { id: 'user-3', name: 'John Smith' },
      ],
      startedAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  },
  // Mock paused session
  paused: {
    session: {
      id: 'session-1',
      status: 'paused',
      focusTime: 600, // 10 minutes
      activeParticipants: [
        { id: 'user-1', name: 'You' },
        { id: 'user-2', name: 'Jane Doe' },
      ],
      startedAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  },
  // Mock completed session
  completed: {
    session: {
      id: 'session-1',
      status: 'completed',
      focusTime: 1800, // 30 minutes
      activeParticipants: [
        { id: 'user-1', name: 'You' },
      ],
      startedAt: new Date().toISOString(),
    },
    isLoading: false,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  },
  // Mock loading state
  loading: {
    session: null,
    isLoading: true,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  },
};

// Mock the focus session provider hook
jest.mock('@/components/features/focus/focus-session-provider', () => {
  return {
    useFocusSession: () => mockSessionData.none,
  };
});

const meta: Meta<typeof ClientFocusMode> = {
  title: 'Features/Trips/Organisms/ClientFocusMode',
  component: ClientFocusMode,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tripId: {
      control: 'text',
      description: 'ID of the trip',
    },
    children: {
      control: { type: 'text' },
      description: 'Optional child content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClientFocusMode>;

// Basic story with the default (no session) state
export const Default: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state with no active focus session',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.none,
      },
    ],
  },
};

// Story showing an active focus session
export const ActiveSession: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus mode with an active session',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.active,
      },
    ],
  },
};

// Story showing a paused focus session
export const PausedSession: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus mode with a paused session',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.paused,
      },
    ],
  },
};

// Story showing a completed focus session
export const CompletedSession: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus mode with a completed session',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.completed,
      },
    ],
  },
};

// Story showing loading state
export const Loading: Story = {
  args: {
    tripId: 'trip-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus mode in a loading state',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.loading,
      },
    ],
  },
};

// Story with children
export const WithChildren: Story = {
  args: {
    tripId: 'trip-123',
    children: (
      <div className="p-4 mt-4 border-t">
        <p className="text-sm text-muted-foreground">
          This is additional content that can be placed inside the focus mode component.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Focus mode with additional child content',
      },
    },
    mockData: [
      {
        hook: 'useFocusSession',
        data: mockSessionData.active,
      },
    ],
  },
}; 