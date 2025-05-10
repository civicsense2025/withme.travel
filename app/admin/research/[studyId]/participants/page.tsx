"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Participant {
  id: string;
  user_id: string;
  status: string;
  joined_at: string;
  left_at?: string;
}

export default function StudyParticipantsPage() {
  const params = useParams();
  const studyId = params?.id as string;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);
    fetch(`/api/admin/research/participants?studyId=${studyId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load participants");
        const data = await res.json();
        setParticipants(data.participants || []);
      })
      .catch((err) => setError(err.message || "Failed to load participants"))
      .finally(() => setLoading(false));
  }, [studyId]);

  const handleRemove = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/research/participants?studyId=${studyId}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove participant");
      setParticipants(participants.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove participant");
    }
  };

  const handleExport = () => {
    const csv = [
      ['id', 'user_id', 'status', 'joined_at', 'left_at'],
      ...participants.map(p => [p.id, p.user_id, p.status, p.joined_at, p.left_at || ''])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${studyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Participants</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Button onClick={handleExport} className="mb-4">Export CSV</Button>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {participants.length === 0 ? (
            <div className="text-muted-foreground">No participants found.</div>
          ) : (
            participants.map(p => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle>User: {p.user_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">Status: {p.status}</div>
                  <div className="text-xs text-muted-foreground">Joined: {new Date(p.joined_at).toLocaleString()}</div>
                  {p.left_at && <div className="text-xs text-muted-foreground">Left: {new Date(p.left_at).toLocaleString()}</div>}
                </CardContent>
                <CardFooter className="flex gap-2 justify-end">
                  <Button size="sm" variant="destructive" onClick={() => handleRemove(p.id)}>Remove</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
