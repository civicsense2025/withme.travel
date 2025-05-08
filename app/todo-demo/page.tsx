'use client';

import { useState } from 'react';
import { TodoList, TodoItem } from '@/app/components/Todo';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function TodoDemo() {
  // Sample initial todo items
  const initialTodos: TodoItem[] = [
    {
      id: 'todo-1',
      text: 'Book flights to Paris',
      completed: false
    },
    {
      id: 'todo-2',
      text: 'Research accommodations',
      completed: true
    },
    {
      id: 'todo-3',
      text: 'Create travel itinerary',
      completed: false
    },
    {
      id: 'todo-4',
      text: 'Check passport expiration',
      completed: true
    }
  ];

  // Handlers for todo actions
  const handleToggle = async (id: string, completed: boolean) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: 'Todo updated',
      description: `Task "${initialTodos.find(item => item.id === id)?.text}" marked as ${completed ? 'completed' : 'active'}`,
    });
    
    return Promise.resolve();
  };

  const handleDelete = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: 'Todo deleted',
      description: `Task has been removed from your list`,
    });
    
    return Promise.resolve();
  };

  const handleAdd = async (text: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    toast({
      title: 'Todo added',
      description: `New task "${text}" has been added to your list`,
    });
    
    return Promise.resolve();
  };

  const [canEdit, setCanEdit] = useState(true);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Todo List Component</h1>
      <p className="text-muted-foreground mb-6">
        A simple, elegant todo list component for tracking tasks
      </p>
      
      <div className="flex items-center mb-6 space-x-4">
        <Button 
          variant={canEdit ? "default" : "outline"}
          onClick={() => setCanEdit(true)}
        >
          Edit Mode
        </Button>
        <Button 
          variant={!canEdit ? "default" : "outline"}
          onClick={() => setCanEdit(false)}
        >
          View Mode
        </Button>
      </div>
      
      <div className="mb-8 max-w-xl">
        <TodoList 
          initialItems={initialTodos}
          canEdit={canEdit}
          title="Travel Planning"
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Work Tasks</h2>
          <TodoList 
            initialItems={[
              { id: 'work-1', text: 'Complete project proposal', completed: false },
              { id: 'work-2', text: 'Schedule team meeting', completed: true },
              { id: 'work-3', text: 'Review quarterly goals', completed: false }
            ]}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Tasks</h2>
          <TodoList 
            initialItems={[
              { id: 'personal-1', text: 'Go grocery shopping', completed: false },
              { id: 'personal-2', text: 'Call mom', completed: false },
              { id: 'personal-3', text: 'Gym workout', completed: true }
            ]}
            canEdit={canEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      </div>
    </div>
  );
} 