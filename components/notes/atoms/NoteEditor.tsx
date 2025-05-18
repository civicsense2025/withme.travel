/**
 * Note Editor
 *
 * Atom component for editing note content with simple markdown editing capabilities
 *
 * @module notes/atoms
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Heading, Link } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface NoteEditorProps {
  /** The content to edit */
  value: string;
  /** Callback when content changes */
  onChange: (value: string) => void;
  /** Optional auto-save callback */
  onAutoSave?: (value: string) => void;
  /** Auto-save delay in milliseconds */
  autoSaveDelay?: number;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Optional minimum height */
  minHeight?: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NoteEditor({
  value,
  onChange,
  onAutoSave,
  autoSaveDelay = 1000,
  readOnly = false,
  minHeight = '300px',
  placeholder = 'Start typing...',
  className,
}: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up auto-save
  useEffect(() => {
    if (!onAutoSave) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      onAutoSave(value);
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [value, onAutoSave, autoSaveDelay]);

  // Format functions
  const insertFormat = (formatSymbol: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // If text is selected, wrap it
    if (selectedText) {
      const newText = beforeText + formatSymbol + selectedText + formatSymbol + afterText;
      onChange(newText);

      // Set selection to maintain the selected text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formatSymbol.length, end + formatSymbol.length);
      }, 0);
    }
    // If no text is selected, insert placeholder
    else {
      const newText = beforeText + formatSymbol + placeholder + formatSymbol + afterText;
      onChange(newText);

      // Position cursor within the format symbols
      setTimeout(() => {
        textarea.focus();
        const cursorPos = start + formatSymbol.length;
        textarea.setSelectionRange(cursorPos, cursorPos + placeholder.length);
      }, 0);
    }
  };

  // Toolbar actions
  const addBold = () => insertFormat('**', 'bold text');
  const addItalic = () => insertFormat('_', 'italic text');
  const addHeading = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeText = value.substring(0, lineStart);
    const lineText = value.substring(lineStart, start);
    const afterText = value.substring(start);

    // Check if there's already a heading
    if (lineText.startsWith('# ')) {
      // Remove the heading
      const newText = beforeText + lineText.substring(2) + afterText;
      onChange(newText);
    } else {
      // Add heading
      const newText = beforeText + '# ' + lineText + afterText;
      onChange(newText);

      // Set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const addList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // For selected text, add list items for each line
    if (selectedText) {
      const lines = selectedText.split('\n');
      const newLines = lines.map((line) => (line ? `- ${line}` : line));
      const newText = beforeText + newLines.join('\n') + afterText;
      onChange(newText);
    }
    // If no text is selected, just add a list item
    else {
      const newText = beforeText + '- ' + afterText;
      onChange(newText);

      // Position cursor after the list marker
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const addLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // Format: [text](url)
    const linkText = selectedText || 'link text';
    const newText = beforeText + `[${linkText}](https://)` + afterText;
    onChange(newText);

    // Set selection to URL part
    setTimeout(() => {
      textarea.focus();
      const linkTextLength = linkText.length;
      textarea.setSelectionRange(start + linkTextLength + 3, start + linkTextLength + 11);
    }, 0);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {!readOnly && (
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={addBold} className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
            <span className="sr-only">Bold</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addItalic}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
            <span className="sr-only">Italic</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addHeading}
            className="h-8 w-8 p-0"
          >
            <Heading className="h-4 w-4" />
            <span className="sr-only">Heading</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={addList} className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
            <span className="sr-only">List</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={addLink} className="h-8 w-8 p-0">
            <Link className="h-4 w-4" />
            <span className="sr-only">Link</span>
          </Button>
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('font-mono text-sm', readOnly && 'bg-muted cursor-default')}
        placeholder={placeholder}
        style={{ minHeight }}
        readOnly={readOnly}
      />
    </div>
  );
}
