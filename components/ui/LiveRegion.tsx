/**
 * LiveRegion (Molecule)
 *
 * A component that announces content to screen readers without 
 * disrupting the visual flow of the application.
 *
 * @module ui/molecules
 */
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LiveRegionProps {
  /** Text message to announce */
  message?: string;
  /** ARIA politeness level */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Auto-clear message after this many milliseconds (0 disables) */
  clearAfter?: number;
  /** Whether to visually hide the live region */
  visuallyHidden?: boolean;
  /** Relevant role for the live region */
  role?: 'status' | 'alert' | 'log' | 'timer' | 'marquee' | 'progressbar';
  /** Called when message is cleared */
  onMessageCleared?: () => void;
  /** Multiple messages to announce in sequence */
  messages?: string[];
  /** Class name for the container */
  className?: string;
  /** Additional attributes */
  atomicUpdate?: boolean;
  /** Whether to mark the region as an atomic update */
  busy?: boolean;
}

export function LiveRegion({
  message,
  politeness = 'polite',
  clearAfter = 0,
  visuallyHidden = true,
  role = 'status',
  onMessageCleared,
  messages,
  className,
  atomicUpdate = false,
  busy = false,
  ...props
}: LiveRegionProps) {
  // State for the current message
  const [currentMessage, setCurrentMessage] = useState<string | undefined>(message);
  const [queuedMessages, setQueuedMessages] = useState<string[]>(messages || []);
  
  // Ref to track timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Process the next message in the queue
  const processQueue = () => {
    if (queuedMessages.length > 0) {
      const nextMessage = queuedMessages[0];
      setCurrentMessage(nextMessage);
      setQueuedMessages(prev => prev.slice(1));
    } else {
      setCurrentMessage(undefined);
      onMessageCleared?.();
    }
  };
  
  // Update message when prop changes
  useEffect(() => {
    if (message === undefined) return;
    
    if (currentMessage && message !== currentMessage) {
      // If we already have a message, queue this one
      setQueuedMessages(prev => [...prev, message]);
    } else {
      // Otherwise set it immediately
      setCurrentMessage(message);
    }
  }, [message, currentMessage]);
  
  // Update queue when messages prop changes
  useEffect(() => {
    if (messages && messages.length > 0) {
      if (!currentMessage) {
        // If no current message, set the first one
        setCurrentMessage(messages[0]);
        setQueuedMessages(messages.slice(1));
      } else {
        // Otherwise add to queue
        setQueuedMessages(prev => [...prev, ...messages]);
      }
    }
  }, [messages, currentMessage]);
  
  // Clear message after timeout
  useEffect(() => {
    if (clearAfter && clearAfter > 0 && currentMessage) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        processQueue();
      }, clearAfter);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [clearAfter, currentMessage]);
  
  // Key for forcing DOM updates
  const key = useRef(0);
  
  // Force a fresh DOM node for screen readers to announce new messages
  useEffect(() => {
    if (currentMessage) {
      key.current += 1;
    }
  }, [currentMessage]);
  
  // Don't render anything if no message
  if (!currentMessage) {
    return null;
  }
  
  // Visually hidden styles
  const hiddenStyles = visuallyHidden ? {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0
  } as React.CSSProperties : {};
  
  return (
    <div
      key={key.current}
      className={cn(visuallyHidden ? 'sr-only' : '', className)}
      style={hiddenStyles}
      aria-live={politeness}
      role={role}
      aria-atomic={atomicUpdate}
      aria-busy={busy}
      {...props}
    >
      {currentMessage}
    </div>
  );
}

/**
 * Hook for using LiveRegion functionality outside of React component tree
 */
export function useLiveRegion(options: Omit<LiveRegionProps, 'message' | 'messages'> = {}) {
  const [message, setMessage] = useState<string | undefined>();
  const [messages, setMessages] = useState<string[]>([]);
  
  const announce = (text: string) => {
    setMessage(text);
  };
  
  const announceMultiple = (textArray: string[]) => {
    setMessages(textArray);
  };
  
  const clear = () => {
    setMessage(undefined);
    setMessages([]);
  };
  
  return {
    announce,
    announceMultiple,
    clear,
    LiveRegion: () => (
      <LiveRegion 
        message={message} 
        messages={messages} 
        onMessageCleared={clear}
        {...options}
      />
    )
  };
}