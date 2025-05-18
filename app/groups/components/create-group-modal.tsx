'use client';

import { useState } from 'react';
import { ENUMS } from '@/utils/constants/status';
import { Group, CreateGroupData } from '@/lib/client/groups';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/hooks/use-groups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmojiPicker from './emoji-picker';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: any) => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createGroup } = useGroups();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState<string | null>('✈️');
  const [visibility, setVisibility] = useState<string>(ENUMS.GROUP_VISIBILITY.PRIVATE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const groupData: CreateGroupData = {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility: visibility as 'public' | 'private' | 'unlisted',
      };

      const result = await createGroup(groupData);

      if (result.success) {
        // Create a group object with the expected structure for the parent component
        const newGroup = {
          id: result.groupId,
          name: groupData.name,
          description: groupData.description || '',
          visibility: groupData.visibility,
          emoji,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: '',
        };

        // Notify the parent component
        if (onGroupCreated) {
          onGroupCreated(newGroup);
        }

        // Reset form
        setName('');
        setDescription('');
        setEmoji('✈️');
        setVisibility(ENUMS.GROUP_VISIBILITY.PRIVATE);

        // Close the modal
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Travel Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">{error}</div>}

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>

            <div className="flex-grow">
              <Label htmlFor="name" className="text-right">
                Group Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Travel Squad"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others what this group is about..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Privacy</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ENUMS.GROUP_VISIBILITY.PRIVATE}>
                  Private - Only visible to members
                </SelectItem>
                <SelectItem value={ENUMS.GROUP_VISIBILITY.UNLISTED}>
                  Link Sharing - Anyone with the link can request to join
                </SelectItem>
                <SelectItem value={ENUMS.GROUP_VISIBILITY.PUBLIC}>
                  Public - Anyone can discover and request to join
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogPrimitive.Close>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
