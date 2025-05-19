/**
 * Note Title
 *
 * Atom component for displaying and editing a note title
 *
 * @module notes/atoms
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface NoteTitleProps {
  /** The title text to display */
  title: string;
  /** Whether the title is editable */
  editable?: boolean;
  /** Callback when title is changed */
  onChange?: (newTitle: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NoteTitle({ title, editable = false, onChange, className }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal state when prop changes
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Handle double click to edit
  const handleDoubleClick = () => {
    if (editable) {
      setIsEditing(true);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  // Handle save (blur or enter key)
  const handleSave = () => {
    if (editValue !== title && onChange) {
      onChange(editValue);
    }
    setIsEditing(false);
  };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(title); // Revert to original value
      setIsEditing(false);
    }
  };

  // If in edit mode, show input
  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn('text-xl font-bold', className)}
        aria-label="Edit note title"
      />
    );
  }

  // Otherwise display as a heading
  return (
    <h2
      className={cn(
        'text-xl font-bold',
        editable && 'cursor-pointer hover:text-primary',
        className
      )}
      onDoubleClick={handleDoubleClick}
    >
      {title || 'Untitled Note'}
    </h2>
  );
}
