'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, MessageCircle, Plus, Smile, MoreVertical } from 'lucide-react';
import { GroupIdea, IdeaPosition, ColumnId } from './store/idea-store';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EmojiPicker } from 'frimousse';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import IdeaComments from './components/idea-comments';
import { formatDateRange } from './utils/date-utils';

interface IdeaCardProps {
  idea: GroupIdea;
  onDelete: () => void;
  onEdit: () => void;
  selected?: boolean;
  position: IdeaPosition;
  onPositionChange: (position: IdeaPosition) => void;
  userId: string;
}

// --- WithMe.Travel IdeaCard ---
// Column-based layout for idea cards

const pastelBg = {
  destination: 'bg-gradient-to-br from-[hsl(var(--travel-blue)/0.10)] to-white',
  date: 'bg-gradient-to-br from-[hsl(var(--travel-yellow)/0.10)] to-white',
  activity: 'bg-gradient-to-br from-[hsl(var(--travel-mint)/0.10)] to-white',
  budget: 'bg-gradient-to-br from-[hsl(var(--travel-peach)/0.10)] to-white',
  other: 'bg-gradient-to-br from-[hsl(var(--travel-purple)/0.10)] to-white',
};

const emojiColor = {
  destination: 'text-blue-600',
  date: 'text-yellow-600',
  activity: 'text-green-600',
  budget: 'text-orange-600',
  other: 'text-purple-600',
};

const IdeaCard = React.memo(function IdeaCard({ 
  idea, 
  onDelete, 
  onEdit, 
  selected = false,
  position,
  onPositionChange,
  userId
}: IdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<{emoji: string, users: string[]}[]>([]); // TODO: wire to backend
  const cardRef = useRef<HTMLDivElement>(null);

  // Background color based on type
  const getBgColor = (type: string) => pastelBg[type as keyof typeof pastelBg] || pastelBg.other;
  const getEmojiColor = (type: string) => emojiColor[type as keyof typeof emojiColor] || emojiColor.other;

  // Emoji based on type
  const getEmoji = (type: string) => {
    switch (type) {
      case 'destination': return '📍';
      case 'date': return '📅';
      case 'activity': return '🏄‍♂️';
      case 'budget': return '💰';
      default: return '💭';
    }
  };

  // Add reaction handler (to be wired to backend)
  const onAddReaction = (emoji: string) => {
    // TODO: Wire to backend and real-time updates
    setReactions((prev) => {
      const idx = prev.findIndex(r => r.emoji === emoji);
      if (idx > -1) {
        // Toggle user reaction
        const users = prev[idx].users.includes(userId)
          ? prev[idx].users.filter(u => u !== userId)
          : [...prev[idx].users, userId];
        return [
          ...prev.slice(0, idx),
          { emoji, users },
          ...prev.slice(idx + 1)
        ];
      } else {
        return [...prev, { emoji, users: [userId] }];
      }
    });
    setShowEmojiPicker(false);
  };

  if (!idea) {
    return <div className="bg-red-100 text-red-600 p-2 rounded">Missing idea data</div>;
  }

  return (
    <div className="idea-card-container flex flex-col">
      <Card 
        ref={cardRef}
        className={cn(
          'idea-card relative border-2 shadow-md transition-all duration-200 group overflow-visible cursor-grab active:cursor-grabbing',
          getBgColor(idea.type),
          'rounded-2xl p-4',
          selected ? 'ring-2 ring-blue-400' : '',
          isHovered ? 'shadow-lg scale-[1.02]' : ''
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Context menu absolute positioned in the top right */}
        <div 
          className={cn(
            "absolute top-2 right-2 z-50 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-200/80 focus:outline-none focus:bg-gray-200/80"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="min-w-[120px]">
              <DropdownMenuItem onSelect={onEdit} className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-gray-500" strokeWidth={1.5} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="flex items-center gap-2 text-red-600">
                <X className="h-4 w-4" strokeWidth={1.5} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardHeader className="p-0 pb-0 flex flex-row items-start justify-between relative">
          <h3 className="font-bold text-base text-balance text-gray-900 leading-tight mb-0 mt-0 flex-1 truncate pr-6">
            {idea.type === 'date' && idea.start_date && (
              // Show month and year as title
              new Date(idea.start_date).toLocaleString('default', { month: 'long', year: 'numeric' })
            )}
            {idea.type !== 'date' && idea.title}
          </h3>
        </CardHeader>

        <CardContent className="p-0 pt-0 pb-2">
          {idea.type === 'date' && (
            <div className="mb-1 text-sm text-gray-700 leading-snug text-balance">
              {formatDateRange(idea.start_date, idea.end_date)}
            </div>
          )}
          {idea.description && (
            <p className="mb-1 text-sm text-gray-700 leading-snug text-balance">{idea.description}</p>
          )}
          {idea.notes && (
            <div className="mb-1 text-xs text-gray-500 italic">{idea.notes}</div>
          )}
          {/* Always render a gap if no notes/description */}
          {!idea.description && !idea.notes && <div className="mb-4" />}
          
          {/* Card Footer: Reactions & Comments */}
          <div className="absolute bottom-2 right-3 flex items-center gap-2 text-xs mt-6 z-40">
            {/* Reactions bar as compact emoji chips */}
            <div className="flex items-center gap-1">
              {reactions.map(r => (
                <button
                  key={r.emoji}
                  className={cn(
                    'px-1.5 h-5 flex items-center gap-0.5 text-base font-medium transition-all',
                    r.users.includes(userId) ? 'ring-2 ring-blue-300' : ''
                  )}
                  style={{ background: 'none', border: 'none' }}
                  onClick={() => onAddReaction(r.emoji)}
                  aria-label={`React with ${r.emoji}`}
                >
                  <span className="text-sm" aria-hidden="true">{r.emoji}</span>
                  <span className="text-[10px] text-gray-500 font-semibold">{r.users.length}</span>
                </button>
              ))}
              {/* Add reaction button (now a smile icon) */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    aria-label="Add reaction"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <Smile className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 rounded-2xl shadow-xl bg-white/95 border border-gray-100 min-w-[220px] max-w-xs">
                  <EmojiPicker.Root>
                    <EmojiPicker.Search className="mb-1 rounded-md bg-gray-100 px-2 py-1 text-xs" />
                    <EmojiPicker.Viewport className="max-h-40 overflow-y-auto">
                      <EmojiPicker.Loading className="text-gray-400 text-xs">Loading…</EmojiPicker.Loading>
                      <EmojiPicker.Empty className="text-gray-400 text-xs">No emoji found.</EmojiPicker.Empty>
                      <EmojiPicker.List
                        className="select-none pb-1"
                        components={{
                          Emoji: ({ emoji, ...props }) => (
                            <button
                              {...props}
                              className="flex size-6 items-center justify-center rounded-md text-base hover:bg-gray-100 transition-colors"
                              onClick={() => onAddReaction(emoji.emoji)}
                              aria-label={`Pick emoji ${emoji.emoji}`}
                            >
                              {emoji.emoji}
                            </button>
                          ),
                        }}
                      />
                    </EmojiPicker.Viewport>
                  </EmojiPicker.Root>
                </PopoverContent>
              </Popover>
            </div>
            {/* Comments button (no background, always clickable) */}
            <button 
              className="flex items-center justify-center h-5 w-5 p-0 z-50" 
              style={{ background: 'none', border: 'none' }}
              onClick={() => setShowComments(!showComments)} 
              aria-label={showComments ? "Hide comments" : "Show comments"}
              title={showComments ? "Hide comments" : "Show comments"}
              tabIndex={0}
            >
              <MessageCircle className={cn("h-4 w-4", showComments ? "text-primary" : "text-gray-500")} />
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Show comments inline when expanded */}
      {showComments && (
        <div className="mt-2 px-1 py-2 bg-background border rounded-xl">
          <IdeaComments 
            ideaId={idea.id} 
            userId={userId}
          />
        </div>
      )}
    </div>
  );
});

export default IdeaCard;