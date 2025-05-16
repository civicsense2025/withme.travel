'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, Plus, Calendar, Clock, Tag, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { visuallyHidden } from '@/components/ui/visually-hidden';
import { TodoItem as TodoItemType, TodoPriority, TodoCategory } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const categoryColors: Record<TodoCategory, string> = {
  personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  work: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  travel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  shopping: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

// ============================================================================
// TYPES
// ============================================================================

export interface TodoItemProps {
  /** The todo item to render */
  item: TodoItemType;
  /** Callback when the item is toggled */
  onToggle: (id: string) => void;
  /** Callback when the item is deleted */
  onDelete: (id: string) => void;
  /** Callback when the item is updated */
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
  /** Whether the item is currently being processed */
  isProcessing: boolean;
  /** Whether the user can edit the item */
  canEdit: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TodoItem component renders a single todo item with edit, delete, and toggle functionality
 */
export function TodoItem({
  item,
  onToggle,
  onDelete,
  onUpdate,
  isProcessing,
  canEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Reset edit text when item changes
  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  // Handle accessibility announcements
  useEffect(() => {
    if (announcementMessage) {
      const timeoutId = setTimeout(() => {
        setAnnouncementMessage('');
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [announcementMessage]);

  const handleEdit = () => {
    if (editText.trim() !== '') {
      onUpdate(item.id, { text: editText });
      setIsEditing(false);
      setAnnouncementMessage(`Todo item text updated to ${editText}`);
    }
  };

  const handleCategoryChange = (category: TodoCategory) => {
    onUpdate(item.id, { category });
    setAnnouncementMessage(`Category set to ${category}`);
  };

  const handlePriorityChange = (priority: TodoPriority) => {
    onUpdate(item.id, { priority });
    setAnnouncementMessage(`Priority set to ${priority}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    onUpdate(item.id, { dueDate: date });
    setIsDatePickerOpen(false);
    setAnnouncementMessage(
      date ? `Due date set to ${format(date, 'MMMM d, yyyy')}` : 'Due date removed'
    );
  };

  const handleToggleClick = () => {
    onToggle(item.id);
    setAnnouncementMessage(item.completed ? 'Marked as incomplete' : 'Marked as complete');
  };

  const handleDeleteClick = () => {
    onDelete(item.id);
    setAnnouncementMessage('Todo item deleted');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isEditing) {
      setIsEditing(false);
      setEditText(item.text);
    }
  };

  const itemId = `todo-item-${item.id}`;
  const editButtonId = `edit-button-${item.id}`;
  const deleteButtonId = `delete-button-${item.id}`;
  const checkboxId = `checkbox-${item.id}`;

  return (
    <div
      className={cn(
        'flex flex-col p-3 rounded-md border border-border',
        item.completed ? 'bg-muted/40' : 'hover:bg-accent/5',
        isProcessing && 'opacity-70',
        'transition-all duration-200'
      )}
      onKeyDown={handleKeyDown}
      role="listitem"
      id={itemId}
      aria-busy={isProcessing}
    >
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" className={visuallyHidden}>
        {announcementMessage}
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleToggleClick}
            disabled={isProcessing || !canEdit}
            aria-checked={item.completed}
            role="checkbox"
            id={checkboxId}
            aria-label={`Mark "${item.text}" as ${item.completed ? 'incomplete' : 'complete'}`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
          </Button>

          {isEditing ? (
            <Input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditText(item.text);
                }
              }}
              onBlur={handleEdit}
              autoFocus
              className="flex-1"
              aria-label="Edit todo text"
              data-testid={`edit-input-${item.id}`}
            />
          ) : (
            <span
              className={cn('flex-1', item.completed && 'line-through text-muted-foreground')}
              aria-labelledby={checkboxId}
            >
              {item.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                aria-label={isEditing ? 'Save todo text' : 'Edit todo text'}
                onClick={() => setIsEditing(!isEditing)}
                id={editButtonId}
                disabled={isProcessing}
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-destructive"
                aria-label={`Delete todo item "${item.text}"`}
                onClick={handleDeleteClick}
                id={deleteButtonId}
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {item.dueDate && (
            <Badge variant="outline" className="px-2 py-0 h-6 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(item.dueDate, 'MMM d')}</span>
            </Badge>
          )}

          {item.priority && (
            <Badge className={cn('px-2 py-0 h-6 text-xs', priorityColors[item.priority])}>
              <span>{item.priority}</span>
            </Badge>
          )}

          {item.category && (
            <Badge className={cn('px-2 py-0 h-6 text-xs', categoryColors[item.category])}>
              <Tag className="h-3 w-3 mr-1" />
              <span>{item.category}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Actions panel when editing */}
      {isEditing && canEdit && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={isProcessing}
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {item.dueDate ? format(item.dueDate, 'MMM d') : 'Add date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={item.dueDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={isProcessing}
              >
                <span className="sr-only">Priority</span>
                {item.priority ? (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-xs',
                      priorityColors[item.priority]
                    )}
                  >
                    {item.priority}
                  </span>
                ) : (
                  'Priority'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.priority === 'high' && 'bg-primary/10'
                  )}
                  onClick={() => handlePriorityChange('high')}
                >
                  <Badge className={priorityColors.high}>High</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.priority === 'medium' && 'bg-primary/10'
                  )}
                  onClick={() => handlePriorityChange('medium')}
                >
                  <Badge className={priorityColors.medium}>Medium</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.priority === 'low' && 'bg-primary/10'
                  )}
                  onClick={() => handlePriorityChange('low')}
                >
                  <Badge className={priorityColors.low}>Low</Badge>
                </Button>
                {item.priority && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handlePriorityChange(undefined as any)}
                  >
                    Clear Priority
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={isProcessing}
              >
                <Tag className="h-3.5 w-3.5 mr-1" />
                {item.category ? (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-xs',
                      categoryColors[item.category]
                    )}
                  >
                    {item.category}
                  </span>
                ) : (
                  'Category'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.category === 'personal' && 'bg-primary/10'
                  )}
                  onClick={() => handleCategoryChange('personal')}
                >
                  <Badge className={categoryColors.personal}>Personal</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.category === 'work' && 'bg-primary/10'
                  )}
                  onClick={() => handleCategoryChange('work')}
                >
                  <Badge className={categoryColors.work}>Work</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.category === 'travel' && 'bg-primary/10'
                  )}
                  onClick={() => handleCategoryChange('travel')}
                >
                  <Badge className={categoryColors.travel}>Travel</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.category === 'shopping' && 'bg-primary/10'
                  )}
                  onClick={() => handleCategoryChange('shopping')}
                >
                  <Badge className={categoryColors.shopping}>Shopping</Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'justify-start',
                    item.category === 'other' && 'bg-primary/10'
                  )}
                  onClick={() => handleCategoryChange('other')}
                >
                  <Badge className={categoryColors.other}>Other</Badge>
                </Button>
                {item.category && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleCategoryChange(undefined as any)}
                  >
                    Clear Category
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
} 