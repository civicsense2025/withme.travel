'use client';

import { TodoClient } from './TodoClient';
import { TodoItem } from '@/components/Todo';

// Sample travel todos
const travelTodos: TodoItem[] = [
  {
    id: '1',
    text: 'Book flights to destination',
    completed: false,
    category: 'travel',
    priority: 'high',
  },
  {
    id: '2',
    text: 'Research local attractions',
    completed: true,
    category: 'travel',
    priority: 'medium',
    dueDate: new Date('2023-12-15'),
  },
  {
    id: '3',
    text: 'Pack suitcase',
    completed: false,
    category: 'travel',
    priority: 'low',
  },
  {
    id: '4',
    text: 'Buy travel insurance',
    completed: false,
    category: 'travel',
    priority: 'high',
  },
];

// Sample work todos
const workTodos: TodoItem[] = [
  {
    id: '5',
    text: 'Complete project proposal',
    completed: true,
    category: 'work',
    priority: 'high',
  },
  {
    id: '6',
    text: 'Schedule team meeting',
    completed: false,
    category: 'work',
    priority: 'medium',
  },
  {
    id: '7',
    text: 'Review quarterly report',
    completed: false,
    category: 'work',
    priority: 'high',
    dueDate: new Date('2023-10-30'),
  },
];

// Sample personal todos
const personalTodos: TodoItem[] = [
  {
    id: '8',
    text: 'Go grocery shopping',
    completed: false,
    category: 'personal',
    priority: 'medium',
  },
  {
    id: '9',
    text: 'Schedule dentist appointment',
    completed: false,
    category: 'personal',
    priority: 'high',
    dueDate: new Date('2023-11-15'),
  },
  {
    id: '10',
    text: 'Start workout routine',
    completed: true,
    category: 'personal',
    priority: 'low',
  },
];

export default function TodoDemoPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Todo Component Demo</h1>

      <p className="mb-6 text-muted-foreground">
        This demo showcases the Todo component with different configurations and examples. Toggle
        between edit and view modes to see how the component adapts to different use cases.
      </p>

      <TodoClient travelTodos={travelTodos} workTodos={workTodos} personalTodos={personalTodos} />

      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Component Features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Add, edit, delete, and toggle completion status of todo items</li>
          <li>Categorize todos with visual indicators (personal, work, travel, shopping)</li>
          <li>Set priority levels (low, medium, high) with color coding</li>
          <li>Add due dates with calendar picker</li>
          <li>Filter by completion status or category</li>
          <li>Real-time optimistic UI updates with fallback error handling</li>
          <li>Full keyboard accessibility and screen reader support</li>
        </ul>
      </div>
    </div>
  );
}
