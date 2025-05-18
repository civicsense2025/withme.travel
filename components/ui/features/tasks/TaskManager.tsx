'use client';

/**
 * Task Manager Component
 * 
 * Complete task management with list, creation, and actions
 */

import React, { useState, useCallback } from 'react';
import { TaskList, type Task } from './TaskList';
import { useTasks } from '@/hooks/use-tasks';
import { TagsManager } from '../tags/TagsManager';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

// ============================================================================
// TYPES
// ============================================================================

export interface TaskManagerProps {
  /** User ID for personal tasks */
  userId?: string;
  /** Group ID for group tasks */
  groupId?: string;
  /** Initial filter for tasks */
  initialFilter?: 'all' | 'active' | 'completed';
  /** Maximum height for the task list */
  maxHeight?: string | number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Complete task management component with list, creation, and actions
 */
export function TaskManager({
  userId,
  groupId,
  initialFilter = 'all',
  maxHeight,
  className,
}: TaskManagerProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Task state for creation/editing
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>(undefined);
  const [taskPriority, setTaskPriority] = useState<number>(3);
  const [taskTags, setTaskTags] = useState<string[]>([]);
  
  // Get tasks from hook
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    assignTask,
    voteTask,
    addTagToTask,
    removeTagFromTask,
    isCreating,
    isUpdating,
    isDeleting,
    isTogglingComplete,
    isAssigning,
    isAddingTag,
    isRemovingTag,
  } = useTasks({
    userId,
    groupId,
    fetchOnMount: true
  });
  
  // Handle opening create modal
  const handleOpenCreateModal = useCallback(() => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate(undefined);
    setTaskPriority(3);
    setTaskTags([]);
    setSelectedTaskId(null);
    setIsCreateModalOpen(true);
  }, []);
  
  // Handle task creation/update
  const handleSaveTask = useCallback(async () => {
    if (!taskTitle.trim()) return;
    
    const taskData = {
      title: taskTitle,
      description: taskDescription || undefined,
      dueDate: taskDueDate ? taskDueDate.toISOString() : undefined,
      priority: taskPriority,
    };
    
    if (selectedTaskId) {
      // Update existing task
      await updateTask(selectedTaskId, taskData);
    } else {
      // Create new task
      const result = await createTask({
        ...taskData,
        groupId,
        assigneeId: userId,
      });
      
      // Add tags if any
      if (result.success && taskTags.length > 0) {
        const newTaskId = result.data.id;
        for (const tag of taskTags) {
          await addTagToTask(newTaskId, tag);
        }
      }
    }
    
    setIsCreateModalOpen(false);
  }, [
    taskTitle, 
    taskDescription, 
    taskDueDate, 
    taskPriority, 
    taskTags, 
    selectedTaskId,
    groupId,
    userId,
    updateTask,
    createTask,
    addTagToTask
  ]);
  
  // Handle task deletion
  const handleDeleteTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
  }, [deleteTask]);
  
  // Handle task completion toggle
  const handleToggleComplete = useCallback(async (taskId: string, isCompleted: boolean) => {
    await toggleTaskComplete(taskId, isCompleted);
  }, [toggleTaskComplete]);
  
  // Handle task click
  const handleTaskClick = useCallback((taskId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setTaskTitle(task.title);
      setTaskDescription(task.description || '');
      setTaskDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setTaskPriority(task.priority || 3);
      setTaskTags((task.tags || []).map(tag => tag.name));
      setIsCreateModalOpen(true);
    }
  }, [tasks]);
  
  // Map tasks to the required format
  const formattedTasks: Task[] = tasks?.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    isCompleted: task.isCompleted,
    priority: task.priority,
    assignee: task.assignee ? {
      id: task.assignee.id,
      name: task.assignee.name,
      avatarUrl: task.assignee.avatarUrl,
    } : undefined,
    tags: task.tags,
  })) || [];
  
  return (
    <div className={cn('space-y-6', className)}>
      <TaskList
        tasks={formattedTasks}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onToggleComplete={handleToggleComplete}
        onAssign={assignTask}
        onDelete={handleDeleteTask}
        onRemoveTag={removeTagFromTask}
        onCreateTask={handleOpenCreateModal}
        onTaskClick={handleTaskClick}
        loading={{
          completion: isTogglingComplete,
          assignment: isAssigning,
          deletion: isDeleting,
          tagRemoval: isRemovingTag,
        }}
        showCreateButton={true}
        maxHeight={maxHeight}
      />
      
      {/* Create/Edit Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTaskId ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription>
              {selectedTaskId
                ? 'Update the details of this task.'
                : 'Add a new task to your list.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="resize-none"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add more details..."
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due-date">Due Date</Label>
                <DatePicker
                  selected={taskDueDate}
                  onSelect={setTaskDueDate}
                  placeholder="Select a date"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskPriority.toString()}
                  onValueChange={(value) => setTaskPriority(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Highest</SelectItem>
                    <SelectItem value="4">High</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="2">Low</SelectItem>
                    <SelectItem value="1">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Tags</Label>
              <TagsManager
                entityType="task"
                entityId={selectedTaskId || undefined}
                initialTags={taskTags}
                label=""
                placeholder="Add tags..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTask}
              disabled={!taskTitle.trim() || isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 