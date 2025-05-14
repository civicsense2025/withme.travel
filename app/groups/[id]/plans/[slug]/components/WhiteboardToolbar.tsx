'use client';

import { useState } from 'react';
import { Plus, Grid, Search, Lightbulb, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ActivityGeneratorWidget } from '@/components/groups/ActivityGeneratorWidget';
import { useWhiteboardContext } from '../context/whiteboard-context';
import { ConvertToTripModal } from './ConvertToTripModal';
import { cn } from '@/lib/utils';

// Import ViewMode type from the context file
export type ViewMode = 'grid' | 'kanban';

interface WhiteboardToolbarProps {
  groupId: string;
  planId: string;
  onStartVoting?: () => void;
  isReadyForVoting?: boolean;
  readyForVotingDisabled?: boolean;
}

export function WhiteboardToolbar({
  groupId,
  planId,
  onStartVoting,
  isReadyForVoting = false,
  readyForVotingDisabled = false,
}: WhiteboardToolbarProps) {
  const { viewMode, setViewMode, addIdea, searchIdeas, destination } = useWhiteboardContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showActivityGenerator, setShowActivityGenerator] = useState<boolean>(false);
  const [convertToTripModalOpen, setConvertToTripModalOpen] = useState<boolean>(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchIdeas(query);
  };

  const handleAddIdea = (ideaData: any) => {
    addIdea(ideaData);
    return Promise.resolve(); // Return a resolved promise for the activity generator
  };

  return (
    <div className="flex flex-col gap-2 w-full pt-2">
      <div className="flex items-center gap-2 px-2">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            // Only update if value is a valid ViewMode
            if (value === 'grid' || value === 'kanban') {
              setViewMode(value);
            }
          }}
        >
          <ToggleGroupItem value="grid">
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban">
            <Grid className="h-4 w-4 mr-1" />
            Kanban
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="relative flex-1 ml-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => {
                setSearchQuery('');
                searchIdeas('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => addIdea({ title: 'New Idea', description: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>

        <Button
          variant={showActivityGenerator ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowActivityGenerator(!showActivityGenerator)}
        >
          <Lightbulb className="h-4 w-4 mr-1" />
          Ideas
        </Button>
      </div>

      {showActivityGenerator && (
        <Card className="p-2 mx-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Activity Ideas Generator</h3>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setShowActivityGenerator(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ActivityGeneratorWidget
            groupId={groupId}
            planId={planId}
            destinationId={destination?.id || ''}
            onAddIdea={handleAddIdea}
            onClose={() => setShowActivityGenerator(false)}
          />
        </Card>
      )}

      <ConvertToTripModal
        groupId={groupId}
        planId={planId}
        isOpen={convertToTripModalOpen}
        onOpenChange={setConvertToTripModalOpen}
      />
    </div>
  );
}
