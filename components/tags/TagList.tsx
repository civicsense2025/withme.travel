import { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTags, Tag } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';

interface TagListProps {
  destinationId: string;
  className?: string;
}

interface DestinationTag {
  tag: Tag;
}

export function TagList({ destinationId, className }: TagListProps) {
  const { getDestinationTags, suggestTag, voteOnTag, isLoading } = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    category: 'general',
    emoji: '',
  });

  // Load tags on mount
  useEffect(() => {
    const loadTags = async () => {
      const data = await getDestinationTags(destinationId);
      setTags(data?.map((dt: DestinationTag) => dt.tag) || []);
    };
    loadTags();
  }, [destinationId, getDestinationTags]);

  const handleSuggestTag = async () => {
    if (!newTag.name) return;

    const success = await suggestTag(destinationId, newTag);
    if (success) {
      setShowSuggestDialog(false);
      setNewTag({ name: '', category: 'general', emoji: '' });
    }
  };

  const handleVote = async (tagId: string, isUpvote: boolean) => {
    const success = await voteOnTag(destinationId, tagId, isUpvote);
    if (success) {
      // Refresh tags
      const data = await getDestinationTags(destinationId);
      setTags(data?.map((dt: DestinationTag) => dt.tag) || []);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tags</h3>
        <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
          <DialogTrigger>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Suggest Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest a New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="e.g., Family Friendly"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTag.category}
                  onValueChange={(value) => setNewTag({ ...newTag, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue>Select a category</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="amenity">Amenity</SelectItem>
                    <SelectItem value="atmosphere">Atmosphere</SelectItem>
                    <SelectItem value="cuisine">Cuisine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji (optional)</Label>
                <Input
                  id="emoji"
                  value={newTag.emoji}
                  onChange={(e) => setNewTag({ ...newTag, emoji: e.target.value })}
                  placeholder="e.g., 👨‍👩‍👧‍👦"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSuggestTag} disabled={!newTag.name || isLoading}>
                {isLoading ? 'Suggesting...' : 'Suggest Tag'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-2 py-1 px-3">
            {tag.emoji && <span>{tag.emoji}</span>}
            <span>{tag.name}</span>
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleVote(tag.id, true)}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleVote(tag.id, false)}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </Badge>
        ))}
        {tags.length === 0 && (
          <div className="text-muted-foreground text-sm flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            No tags yet. Be the first to suggest one!
          </div>
        )}
      </div>
    </div>
  );
}
