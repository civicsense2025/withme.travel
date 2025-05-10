"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Trigger {
  id: string;
  trigger_event: string;
  survey_id: string;
  min_delay_ms: number;
  max_triggers: number;
  active: boolean;
}

export default function StudyTriggersPage() {
  const params = useParams();
  const studyId = params?.id as string;
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTrigger, setNewTrigger] = useState<Partial<Trigger>>({
    trigger_event: '',
    survey_id: '',
    min_delay_ms: 2000,
    max_triggers: 1,
    active: true,
  });

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);
    fetch(`/api/admin/research/triggers?studyId=${studyId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load triggers");
        const data = await res.json();
        setTriggers(data.triggers || []);
      })
      .catch((err) => setError(err.message || "Failed to load triggers"))
      .finally(() => setLoading(false));
  }, [studyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/admin/research/triggers?studyId=${studyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrigger),
      });
      if (!res.ok) throw new Error("Failed to create trigger");
      const data = await res.json();
      setTriggers([...triggers, data.trigger]);
      setShowNew(false);
      setNewTrigger({ trigger_event: '', survey_id: '', min_delay_ms: 2000, max_triggers: 1, active: true });
    } catch (err: any) {
      setError(err.message || "Failed to create trigger");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/research/triggers?studyId=${studyId}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete trigger");
      setTriggers(triggers.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete trigger");
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Manage Triggers</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Button onClick={() => setShowNew(!showNew)} className="mb-4">
            {showNew ? 'Cancel' : 'Add New Trigger'}
          </Button>
          {showNew && (
            <form onSubmit={handleCreate} className="mb-6 space-y-4">
              <div>
                <label className="block font-medium mb-1">Event</label>
                <Input value={newTrigger.trigger_event || ''} onChange={e => setNewTrigger({ ...newTrigger, trigger_event: e.target.value })} required />
              </div>
              <div>
                <label className="block font-medium mb-1">Survey ID</label>
                <Input value={newTrigger.survey_id || ''} onChange={e => setNewTrigger({ ...newTrigger, survey_id: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Min Delay (ms)</label>
                  <Input type="number" value={newTrigger.min_delay_ms || 0} onChange={e => setNewTrigger({ ...newTrigger, min_delay_ms: Number(e.target.value) })} />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">Max Triggers</label>
                  <Input type="number" value={newTrigger.max_triggers || 1} onChange={e => setNewTrigger({ ...newTrigger, max_triggers: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={newTrigger.active ?? true} onChange={e => setNewTrigger({ ...newTrigger, active: e.target.checked })} />
                <label htmlFor="active">Active</label>
              </div>
              <Button type="submit">Create Trigger</Button>
            </form>
          )}
          <div className="space-y-4">
            {triggers.length === 0 ? (
              <div className="text-muted-foreground">No triggers found.</div>
            ) : (
              triggers.map(trigger => (
                <Card key={trigger.id}>
                  <CardHeader>
                    <CardTitle>{trigger.trigger_event}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">Survey: {trigger.survey_id}</div>
                    <div className="text-xs text-muted-foreground">Min Delay: {trigger.min_delay_ms} ms, Max: {trigger.max_triggers}, {trigger.active ? 'Active' : 'Inactive'}</div>
                  </CardContent>
                  <CardFooter className="flex gap-2 justify-end">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(trigger.id)}>Delete</Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
