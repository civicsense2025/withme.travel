'use client';

import { FocusMode } from './focus-mode';
import { FocusSessionProvider } from '@/contexts/focus-session-context';

interface ClientFocusModeProps {
  tripId: string;
}

export function ClientFocusMode({ tripId }: ClientFocusModeProps) {
  return (
    <FocusSessionProvider tripId={tripId}>
      <FocusMode tripId={tripId} />
    </FocusSessionProvider>
  );
}
