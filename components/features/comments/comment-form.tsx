'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isReply?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  isReply = false,
  placeholder = 'Write a comment...',
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className="w-full pr-10 pl-4 py-2 rounded-lg border-0 bg-transparent focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={content}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        disabled={isSubmitting}
        aria-label="Write a comment"
      />
      <button
        type="button"
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${content.trim() ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground bg-muted'} disabled:opacity-50`}
        onClick={handleSubmit}
        disabled={!content.trim() || isSubmitting}
        aria-label="Send comment"
        tabIndex={content.trim() ? 0 : -1}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
