'use client';

import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoListProps {
  initialItems?: TodoItem[];
  canEdit?: boolean;
  title?: string;
  onToggle?: (id: string, completed: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAdd?: (text: string) => Promise<void>;
}

export function TodoList({
  initialItems = [],
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
}: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    if (processingId) return;

    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex === -1) return;

    setProcessingId(id);
    const originalItems = [...items];
    const newCompleted = !items[itemIndex].completed;

    // Optimistically update the UI
    setItems(items.map((item) => (item.id === id ? { ...item, completed: newCompleted } : item)));

    try {
      // Call the callback if provided
      if (onToggle) {
        await onToggle(id, newCompleted);
      } else {
        // Simulate API delay if no callback provided
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Revert on error
      setItems(originalItems);
      console.error('Failed to toggle item:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingId) return;

    setProcessingId(id);
    const originalItems = [...items];

    // Optimistically update the UI
    setItems(items.filter((item) => item.id !== id));

    try {
      // Call the callback if provided
      if (onDelete) {
        await onDelete(id);
      } else {
        // Simulate API delay if no callback provided
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Revert on error
      setItems(originalItems);
      console.error('Failed to delete item:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || isAdding) return;

    setIsAdding(true);
    const newItem: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
    };

    // Optimistically update the UI
    setItems([...items, newItem]);
    setNewItemText('');

    try {
      // Call the callback if provided
      if (onAdd) {
        await onAdd(newItem.text);
      } else {
        // Simulate API delay if no callback provided
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Remove the item on error
      setItems(items);
      console.error('Failed to add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No items added yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-md',
                item.completed ? 'bg-muted/40' : 'hover:bg-accent/5',
                processingId === item.id && 'opacity-70'
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  disabled={processingId === item.id || !canEdit}
                  className={item.completed ? 'opacity-70' : ''}
                />
                <span
                  className={cn(
                    'transition-all',
                    item.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {item.text}
                </span>
              </div>

              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  disabled={processingId === item.id}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {canEdit && (
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Add a new todo..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            disabled={isAdding}
            className="flex-1"
          />
          <Button onClick={handleAddItem} disabled={!newItemText.trim() || isAdding} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </Card>
  );
}
