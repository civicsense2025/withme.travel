import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusSessionProvider, useFocusSession } from '@/contexts/focus-session-context';
import { useState } from 'react';

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockResolvedValue(null),
      unsubscribe: jest.fn().mockResolvedValue(null),
    })),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ data: { id: 'new-session-id' }, error: null }),
    update: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'current-user-id', email: 'test@example.com' },
        },
      }),
    },
  })),
}));

// Test component that uses the focus session hook
function TestComponent({ onSessionChange }: { onSessionChange?: (session: any) => void }) {
  const {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    joinFocusSession,
    endFocusSession,
  } = useFocusSession();

  // Notify parent component when session changes for testing
  useState(() => {
    if (onSessionChange && activeFocusSession) {
      onSessionChange(activeFocusSession);
    }
  });

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="error">{error ? error.message : 'No error'}</div>
      <div data-testid="session-status">
        {activeFocusSession ? `Active session: ${activeFocusSession.id}` : 'No active session'}
      </div>

      <button data-testid="start-btn" onClick={() => startFocusSession('itinerary')}>
        Start Session
      </button>

      <button
        data-testid="join-btn"
        onClick={() => activeFocusSession && joinFocusSession(activeFocusSession)}
        disabled={!activeFocusSession}
      >
        Join Session
      </button>

      <button
        data-testid="end-btn"
        onClick={() => endFocusSession()}
        disabled={!activeFocusSession}
      >
        End Session
      </button>
    </div>
  );
}

describe('FocusSessionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <FocusSessionProvider tripId="trip-123">
        <TestComponent />
      </FocusSessionProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
    expect(screen.getByTestId('session-status')).toHaveTextContent('No active session');
  });

  it('shows loading state initially', async () => {
    // Mock initial loading state
    const supabaseMock = require('@/utils/supabase/client').createClient();
    supabaseMock
      .from()
      .select()
      .eq()
      .order()
      .single.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
      );

    render(
      <FocusSessionProvider tripId="trip-123">
        <TestComponent />
      </FocusSessionProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');

    // After data loads, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  it('can start a focus session', async () => {
    const user = userEvent.setup();
    const mockSession = {
      id: 'new-session-id',
      trip_id: 'trip-123',
      section_path: 'itinerary',
      created_by_id: 'current-user-id',
      current_user_id: 'current-user-id',
      participants: [{ id: 'current-user-id', name: 'Test User', avatar_url: null }],
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      has_joined: true,
    };

    // Mock the insert response
    const supabaseMock = require('@/utils/supabase/client').createClient();
    supabaseMock.insert.mockResolvedValueOnce({
      data: { id: 'new-session-id' },
      error: null,
    });

    // Mock fetching the session after creation
    supabaseMock.from().select().eq().order().single.mockResolvedValueOnce({
      data: mockSession,
      error: null,
    });

    // Mock session change handler
    const handleSessionChange = jest.fn();

    render(
      <FocusSessionProvider tripId="trip-123">
        <TestComponent onSessionChange={handleSessionChange} />
      </FocusSessionProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click start button
    await user.click(screen.getByTestId('start-btn'));

    // Session should update
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent(
        'Active session: new-session-id'
      );
      expect(handleSessionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-session-id',
        })
      );
    });
  });

  it('handles errors when starting a session', async () => {
    const user = userEvent.setup();

    // Mock an error response
    const supabaseMock = require('@/utils/supabase/client').createClient();
    supabaseMock.insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to create session' },
    });

    render(
      <FocusSessionProvider tripId="trip-123">
        <TestComponent />
      </FocusSessionProvider>
    );

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click start button
    await user.click(screen.getByTestId('start-btn'));

    // Should show error
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to create session');
    });
  });

  it('can end a focus session', async () => {
    const user = userEvent.setup();
    const mockSession = {
      id: 'existing-session-id',
      trip_id: 'trip-123',
      section_path: 'itinerary',
      created_by_id: 'current-user-id',
      current_user_id: 'current-user-id',
      participants: [{ id: 'current-user-id', name: 'Test User', avatar_url: null }],
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      has_joined: true,
    };

    // Mock that we have an existing session
    const supabaseMock = require('@/utils/supabase/client').createClient();
    supabaseMock.from().select().eq().order().single.mockResolvedValueOnce({
      data: mockSession,
      error: null,
    });

    // Mock update for ending the session
    supabaseMock.update.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    render(
      <FocusSessionProvider tripId="trip-123">
        <TestComponent />
      </FocusSessionProvider>
    );

    // Wait for session to load
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent(
        'Active session: existing-session-id'
      );
    });

    // End the session
    await user.click(screen.getByTestId('end-btn'));

    // Session should be cleared
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent('No active session');
    });

    // Verify update was called
    expect(supabaseMock.update).toHaveBeenCalledWith({
      is_active: false,
    });
  });
});
