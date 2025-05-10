"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateResearchStudyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/research/create-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create study");
      }
      const data = await res.json();
      router.push(`/admin/research/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create study");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Create Research Study</h1>
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
        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Study"}</Button>
      </form>
    </div>
  );
}
