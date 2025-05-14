'use client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthModal from './AuthModal';

const LOCAL_STORAGE_KEY = 'pendingGroup';

export default function QuickGroupForm() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ name: '', emoji: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore form state after auth redirect
  useEffect(() => {
    if (searchParams && searchParams.get('restore') === '1') {
      const pending = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (pending) {
        setForm(JSON.parse(pending));
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Group name is required.');
      return;
    }

    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to create group');
      }
      const { group } = await res.json();
      router.push(`/groups/${group.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-group-form max-w-md mx-auto my-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label>
          Group Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={60}
            placeholder="e.g. Bali Crew"
            className="input"
          />
        </label>
        <label>
          Emoji (optional)
          <input
            name="emoji"
            value={form.emoji}
            onChange={handleChange}
            maxLength={2}
            placeholder="🌴"
            className="input"
          />
        </label>
        <label>
          Description (optional)
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={200}
            placeholder="What's this group about?"
            className="textarea"
          />
        </label>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" disabled={loading || isLoading} className="btn btn-primary w-full">
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
      {showAuthModal && (
        <AuthModal
          onSignIn={() => {
            window.location.href = `/login?redirectTo=/groups?restore=1`;
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
