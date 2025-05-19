'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTags } from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { InterestTag } from '../molecules/interest-tag';
import type { Tag } from '@/types/tags';

// Extended Tag type with additional properties needed for this component
interface TagExtended extends Tag {
  emoji?: string;
  description?: string;
  slug: string;
}

interface InterestSelectorProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
  suggestedInterests: Record<string, number>;
}

/**
 * Interest selector component that allows users to select and rate their travel interests
 * during the onboarding process
 */
export function InterestSelector({
  onComplete,
  onBack,
  onSkip,
  suggestedInterests,
}: InterestSelectorProps) {
  const { toast } = useToast();
  const { getTags, updateUserInterest, isLoading } = useTags();
  const [tags, setTags] = useState<TagExtended[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, number>>(
    suggestedInterests || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      const fetchedTags = await getTags();
      setTags(
        (fetchedTags || []).map((t) => ({
          ...t,
          category: t.category ?? '',
          created_at: t.created_at ?? '',
          created_by: t.created_by ?? '',
          description: t.description ?? '',
          emoji: t.emoji ?? '',
          id: t.id ?? '',
          name: t.name ?? '',
          slug: t.slug ?? '',
          updated_at: t.updated_at ?? '',
          use_count: t.use_count ?? 0,
          is_verified: t.is_verified ?? false,
          type: t.type ?? '',
        }))
      );

      // Pre-select interests based on personality type
      if (Object.keys(suggestedInterests).length > 0) {
        const tagSuggestions: Record<string, number> = {};
        fetchedTags.forEach((tag) => {
          if (suggestedInterests[tag.slug]) {
            tagSuggestions[tag.id] = suggestedInterests[tag.slug];
          }
        });
        setSelectedInterests((prev) => ({
          ...prev,
          ...tagSuggestions,
        }));
      }
    };
    loadTags();
  }, [getTags, suggestedInterests]);

  const handleInterestChange = (tagId: string, value: number[]) => {
    setSelectedInterests((prev) => ({
      ...prev,
      [tagId]: value[0],
    }));
  };

  const handleComplete = async () => {
    try {
      setIsSaving(true);
      const promises = Object.entries(selectedInterests).map(([tagId, strength]) =>
        updateUserInterest(tagId, strength)
      );
      await Promise.all(promises);
      toast({
        title: 'Success',
        description: 'Your interests have been saved!',
      });
      onComplete();
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your interests',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6 pb-8 px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort tags by whether they have suggested values
  const sortedTags = [...tags].sort((a, b) => {
    const aHasSuggestion = suggestedInterests[a.slug] !== undefined;
    const bHasSuggestion = suggestedInterests[b.slug] !== undefined;
    if (aHasSuggestion && !bHasSuggestion) return -1;
    if (!aHasSuggestion && bHasSuggestion) return 1;
    return 0;
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center space-y-2 mb-6">
          <div className="mb-4 text-4xl">🎯</div>
          <h2 className="text-2xl font-bold">What interests you?</h2>
          <p className="text-muted-foreground">
            We've suggested some interests based on your travel style. Adjust them or add new ones!
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {sortedTags.map((tag) => {
            const isSuggested = suggestedInterests[tag.slug] !== undefined;
            return (
              <InterestTag
                key={tag.id}
                tag={tag}
                value={selectedInterests[tag.id] || 0}
                isSuggested={isSuggested}
                onChange={(value) => handleInterestChange(tag.id, value)}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSaving || Object.keys(selectedInterests).length === 0}
              className="flex-1"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'continue'}
            </Button>
          </div>
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 