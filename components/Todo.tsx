'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Clock, CalendarIcon, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category?: string;
  createdAt: Date;
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
  onAdd?: (text: string, priority?: string, dueDate?: Date, category?: string) => Promise<void>;
  /**
   * Available categories for todos
   */
  categories?: string[];
}

export function TodoList({
  initialItems = [],
  canEdit = true,
  title = 'Todo List',
  onToggle,
  onDelete,
  onAdd,
  categories = ['Personal', 'Work', 'Travel', 'Shopping', 'Other'],
}: TodoListProps) {
  const [items, setItems] = useState<TodoItem[]>(() => {
    // Initialize with the correct structure if initialItems are missing some fields
    return initialItems.map(item => ({
      ...item,
      priority: item.priority || 'medium',
      createdAt: item.createdAt || new Date(),
    }));
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemDueDate, setNewItemDueDate] = useState<Date | undefined>(undefined);
  const [newItemCategory, setNewItemCategory] = useState<string>('Other');
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority');

  // Sort and filter items
  const filteredItems = items
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'medium'] || 1) - (priorityOrder[b.priority || 'medium'] || 1);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else {
        return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
      }
    });

  const handleToggle = async (id: string) => {
    if (processingId) return;
    
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    
    setProcessingId(id);
    const originalItems = [...items];
    const newCompleted = !items[itemIndex].completed;
    
    // Optimistically update the UI
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: newCompleted } : item
    ));
    
    try {
      // Call the callback if provided
      if (onToggle) {
        await onToggle(id, newCompleted);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
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
    setItems(items.filter(item => item.id !== id));
    
    try {
      // Call the callback if provided
      if (onDelete) {
        await onDelete(id);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
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
      priority: newItemPriority,
      dueDate: newItemDueDate,
      category: newItemCategory,
      createdAt: new Date(),
    };
    
    // Optimistically update the UI
    setItems([...items, newItem]);
    
    // Reset form
    setNewItemText('');
    setNewItemPriority('medium');
    setNewItemDueDate(undefined);
    setNewItemCategory('Other');
    
    try {
      // Call the callback if provided
      if (onAdd) {
        await onAdd(newItem.text, newItem.priority, newItem.dueDate, newItem.category);
      } else {
        // Simulate API delay if no callback provided
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      // Remove the item on error
      setItems(items);
      console.error('Failed to add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-orange-500 bg-orange-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-blue-500 bg-blue-50';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Work':
        return 'bg-blue-100 text-blue-800';
      case 'Personal':
        return 'bg-purple-100 text-purple-800';
      case 'Travel':
        return 'bg-green-100 text-green-800';
      case 'Shopping':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue>Filter</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue>Sort by</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No items found.</p>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-md",
                item.completed ? "bg-muted/40" : "hover:bg-accent/5",
                processingId === item.id && "opacity-70"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  disabled={processingId === item.id || !canEdit}
                  className={item.completed ? "opacity-70" : ""}
                />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "transition-all",
                      item.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  <div className="flex gap-2 mt-1 items-center">
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority || 'medium'}
                    </Badge>
                    
                    {item.category && (
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    )}
                    
                    {item.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(item.dueDate, 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  disabled={processingId === item.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
