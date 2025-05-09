'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, MessageCircle, Smile, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { GroupIdea, ColumnId, IdeaPosition } from './store/idea-store';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import IdeaComments from './components/idea-comments';
import { formatDateRange } from './utils/date-utils';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaCardProps {
  idea: GroupIdea;
  onDelete: () => void;
  onEdit: () => void;
  selected?: boolean;
  position: IdeaPosition;
  onPositionChange: (position: IdeaPosition) => void;
  userId: string;
  isAuthenticated: boolean;
  groupId: string;
}

// Modern color palette with vibrant accents and subtle background
const cardColors = {
  destination: {
    accent: 'border-l-[hsl(var(--travel-blue))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-blue)/0.08)] to-white/90 dark:from-[hsl(var(--travel-blue)/0.15)] dark:to-gray-950/90',
    hover: 'hover:border-[hsl(var(--travel-blue))] hover:shadow-[0_0_12px_rgba(0,100,255,0.15)]'
  },
  date: {
    accent: 'border-l-[hsl(var(--travel-yellow))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-yellow)/0.08)] to-white/90 dark:from-[hsl(var(--travel-yellow)/0.15)] dark:to-gray-950/90',
    hover: 'hover:border-[hsl(var(--travel-yellow))] hover:shadow-[0_0_12px_rgba(255,200,0,0.15)]'
  },
  activity: {
    accent: 'border-l-[hsl(var(--travel-mint))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-mint)/0.08)] to-white/90 dark:from-[hsl(var(--travel-mint)/0.15)] dark:to-gray-950/90',
    hover: 'hover:border-[hsl(var(--travel-mint))] hover:shadow-[0_0_12px_rgba(0,200,100,0.15)]'
  },
  budget: {
    accent: 'border-l-[hsl(var(--travel-peach))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-peach)/0.08)] to-white/90 dark:from-[hsl(var(--travel-peach)/0.15)] dark:to-gray-950/90',
    hover: 'hover:border-[hsl(var(--travel-peach))] hover:shadow-[0_0_12px_rgba(255,150,50,0.15)]'
  },
  other: {
    accent: 'border-l-[hsl(var(--travel-purple))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-purple)/0.08)] to-white/90 dark:from-[hsl(var(--travel-purple)/0.15)] dark:to-gray-950/90',
    hover: 'hover:border-[hsl(var(--travel-purple))] hover:shadow-[0_0_12px_rgba(150,50,255,0.15)]'
  }
};

const IdeaCard = React.memo(function IdeaCard({ 
  idea, 
  onDelete, 
  onEdit, 
  selected = false,
  position,
  onPositionChange,
  userId,
  isAuthenticated,
  groupId
}: IdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<{emoji: string, users: string[]}[]>([]); // TODO: wire to backend
  const cardRef = useRef<HTMLDivElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(idea.title);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkInput, setLinkInput] = useState(idea.link || '');
  const [linkMeta, setLinkMeta] = useState<any>(idea.link_meta || null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Get color scheme based on idea type
  const getCardStyles = (type: string) => {
    const colorSet = cardColors[type as keyof typeof cardColors] || cardColors.other;
    return {
      accent: colorSet.accent,
      bg: colorSet.bg,
      hover: colorSet.hover
    };
  };

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

  // Add reaction handler
  const onAddReaction = (emoji: string) => {
    setReactions((prev) => {
      const idx = prev.findIndex(r => r.emoji === emoji);
      if (idx > -1) {
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

  // Inline edit handlers
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(true);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
  };
  
  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== idea.title) {
      onEdit && onEdit();
    } else {
      setTitleValue(idea.title);
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditingTitle(false);
      setTitleValue(idea.title);
    }
  };

  // Validate URL
  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Fetch link preview
  const fetchLinkMeta = async (url: string) => {
    setLinkLoading(true);
    setLinkError('');
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Failed to fetch link preview');
      const data = await res.json();
      setLinkMeta(data);
    } catch (err) {
      setLinkError('Could not fetch link preview');
      setLinkMeta(null);
    } finally {
      setLinkLoading(false);
    }
  };

  if (!idea) {
    return <div className="bg-red-100 text-red-600 p-2 rounded">Missing idea data</div>;
  }

  // Get type-based styles
  const cardStyle = getCardStyles(idea.type);

  return (
    <motion.div 
      className="idea-card-container flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        ref={cardRef}
        className={cn(
          'idea-card relative border border-gray-200/80 dark:border-gray-800/50 shadow-sm backdrop-blur-sm',
          'rounded-lg p-2.5 min-h-[90px] transition-all duration-200',
          'cursor-grab active:cursor-grabbing overflow-visible',
          cardStyle.bg,
          cardStyle.accent,
          cardStyle.hover,
          'border-l-4',
          selected ? 'ring-2 ring-blue-400' : '',
          isHovered ? 'shadow-md scale-[1.01]' : ''
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Context menu trigger - Top right */}
        <div 
          className={cn(
            "absolute top-1.5 right-1.5 z-50 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors duration-150"
              >
                <MoreVertical className="h-3 w-3 text-gray-500" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="min-w-[110px]">
              <DropdownMenuItem onSelect={onEdit} className="flex items-center gap-2 text-xs py-1.5">
                <Pencil className="h-3 w-3 text-gray-500" strokeWidth={1.5} /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete} className="flex items-center gap-2 text-xs py-1.5 text-red-600">
                <X className="h-3 w-3" strokeWidth={1.5} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main content */}
        <div className="flex flex-col h-full pt-0.5">
          {/* Type indicator and title */}
          <div className="flex items-start mb-1 pr-5">
            <div className="flex items-center">
              <div className="w-4 h-4 flex items-center justify-center text-xs mr-1">
                {getEmoji(idea.type)}
              </div>
              {!editingTitle ? (
                <h3 
                  className="font-medium text-sm truncate max-w-[180px]"
                  onDoubleClick={handleTitleDoubleClick}
                >
                  {idea.title}
                </h3>
              ) : (
                <Input
                  className="h-6 text-sm py-0 px-1"
                  value={titleValue}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Link block below title if link is attached */}
          {idea.link && idea.link_meta && (
            <div className="mt-1 mb-1 border rounded-sm p-1.5 flex gap-1.5 items-center bg-gray-50/80 dark:bg-gray-800/50 text-xs">
              {idea.link_meta.image && (
                <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden">
                  <img src={idea.link_meta.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <a href={idea.link} target="_blank" rel="noopener noreferrer" className="font-medium truncate text-blue-600 dark:text-blue-400 hover:underline">{idea.link_meta.title}</a>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{idea.link_meta.description || idea.link_meta.siteName || idea.link_meta.url}</div>
              </div>
            </div>
          )}

          {/* Content area */}
          <div className="flex-grow min-h-[20px] text-xs">
            {idea.type === 'date' && (
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                {formatDateRange(idea.start_date ?? null, idea.end_date ?? null)}
              </div>
            )}
            {idea.description && (
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-3">{idea.description}</p>
            )}
            {idea.notes && (
              <div className="text-[10px] text-gray-500 italic mt-1">{idea.notes}</div>
            )}
          </div>
            
          {/* Card Footer: Reactions & Comments */}
          <div className="flex items-center gap-1.5 pt-1.5 mt-1 text-xs border-t border-gray-100 dark:border-gray-800/50 justify-between">
            {/* Reactions */}
            <div className="flex items-center gap-1 flex-wrap">
              {reactions.map(r => (
                <Button 
                  key={r.emoji} 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-5 px-1 py-0 text-xs rounded-full",
                    r.users.includes(userId) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  )}
                  onClick={() => onAddReaction(r.emoji)}
                >
                  <span className="mr-0.5">{r.emoji}</span>
                  <span className="text-[10px]">{r.users.length}</span>
                </Button>
              ))}
              
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 rounded-full"
                  >
                    <Smile className="h-3 w-3 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-md" align="start">
                  <div className="grid grid-cols-8 gap-1 p-2">
                    {["👍", "❤️", "🎉", "👏", "😍", "🙌", "🔥", "⭐"].map(emoji => (
                      <button
                        key={emoji}
                        className="flex items-center justify-center h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => onAddReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
              
            <div className="flex items-center gap-1.5">
              {/* Avatar group with tooltips */}
              <TooltipProvider>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {idea.collaborators && idea.collaborators.slice(0, 3).map((user, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="inline-block h-4 w-4 rounded-full border border-white dark:border-gray-800 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name || 'Guest user'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700 text-[8px] font-medium uppercase text-gray-600 dark:text-gray-300">
                              {user.name ? user.name.charAt(0) : 'G'}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-1.5 text-xs">
                        {user.name || 'Guest'}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {idea.collaborators && idea.collaborators.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 text-[8px] font-medium">
                          +{idea.collaborators.length - 3}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-1.5 text-xs">
                        {idea.collaborators.slice(3).map(u => u.name || 'Guest').join(', ')}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 rounded-full flex items-center gap-0.5"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-3 w-3 text-gray-400" />
                <span className="text-[10px]">{idea.comment_count || 0}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1.5">
              <IdeaComments ideaId={idea.id} groupId={groupId} userId={userId} isAuthenticated={isAuthenticated} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default IdeaCard;