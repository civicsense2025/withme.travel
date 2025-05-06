'use client';

import { useState } from 'react';
import { Plus, Grid, Search, Lightbulb, X, Filter, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ActivityGeneratorWidget } from '@/components/groups/ActivityGeneratorWidget';
import { useWhiteboardContext } from '../context/whiteboard-context';
import { ConvertToTripModal } from './ConvertToTripModal';

interface WhiteboardToolbarProps {
  groupId: string;
  planId: string;
}

export function WhiteboardToolbar({ groupId, planId }: WhiteboardToolbarProps) {
  const { addIdea, destination, searchIdeas, viewMode, setViewMode } = useWhiteboardContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showActivityGenerator, setShowActivityGenerator] = useState<boolean>(false);
  const [isActivityGeneratorCollapsed, setIsActivityGeneratorCollapsed] = useState<boolean>(true);
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
    <>
      <Card className="p-2 flex flex-wrap items-center gap-2 sticky top-0 z-10 bg-card">
        <Button
          onClick={() => addIdea({ title: 'New Idea', description: '' })}
          size="sm"
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Idea
        </Button>
        
        <div className="relative flex-1 min-w-[200px]">
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
          variant={showActivityGenerator ? "default" : "outline"}
          size="sm"
          className="flex-shrink-0"
          onClick={() => setShowActivityGenerator(!showActivityGenerator)}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Activity Ideas
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0"
          onClick={() => setConvertToTripModalOpen(true)}
        >
          <Plane className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
        
        <div className="ml-auto flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
            if (value === 'grid' || value === 'kanban') setViewMode(value);
          }}>
            <ToggleGroupItem value="grid" aria-label="Grid View">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban View">
              <Filter className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Card>
      
      {showActivityGenerator && (
        <div className={`fixed ${isActivityGeneratorCollapsed ? 'bottom-4 right-4' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'} z-20`}>
          <ActivityGeneratorWidget
            groupId={groupId}
            planId={planId}
            destinationId={destination?.id || ''}
            onAddIdea={handleAddIdea}
            onClose={() => setShowActivityGenerator(false)}
            isCollapsed={isActivityGeneratorCollapsed}
            onToggleCollapse={() => setIsActivityGeneratorCollapsed(!isActivityGeneratorCollapsed)}
          />
        </div>
      )}
      
      <ConvertToTripModal
        groupId={groupId}
        planId={planId}
        isOpen={convertToTripModalOpen}
        onOpenChange={setConvertToTripModalOpen}
      />
    </>
  );
} 