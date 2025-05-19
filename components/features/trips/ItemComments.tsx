/**
 * @deprecated This component has been moved to components/features/trips/molecules/ItemComments.tsx
 * Please update your imports to use the new location.
 */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, ThumbsUp, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
// NOTE: Presence context is disabled to prevent build errors
// import { usePresenceContext } from '@/components/presence/presence-context';

/**
 * ItemComments Component
 *
 * Displays comments for a trip item (itinerary, activity, etc).
 * @module components/features/trips/ItemComments
 */

export interface Comment {
  id: number;
  created_at: string;
  guest_token?: string | null;
  // TODO: Add user_id, content, etc. if/when schema supports it
}

/**
 * ItemComments component props
 */
export interface ItemCommentsProps {
  /** Item ID for which to show comments */
  itemId: string;
  /** List of comments */
  comments?: { id: string; author: string; text: string }[];
  /** Callback when a new comment is added */
  onAddComment?: (text: string) => void;
  /** Additional className for styling */
  className?: string;
}

/**
 * ItemComments for trip items (placeholder)
 */
export function ItemComments({ itemId, comments = [], onAddComment, className }: ItemCommentsProps) {
  // TODO: Implement comments UI
  return (
    <section className={className}>
      <h4>Comments for Item {itemId}</h4>
      <ul>
        {comments.map((c) => (
          <li key={c.id}><strong>{c.author}:</strong> {c.text}</li>
        ))}
      </ul>
      {/* TODO: Add comment input */}
    </section>
  );
}

export default ItemComments;
