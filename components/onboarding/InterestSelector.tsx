import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useTags } from '@/hooks/use-tags';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Tag } from '@/hooks/use-tags';

interface InterestSelectorProps {
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
  suggestedInterests: Record<string, number>;
}

export function InterestSelector({
  onComplete,
  onBack,
  onSkip,
  suggestedInterests,
}: InterestSelectorProps) {
  const { toast } = useToast();
  const { getTags, updateUserInterest, isLoading } = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, number>>(
    suggestedInterests || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      const fetchedTags = await getTags();
      setTags(fetchedTags);

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
              <Card
                key={tag.id}
                className={`p-4 space-y-4 group hover:shadow-md transition-shadow ${
                  isSuggested ? 'border-primary/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {tag.emoji && (
                        <span className="group-hover:scale-110 transition-transform">
                          {tag.emoji}
                        </span>
                      )}
                      {tag.name}
                      {isSuggested && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Suggested
                        </span>
                      )}
                    </h3>
                    {tag.description && (
                      <p className="text-xs text-muted-foreground mt-1">{tag.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium">{selectedInterests[tag.id] || 0}%</span>
                </div>
                <Slider
                  defaultValue={[selectedInterests[tag.id] || 0]}
                  max={100}
                  step={10}
                  value={[selectedInterests[tag.id] || 0]}
                  onValueChange={(value) => handleInterestChange(tag.id, value)}
                  className="w-full"
                />
              </Card>
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
