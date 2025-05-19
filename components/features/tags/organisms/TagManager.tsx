'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TagList } from './TagList';
import { TagCreator } from '../molecules/TagCreator';
import type { Tag, TagBaseProps, TagInput, VoteDirection } from '../types';

/**
 * Props for TagManager component
 */
export interface TagManagerProps extends TagBaseProps {
  /** Array of tags to display */
  tags: Tag[];
  /** Handler for when a tag is clicked */
  onTagClick?: (tag: Tag) => void;
  /** Handler for voting on a tag */
  onVote?: (tag: Tag, direction: VoteDirection) => Promise<void> | void;
  /** Handler for creating a new tag */
  onCreateTag?: (tagData: TagInput) => Promise<void> | void;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Whether to allow tag creation */
  allowTagCreation?: boolean;
  /** Title for the tag section */
  title?: string;
  /** Text to show when no tags are available */
  emptyStateText?: string;
}

/**
 * Comprehensive tag management component with listing and creation capabilities
 */
export function TagManager({
  tags,
  onTagClick,
  onVote,
  onCreateTag,
  isLoading = false,
  allowTagCreation = true,
  title = 'Tags',
  emptyStateText = 'No tags yet',
  className
}: TagManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenTagDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCreateTag = async (tagData: TagInput) => {
    if (onCreateTag) {
      setIsCreating(true);
      try {
        const result = onCreateTag(tagData);
        if (result instanceof Promise) {
          await result;
        }
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Failed to create tag:', error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TagList
          tags={tags}
          onTagClick={onTagClick}
          onVote={onVote}
          onAddTag={allowTagCreation ? handleOpenTagDialog : undefined}
          isLoading={isLoading}
          allowAddingTags={allowTagCreation}
          title={title}
          emptyStateText={emptyStateText}
        />
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Tag</DialogTitle>
          </DialogHeader>
          
          <TagCreator
            onSubmit={handleCreateTag}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 