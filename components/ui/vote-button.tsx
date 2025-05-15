'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export type VoteType = 'up' | 'down' | 'none';

export interface VoteButtonProps {
  /** Current vote state */
  value?: VoteType;
  /** Vote count (can be positive or negative) */
  count?: number;
  /** Whether the voting action is disabled */
  disabled?: boolean;
  /** Whether to show only a single vote button (up or down) */
  singleButton?: boolean;
  /** Which button to show if singleButton is true */
  buttonType?: 'up' | 'down';
  /** Size of the button(s) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS classes */
  className?: string;
  /** Whether to just show the icon without button styling */
  iconOnly?: boolean;
  /** Called when vote state changes */
  onChange?: (value: VoteType) => void;
}

export function VoteButton({
  value = 'none',
  count = 0,
  disabled = false,
  singleButton = false,
  buttonType = 'up',
  size = 'md',
  className,
  iconOnly = false,
  onChange,
}: VoteButtonProps) {
  const [currentValue, setCurrentValue] = useState<VoteType>(value);
  
  // Size mappings
  const sizeClasses = {
    sm: {
      button: 'h-7 px-2 text-xs',
      icon: 'h-3 w-3',
      countText: 'text-xs',
      countOffset: 'ml-1',
    },
    md: {
      button: 'h-9 px-3 text-sm',
      icon: 'h-4 w-4',
      countText: 'text-sm',
      countOffset: 'ml-1.5',
    },
    lg: {
      button: 'h-10 px-4 text-base',
      icon: 'h-5 w-5',
      countText: 'text-base',
      countOffset: 'ml-2',
    },
  };

  const handleVote = (newValue: VoteType) => {
    // Toggle off if clicking the same button
    const updatedValue = currentValue === newValue ? 'none' : newValue;
    setCurrentValue(updatedValue);
    onChange?.(updatedValue);
  };

  const renderButton = (type: 'up' | 'down') => {
    const isActive = currentValue === type;
    const isUp = type === 'up';
    
    const buttonStyles = isUp 
      ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500'
      : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500';
    
    const activeStyles = isUp
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
      
    if (iconOnly) {
      return (
        <button
          type="button"
          onClick={() => handleVote(type)}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center rounded-full p-1 transition-colors',
            isActive ? (isUp ? 'text-emerald-600' : 'text-rose-600') : 'text-muted-foreground hover:text-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          aria-label={isUp ? 'Vote up' : 'Vote down'}
        >
          {isUp ? (
            <ThumbsUp className={sizeClasses[size].icon} />
          ) : (
            <ThumbsDown className={sizeClasses[size].icon} />
          )}
        </button>
      );
    }
    
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleVote(type)}
        disabled={disabled}
        className={cn(
          sizeClasses[size].button,
          'relative font-normal border transition-colors',
          isActive ? activeStyles : buttonStyles,
          className
        )}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className={sizeClasses[size].icon} />
            </motion.span>
          ) : (
            <motion.span
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              {isUp ? (
                <ThumbsUp className={sizeClasses[size].icon} />
              ) : (
                <ThumbsDown className={sizeClasses[size].icon} />
              )}
              
              {(count > 0 && isUp) || (count < 0 && !isUp) ? (
                <span className={cn(sizeClasses[size].countText, sizeClasses[size].countOffset)}>
                  {isUp ? count : Math.abs(count)}
                </span>
              ) : null}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    );
  };

  if (singleButton) {
    return renderButton(buttonType);
  }

  return (
    <div className="flex items-center space-x-2">
      {renderButton('up')}
      {!iconOnly && (
        <span className={cn('text-center min-w-[2rem]', sizeClasses[size].countText, disabled && 'opacity-50')}>
          {count > 0 ? `+${count}` : count < 0 ? count : '0'}
        </span>
      )}
      {renderButton('down')}
    </div>
  );
}

export default VoteButton; 