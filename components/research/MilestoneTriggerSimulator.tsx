// ============================================================================
// MILESTONE TRIGGER SIMULATOR (DEV/ADMIN TOOL)
// ============================================================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import type { EventType } from '@/types/research';
import { useResearchTracking } from '@/hooks/use-research-tracking';

// List of milestone event types (can be imported or hardcoded for now)
const MILESTONE_EVENT_TYPES: EventType[] = [
  'trip_created',
  'itinerary_item_added',
  'group_created',
  'survey_step_completed',
  'onboarding_completed',
  'feature_discovered',
  // ...add more as needed
];

export function MilestoneTriggerSimulator() {
  const [selectedMilestone, setSelectedMilestone] = useState<EventType | ''>('');
  const [result, setResult] = useState<string | null>(null);
  const { trackEvent } = useResearchTracking();
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    if (!selectedMilestone) return;
    setLoading(true);
    setResult(null);
    // Simulate event (triggers survey if configured)
    trackEvent(selectedMilestone, { devSimulated: true });
    // Validate with backend which survey would be triggered
    try {
      const res = await fetch('/api/research/milestone-triggers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: selectedMilestone }),
      });
      const data = await res.json();
      if (data.survey) {
        setResult(`Triggers survey: ${data.survey.title || data.survey.id}`);
      } else {
        setResult('No survey triggered for this milestone.');
      }
    } catch (err) {
      setResult('Error validating milestone trigger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-muted">
      <h3 className="mb-2 font-semibold">Milestone Trigger Simulator</h3>
      <Select value={selectedMilestone} onValueChange={v => setSelectedMilestone(v as EventType)}>
        <SelectTrigger className="w-64 mb-2">
          <span>{selectedMilestone || 'Select milestone event'}</span>
        </SelectTrigger>
        <SelectContent>
          {MILESTONE_EVENT_TYPES.map(type => (
            type ? <SelectItem key={type} value={type}>{type}</SelectItem> : null
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleTrigger} disabled={!selectedMilestone || loading} className="mt-2">
        {loading ? 'Validating...' : 'Trigger Milestone'}
      </Button>
      {result && <div className="mt-2 text-sm">{result}</div>}
    </div>
  );
} 