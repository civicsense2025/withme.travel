"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditResearchStudyPage() {
  const router = useRouter();
  const params = useParams();
  const studyId = params?.studyId as string;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!studyId) return;
    setLoading(true);
    fetch(`/api/admin/research/create-study?id=${studyId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch study");
        }
        return res.json();
      })
      .then((data) => {
        setName(data.name || "");
        setDescription(data.description || "");
        setActive(data.active !== false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch study");
      })
      .finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });
  }, [studyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/research/create-study?id=${studyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update study");
      }
      const data = await res.json();
      router.push(`/admin/research/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update study");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Research Study</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Name *</label>
          <Input value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={loading} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} disabled={loading} />
          <label htmlFor="active">Active</label>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
      </form>
    </div>
  );
} 