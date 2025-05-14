'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'likert' | 'rating';
  required: boolean;
  options?: string[];
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        text: '',
        type: 'text',
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (idx: number, q: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((question, i) => (i === idx ? { ...question, ...q } : question))
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/surveys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create survey');
      }
      setSuccess(true);
      setTimeout(() => router.push('/admin/surveys'), 1200);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Survey title"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this survey"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium">Questions</label>
            <Button type="button" onClick={addQuestion} variant="outline" size="sm">
              Add Question
            </Button>
          </div>
          {questions.length === 0 && (
            <div className="text-muted-foreground text-sm mb-2">No questions yet.</div>
          )}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border rounded p-4 relative bg-muted/30">
                <div className="flex gap-2 mb-2">
                  <Input
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                    placeholder="Question text"
                    className="flex-1"
                    required
                  />
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(idx, { type: e.target.value as Question['type'] })
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="likert">Likert Scale</option>
                    <option value="rating">Rating</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(idx)}
                    aria-label="Remove question"
                  >
                    ×
                  </Button>
                </div>
                {q.type === 'multiple_choice' && (
                  <div className="space-y-1 mt-2">
                    <label className="block text-xs mb-1">Options (one per line)</label>
                    <Textarea
                      value={q.options?.join('\n') || ''}
                      onChange={(e) => updateQuestion(idx, { options: e.target.value.split('\n') })}
                      placeholder="Option 1\nOption 2\nOption 3"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Survey created! Redirecting...</div>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Survey'}
        </Button>
      </form>
    </div>
  );
}
