'use client';

import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { visuallyHidden } from '@/components/ui/visually-hidden';
import { TodoItem } from '../molecules/TodoItem';
import { TodoItem as TodoItemType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface TodoProps {
  /**
   * Initial todo items to display
   */
  initialItems?: TodoItemType[];
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
  onUpdate?: (id: string, item: Partial<TodoItemType>) => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Todo component that allows users to create, edit, and manage todo items
 */
export function Todo({
  initialItems = [],
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
  onUpdate,
}: TodoProps) {
  const [items, setItems] = useState<TodoItemType[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});
  const [announcementMessage, setAnnouncementMessage] = useState('');

  // Handle toggling a todo item
  const handleToggle = async (id: string) => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    setProcessingItems(prev => ({ ...prev, [id]: true }));
    const newItems = [...items];
    const targetItem = { ...newItems[itemIndex] };
    targetItem.completed = !targetItem.completed;
    newItems[itemIndex] = targetItem;
    setItems(newItems);

    try {
      if (onToggle) {
        await onToggle(id, targetItem.completed);
      } else {
        // Simulate API call if no callback provided
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAnnouncementMessage(`Item ${targetItem.completed ? 'completed' : 'marked incomplete'}: ${targetItem.text}`);
    } catch (error) {
      // Revert on error
      const revertedItems = [...items];
      setItems(revertedItems);
      setAnnouncementMessage('Error toggling item');
    } finally {
      setProcessingItems(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle deleting a todo item
  const handleDelete = async (id: string) => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    setProcessingItems(prev => ({ ...prev, [id]: true }));
    const deletedItem = items[itemIndex];
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);

    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        // Simulate API call if no callback provided
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAnnouncementMessage(`Item deleted: ${deletedItem.text}`);
    } catch (error) {
      // Revert on error
      setItems(items);
      setAnnouncementMessage('Error deleting item');
    } finally {
      setProcessingItems(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle adding a new todo item
  const handleAddItem = async () => {
    if (!newItemText.trim() || isAddingItem) return;

    setIsAddingItem(true);
    const newItem: TodoItemType = {
      id: nanoid(),
      text: newItemText.trim(),
      completed: false,
    };

    try {
      if (onAdd) {
        await onAdd(newItem.text);
      } else {
        // Simulate API call if no callback provided
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setItems(prevItems => [newItem, ...prevItems]);
      setNewItemText('');
      setAnnouncementMessage(`New item added: ${newItem.text}`);
    } catch (error) {
      setAnnouncementMessage('Error adding new item');
    } finally {
      setIsAddingItem(false);
    }
  };

  // Handle updating a todo item
  const handleUpdateItem = async (id: string, updates: Partial<TodoItemType>) => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    setProcessingItems(prev => ({ ...prev, [id]: true }));
    const updatedItems = [...items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
    setItems(updatedItems);

    try {
      if (onUpdate) {
        await onUpdate(id, updates);
      } else {
        // Simulate API call if no callback provided
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const updateDesc = updates.text ? `text updated to "${updates.text}"` :
        updates.dueDate ? 'due date updated' :
        updates.priority ? `priority set to ${updates.priority}` :
        updates.category ? `category set to ${updates.category}` : 'item updated';
        
      setAnnouncementMessage(`Item ${updateDesc}`);
    } catch (error) {
      // Revert on error
      setItems(items);
      setAnnouncementMessage('Error updating item');
    } finally {
      setProcessingItems(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Accessibility announcements */}
        <div aria-live="polite" className={visuallyHidden}>
          {announcementMessage}
        </div>

        {/* Add new item form */}
        {canEdit && (
          <div className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Add a new item..."
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              disabled={isAddingItem}
              aria-label="New todo item text"
            />
            <Button
              size="icon"
              onClick={handleAddItem}
              disabled={!newItemText.trim() || isAddingItem}
              aria-label="Add new todo item"
            >
              {isAddingItem ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Todo items list */}
        <div
          className="flex flex-col gap-2"
          role="list"
          aria-label="Todo items"
        >
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {canEdit ? 'Add your first todo item above!' : 'No todo items yet.'}
            </div>
          ) : (
            items.map(item => (
              <TodoItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdateItem}
                isProcessing={!!processingItems[item.id]}
                canEdit={canEdit}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 