"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Analytics {
  participantCount: number;
  completedSurveys: number;
  eventCount: number;
  [key: string]: any;
}

export default function StudyAnalyticsPage() {
  const params = useParams();
  const studyId = params?.id as string;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);
    fetch(`/api/admin/research/analytics?studyId=${studyId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        const data = await res.json();
        setAnalytics(data.analytics || null);
      })
      .catch((err) => setError(err.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [studyId]);

  const handleExport = () => {
    if (!analytics) return;
    const csv = Object.entries(analytics).map(([k, v]) => `${k},${v}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${studyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <Button onClick={handleExport} className="mb-4">Export CSV</Button>
      {loading ? (
        <div>Loading...</div>
      ) : analytics ? (
        <div className="space-y-4">
          <div>Participants: <strong>{analytics.participantCount}</strong></div>
          <div>Completed Surveys: <strong>{analytics.completedSurveys}</strong></div>
          <div>Events: <strong>{analytics.eventCount}</strong></div>
        </div>
      ) : (
        <div className="text-muted-foreground">No analytics data found.</div>
      )}
    </div>
  );
}
