'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { TABLES } from '@/utils/constants/tables';

interface FeedbackUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface FeedbackData {
  id: string;
  user_id: string | null;
  email: string | null;
  content: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: any;
  user: FeedbackUser | null;
}

interface FeedbackEditFormProps {
  initialData: FeedbackData;
}

export default function FeedbackEditForm({ initialData }: FeedbackEditFormProps) {
  const [formData, setFormData] = useState<FeedbackData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Feedback type options
  const feedbackTypes = [
    { value: 'bug_report', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'general', label: 'General Feedback' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'question', label: 'Question' },
    { value: 'other', label: 'Other' },
  ];

  // Feedback status options
  const feedbackStatuses = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Only include fields that should be updated
      const updateData = {
        content: formData.content,
        type: formData.type,
        status: formData.status,
        // Don't update user_id or email as those should remain fixed
      };

      const { error } = await supabase
        .from(TABLES.FEEDBACK)
        .update(updateData)
        .eq('id', formData.id);

      if (error) throw error;

      setSuccess('Feedback updated successfully!');

      // Refresh the page to reflect changes
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="mt-1 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) => handleChange({ name: 'type', value })}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleChange({ name: 'status', value })}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>User</Label>
          <div className="mt-1 p-3 border rounded-md bg-gray-50 dark:bg-slate-900">
            {formData.user ? (
              <div>
                <div className="font-medium">{formData.user.full_name || 'No Name'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.user.email}
                </div>
                <Link
                  href={`/admin/users/${formData.user.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                >
                  View User Profile
                </Link>
              </div>
            ) : formData.email ? (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Email: </span>
                {formData.email}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">Anonymous feedback</div>
            )}
          </div>
        </div>

        {formData.metadata && (
          <div>
            <Label>Metadata</Label>
            <pre className="mt-1 p-3 border rounded-md bg-gray-50 dark:bg-slate-900 text-xs overflow-x-auto">
              {JSON.stringify(formData.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/feedback/${formData.id}`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
