import { TodoItem } from '@/components/Todo';

export interface TodoClientProps {
  travelTodos: TodoItem[];
  workTodos: TodoItem[];
  personalTodos: TodoItem[];
}
