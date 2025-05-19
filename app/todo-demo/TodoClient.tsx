'use client';

import { useState } from 'react';
import { Todo, TodoItem } from '@/components/Todo';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast'
import { TodoClientProps } from './types';

export function TodoClient({ travelTodos, workTodos, personalTodos }: TodoClientProps) {
  const [canEdit, setCanEdit] = useState(true);

  // Handlers for todo actions
  const handleToggle = async (id: string, completed: boolean) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the task name in any of the todo lists
    const taskName =
      [...travelTodos, ...workTodos, ...personalTodos].find((item) => item.id === id)?.text ||
      'Task';

    toast({
      title: 'Todo updated',
      description: `Task "${taskName}" marked as ${completed ? 'completed' : 'active'}`,
    });

    return Promise.resolve();
  };

  const handleDelete = async (id: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: 'Todo deleted',
      description: 'Task has been removed from your list',
    });

    return Promise.resolve();
  };

  const handleAdd = async (text: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    toast({
      title: 'Todo added',
      description: `New task "${text}" has been added to your list`,
    });

    return Promise.resolve();
  };

  const handleUpdate = async (id: string, updates: Partial<TodoItem>) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 700));

    toast({
      title: 'Todo updated',
      description: 'Task has been updated successfully',
    });

    return Promise.resolve();
  };

  return (
    <>
      <div className="flex items-center mb-6 space-x-4">
        <Button variant={canEdit ? 'default' : 'outline'} onClick={() => setCanEdit(true)}>
          Edit Mode
        </Button>
        <Button variant={!canEdit ? 'default' : 'outline'} onClick={() => setCanEdit(false)}>
          View Mode
        </Button>
      </div>

      <div className="mb-8 max-w-xl">
        <Todo
          initialItems={travelTodos}
          canEdit={canEdit}
          title="Travel Planning"
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Work Tasks</h2>
          <Todo
            initialItems={workTodos}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Tasks</h2>
          <Todo
            initialItems={personalTodos}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </>
  );
}
