'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, MessageCircle, Smile, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { GroupIdea, ColumnId, IdeaPosition } from './store/idea-store';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import * as Frimousse from 'frimousse';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import IdeaComments from './components/idea-comments';
import { formatDateRange } from './utils/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
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

const pastelBg = {
  destination: 'bg-gradient-to-br from-[hsl(var(--travel-blue)/0.10)] to-white',
  date: 'bg-gradient-to-br from-[hsl(var(--travel-yellow)/0.10)] to-white',
  activity: 'bg-gradient-to-br from-[hsl(var(--travel-mint)/0.10)] to-white',
  budget: 'bg-gradient-to-br from-[hsl(var(--travel-peach)/0.10)] to-white',
  other: 'bg-gradient-to-br from-[hsl(var(--travel-purple)/0.10)] to-white',
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

  // Background color based on type
  const getBgColor = (type: string) => pastelBg[type as keyof typeof pastelBg] || pastelBg.other;

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
          'idea-card relative border-2 shadow-md transition-all duration-200 group overflow-visible cursor-grab active:cursor-grabbing',
          getBgColor(idea.type),
          'rounded-2xl p-4 min-h-[120px]',
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

        <CardHeader className="p-0 pb-0 flex flex-row items-center justify-between relative">
          <h3 className="font-bold text-base text-balance text-gray-900 leading-tight mb-0 mt-0 flex-1 truncate pr-6">
            {editingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="font-bold text-base text-gray-900 bg-white border rounded px-1 py-0.5 w-full"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span onDoubleClick={handleTitleDoubleClick} className="cursor-pointer select-text">
                {idea.type === 'date' && idea.start_date
                  ? new Date(idea.start_date).toLocaleString('default', { month: 'long', year: 'numeric' })
                  : idea.title}
              </span>
            )}
          </h3>
        </CardHeader>

        {/* Link block below title if link is attached */}
        {idea.link && idea.link_meta && (
          <div className="mt-2 border rounded p-2 flex gap-2 items-center bg-gray-50">
            {idea.link_meta.image && <img src={idea.link_meta.image} alt="" className="w-12 h-12 object-cover rounded" />}
            <div className="flex-1 min-w-0">
              <a href={idea.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-xs truncate text-blue-700 hover:underline">{idea.link_meta.title}</a>
              <div className="text-xs text-gray-500 truncate">{idea.link_meta.description}</div>
              <div className="text-xs text-blue-500 truncate">{idea.link_meta.siteName || idea.link_meta.url}</div>
            </div>
          </div>
        )}

        <CardContent className="p-0 pt-0 pb-2 mt-2 mb-2 md:mt-[10px] md:mb-[10px]">
          {idea.type === 'date' && (
            <div className="mb-3 text-sm text-gray-700 leading-snug text-balance">
              {formatDateRange(idea.start_date ?? null, idea.end_date ?? null)}
            </div>
          )}
          {idea.description && (
            <p className="mb-3 text-sm text-gray-700 leading-snug text-balance">{idea.description}</p>
          )}
          {idea.notes && (
            <div className="mb-3 text-xs text-gray-500 italic">{idea.notes}</div>
          )}
          {/* Always render a gap if no notes/description */}
          {!idea.description && !idea.notes && idea.type !== 'date' && <div className="mb-3" />}
          
          {/* Card Footer: Reactions & Comments */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-3 text-xs mt-3 z-40 justify-between">
            {/* Reactions bar as compact emoji chips */}
            <div className="flex items-center gap-1">
              {reactions.map(r => (
                <Button 
                  key={r.emoji} 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-7 px-2 py-1 text-sm rounded-full",
                    r.users.includes(userId) ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"
                  )}
                  onClick={() => onAddReaction(r.emoji)}
                >
                  <span className="mr-1">{r.emoji}</span>
                  <span>{r.users.length}</span>
                </Button>
              ))}
              
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 rounded-full bg-gray-50 hover:bg-gray-100"
                  >
                    <Smile className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-md" align="start">
                  <div className="grid grid-cols-8 gap-1 p-3">
                    {["👍", "❤️", "🎉", "👏", "😍", "🙌", "🔥", "⭐"].map(emoji => (
                      <button
                        key={emoji}
                        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100"
                        onClick={() => onAddReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="border-t p-2">
                    <div className="text-xs text-muted-foreground text-center">Common reactions</div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Avatar group with tooltips */}
              <TooltipProvider>
                <div className="flex -space-x-2 overflow-hidden">
                  {idea.collaborators && idea.collaborators.slice(0, 3).map((user, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="inline-block h-6 w-6 rounded-full border-2 border-white bg-gray-100 overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name || 'Guest user'}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-[10px] font-medium uppercase text-gray-600">
                              {user.name ? user.name.charAt(0) : 'G'}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-2 text-xs">
                        {user.name || 'Guest'}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {idea.collaborators && idea.collaborators.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium">
                          +{idea.collaborators.length - 3}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="p-2 text-xs">
                        {idea.collaborators.slice(3).map(u => u.name || 'Guest').join(', ')}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center gap-1"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs">{idea.comment_count || 0}</span>
              </Button>
            </div>
          </div>
        </CardContent>
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
            <div className="pt-2">
              <IdeaComments ideaId={idea.id} groupId={groupId} userId={userId} isAuthenticated={isAuthenticated} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default IdeaCard;