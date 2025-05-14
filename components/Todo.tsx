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

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoCategory = 'personal' | 'work' | 'travel' | 'shopping' | 'other';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: TodoPriority;
  dueDate?: Date;
  category?: TodoCategory;
}

interface TodoItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TodoItem>) => void;
  isProcessing: boolean;
  canEdit: boolean;
}

const categoryColors: Record<TodoCategory, string> = {
  personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  work: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  travel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  shopping: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

function TodoItemComponent({
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
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditing(true)}
              disabled={isProcessing}
              aria-label={`Edit "${item.text}"`}
              id={editButtonId}
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          )}

          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDeleteClick}
              disabled={isProcessing}
              aria-label={`Delete "${item.text}"`}
              id={deleteButtonId}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {(item.category || item.priority || item.dueDate || canEdit) && (
        <div className="flex flex-wrap items-center gap-2 mt-1 pl-8">
          {item.category && (
            <Badge variant="outline" className={cn('text-xs', categoryColors[item.category])}>
              {item.category}
            </Badge>
          )}

          {item.priority && (
            <Badge variant="outline" className={cn('text-xs', priorityColors[item.priority])}>
              {item.priority}
            </Badge>
          )}

          {item.dueDate && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Due on ${format(item.dueDate, 'MMMM d, yyyy')}`}>
                {format(item.dueDate, 'MMM d')}
              </span>
            </Badge>
          )}

          {canEdit && (
            <div className="flex gap-1 ml-auto">
              {!item.category && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Set category"
                    >
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1" role="menu">
                      {(['personal', 'work', 'travel', 'shopping', 'other'] as TodoCategory[]).map(
                        (category) => (
                          <Button
                            key={category}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => handleCategoryChange(category)}
                            role="menuitem"
                          >
                            {category}
                          </Button>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {!item.priority && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Set priority"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1" role="menu">
                      {(['low', 'medium', 'high'] as TodoPriority[]).map((priority) => (
                        <Button
                          key={priority}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => handlePriorityChange(priority)}
                          role="menuitem"
                        >
                          {priority}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label={item.dueDate ? 'Change due date' : 'Set due date'}
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={item.dueDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  {item.dueDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDateSelect(undefined)}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TodoListProps {
  /**
   * Initial todo items to display
   */
  initialItems?: TodoItem[];
  /**
   * Whether the user can add, edit, or remove items
   * @default true
   */
  canEdit?: boolean;
  /**
   * Optional title for the todo list
   */
  title?: string;
  /**
   * Callback when an item is toggled
   */
  onToggle?: (id: string, completed: boolean) => Promise<void>;
  /**
   * Callback when an item is deleted
   */
  onDelete?: (id: string) => Promise<void>;
  /**
   * Callback when a new item is added
   */
  onAdd?: (text: string) => Promise<void>;
  /**
   * Callback when an item is updated
   */
  onUpdate?: (id: string, item: Partial<TodoItem>) => Promise<void>;
}

export function Todo({
  initialItems = [],
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
  onUpdate,
}: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority | null>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Update local state when initialItems change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Focus the input when adding item is enabled
  useEffect(() => {
    if (addingItem && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [addingItem]);

  const handleToggle = async (id: string) => {
    // Find the item
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Add to processing items
    setProcessingIds((prev) => [...prev, id]);

    try {
      // Toggle completed state in local state
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
      );

      // Call external handler if provided
      if (onToggle) {
        await onToggle(id, !item.completed);
      }
    } catch (error) {
      // Revert the change if there was an error
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === id ? { ...i, completed: item.completed } : i))
      );
      console.error('Failed to toggle item:', error);
    } finally {
      // Remove from processing items
      setProcessingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleDelete = async (id: string) => {
    // Find the item (for potential restoration)
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Add to processing items
    setProcessingIds((prev) => [...prev, id]);

    try {
      // Remove from local state
      setItems((prevItems) => prevItems.filter((i) => i.id !== id));

      // Call external handler if provided
      if (onDelete) {
        await onDelete(id);
      }
    } catch (error) {
      // Restore the item if there was an error
      setItems((prevItems) => [...prevItems, item]);
      console.error('Failed to delete item:', error);
    } finally {
      // Remove from processing items
      setProcessingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    // Generate a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newItem: TodoItem = {
      id: tempId,
      text: newItemText.trim(),
      completed: false,
      category: selectedCategory ?? undefined,
      priority: selectedPriority ?? undefined,
    };

    setAddingItem(true);

    try {
      // Add to local state
      setItems((prevItems) => [...prevItems, newItem]);
      setNewItemText('');
      setSelectedCategory(null);
      setSelectedPriority(null);

      // Call external handler if provided
      if (onAdd) {
        await onAdd(newItem.text);
      }
    } catch (error) {
      // Remove the item if there was an error
      setItems((prevItems) => prevItems.filter((i) => i.id !== tempId));
      console.error('Failed to add item:', error);
    } finally {
      setAddingItem(false);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<TodoItem>) => {
    // Find the current item (for potential restoration)
    const currentItem = items.find((i) => i.id === id);
    if (!currentItem) return;

    // Add to processing items
    setProcessingIds((prev) => [...prev, id]);

    try {
      // Update in local state
      setItems((prevItems) => prevItems.map((i) => (i.id === id ? { ...i, ...updates } : i)));

      // Call external handler if provided
      if (onUpdate) {
        await onUpdate(id, updates);
      }
    } catch (error) {
      // Restore the original item if there was an error
      setItems((prevItems) => prevItems.map((i) => (i.id === id ? currentItem : i)));
      console.error('Failed to update item:', error);
    } finally {
      // Remove from processing items
      setProcessingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const filteredItems = items.filter((item) => {
    // Filter by completion status if set
    if (filterCompleted !== null && item.completed !== filterCompleted) {
      return false;
    }
    // Filter by category if set
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    // Filter by priority if set
    if (selectedPriority && item.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterCompleted(filterCompleted === false ? null : false)}
              className={filterCompleted === false ? 'bg-accent' : ''}
              aria-pressed={filterCompleted === false}
              title="Show active tasks"
            >
              Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterCompleted(filterCompleted === true ? null : true)}
              className={filterCompleted === true ? 'bg-accent' : ''}
              aria-pressed={filterCompleted === true}
              title="Show completed tasks"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(categoryColors).map(([category, _]) => (
            <Badge
              key={category}
              variant="outline"
              className={cn(
                'cursor-pointer transition-colors',
                selectedCategory === category
                  ? categoryColors[category as TodoCategory]
                  : 'hover:bg-accent'
              )}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === (category as TodoCategory)
                    ? null
                    : (category as TodoCategory)
                )
              }
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Add new todo */}
        {canEdit && (
          <div className="flex items-center space-x-2 mb-4">
            <Input
              ref={newItemInputRef}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
              placeholder="Add a new task..."
              className="flex-1"
              disabled={addingItem}
            />
            <Button
              onClick={handleAddItem}
              disabled={!newItemText.trim() || addingItem}
              aria-label="Add task"
            >
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add
            </Button>
          </div>
        )}

        {/* Todo list */}
        {filteredItems.length > 0 ? (
          <div
            className="space-y-2"
            role="list"
            aria-label={`${title} - ${filteredItems.length} ${
              filteredItems.length === 1 ? 'item' : 'items'
            }`}
          >
            {filteredItems.map((item) => (
              <TodoItemComponent
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdateItem}
                isProcessing={processingIds.includes(item.id)}
                canEdit={canEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {items.length > 0 ? 'No tasks match your filters' : 'No tasks added yet'}
          </div>
        )}

        {/* Summary footer */}
        <div className="flex justify-between text-sm text-muted-foreground pt-2 mt-2 border-t">
          <span>
            {items.filter((i) => !i.completed).length} remaining / {items.length} total
          </span>
          {items.some((i) => i.completed) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const completedIds = items.filter((i) => i.completed).map((i) => i.id);
                Promise.all(completedIds.map(handleDelete));
              }}
              disabled={processingIds.length > 0 || !canEdit}
              className="h-auto p-0 text-sm"
            >
              Clear completed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
