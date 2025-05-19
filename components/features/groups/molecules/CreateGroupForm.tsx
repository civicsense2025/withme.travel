/**
 * CreateGroupForm Molecule
 *
 * Form for creating a new group.
 * @module components/features/groups/molecules/CreateGroupForm
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGroups } from '@/lib/features/groups/hooks';
import { useToast } from '@/hooks/use-toast'

/**
 * CreateGroupForm component props
 */
export interface CreateGroupFormProps {
  /** Callback when form is submitted */
  onGroupCreated?: (group: any) => void;
  /** Optional initial values */
  initialValues?: { name?: string; description?: string };
  /** Additional className for styling */
  className?: string;
}

/**
 * CreateGroupForm molecule for group creation
 */
export function CreateGroupForm({ onGroupCreated, initialValues, className }: CreateGroupFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [emoji, setEmoji] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addGroup } = useGroups(false); // Don't fetch on mount
  const { toast } = useToast();

  // Hidden field for spam prevention
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await addGroup({ name, description });
      if (result.success) {
        toast({
          title: 'Group created successfully',
        });
        onGroupCreated?.(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className || ''}`}>
      {/* Honeypot field - hidden from real users */}
      <div className="hidden">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Group Name*</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Summer trip to Bali"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emoji">Emoji (optional)</Label>
        <Input
          id="emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🏝️ 🌴 ✈️"
          disabled={loading}
          maxLength={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Planning our big group trip to Bali in August..."
          disabled={loading}
          rows={3}
        />
      </div>

      {error && (
        <Alert className="bg-destructive/15 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
}

// Default export for backward compatibility
export default CreateGroupForm;
