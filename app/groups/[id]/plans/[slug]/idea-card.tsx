'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, MessageCircle, Smile, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { GroupIdea, ColumnId, IdeaPosition } from './store/idea-store';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import IdeaComments from './components/idea-comments';
import { formatDateRange, formatTimeAgo } from './utils/date-utils';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaCardProps {
  idea: GroupIdea;
  onDelete: () => void;
  onEdit: () => void;
  selected?: boolean;
  onSelect?: () => void;
  selectedIdeasCount?: number;
  position?: IdeaPosition;
  onPositionChange?: (position: IdeaPosition) => void;
  userId?: string;
  isAuthenticated?: boolean;
  groupId?: string;
}

// Modern color palette with vibrant accents and subtle background
const cardColors = {
  destination: {
    accent: 'border-l-[hsl(var(--travel-blue))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-blue)/0.05)] to-background dark:from-[hsl(var(--travel-blue)/0.12)] dark:to-background',
    hover: 'hover:border-[hsl(var(--travel-blue))] hover:shadow-[0_4px_18px_rgba(0,100,255,0.12)]',
  },
  date: {
    accent: 'border-l-[hsl(var(--travel-yellow))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-yellow)/0.05)] to-background dark:from-[hsl(var(--travel-yellow)/0.12)] dark:to-background',
    hover:
      'hover:border-[hsl(var(--travel-yellow))] hover:shadow-[0_4px_18px_rgba(255,200,0,0.12)]',
  },
  activity: {
    accent: 'border-l-[hsl(var(--travel-mint))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-mint)/0.05)] to-background dark:from-[hsl(var(--travel-mint)/0.12)] dark:to-background',
    hover: 'hover:border-[hsl(var(--travel-mint))] hover:shadow-[0_4px_18px_rgba(0,200,100,0.12)]',
  },
  budget: {
    accent: 'border-l-[hsl(var(--travel-peach))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-peach)/0.05)] to-background dark:from-[hsl(var(--travel-peach)/0.12)] dark:to-background',
    hover:
      'hover:border-[hsl(var(--travel-peach))] hover:shadow-[0_4px_18px_rgba(255,150,50,0.12)]',
  },
  other: {
    accent: 'border-l-[hsl(var(--travel-purple))]',
    bg: 'bg-gradient-to-br from-[hsl(var(--travel-purple)/0.05)] to-background dark:from-[hsl(var(--travel-purple)/0.12)] dark:to-background',
    hover:
      'hover:border-[hsl(var(--travel-purple))] hover:shadow-[0_4px_18px_rgba(150,50,255,0.12)]',
  },
};

const CommentsSection = ({ idea, commentCount }: { idea: GroupIdea; commentCount: number }) => {
  return (
    <div className="idea-card-comments mt-2">
      {/* More subtle, Apple-like comments indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground/80 transition-colors">
        <div className="flex items-center space-x-1.5">
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          {commentCount > 0 ? (
            <span className="text-xs font-medium">{commentCount}</span>
          ) : (
            <span className="text-xs">Add comment</span>
          )}
        </div>

        {idea.updated_at && (
          <div className="text-xs text-muted-foreground/70">
            {formatTimeAgo(new Date(idea.updated_at))}
          </div>
        )}
      </div>
    </div>
  );
};

const IdeaCard = React.memo(function IdeaCard({
  idea,
  onDelete,
  onEdit,
  selected = false,
  onSelect,
  selectedIdeasCount = 0,
  position = { columnId: 'activity', index: 0 },
  onPositionChange = () => {},
  userId = '',
  isAuthenticated = false,
  groupId = '',
}: IdeaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<{ emoji: string; users: string[] }[]>([]); // TODO: wire to backend
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
      hover: colorSet.hover,
    };
  };

  // Get emoji for each idea type
  function getEmoji(type: string): string {
    switch (type) {
      case 'destination':
        return '📍';
      case 'date':
        return '📅';
      case 'activity':
        return '🏄‍♂️';
      case 'budget':
        return '💰';
      case 'question':
        return '❓';
      case 'note':
        return '📝';
      case 'place':
        return '🏙️';
      default:
        return '💭';
    }
  }

  // Add reaction handler
  const onAddReaction = (emoji: string) => {
    setReactions((prev) => {
      const idx = prev.findIndex((r) => r.emoji === emoji);
      if (idx > -1) {
        const users = prev[idx].users.includes(userId)
          ? prev[idx].users.filter((u) => u !== userId)
          : [...prev[idx].users, userId];
        return [...prev.slice(0, idx), { emoji, users }, ...prev.slice(idx + 1)];
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
          'idea-card relative border border-border/50 dark:border-border/30 shadow-sm backdrop-blur-sm',
          'rounded-xl p-3 min-h-[90px] transition-all duration-300',
          'cursor-grab active:cursor-grabbing overflow-visible',
          cardStyle.bg,
          cardStyle.accent,
          cardStyle.hover,
          'border-l-4',
          selected
            ? 'ring-2 ring-[hsl(var(--travel-blue))] dark:ring-[hsl(var(--travel-blue))/0.7]'
            : '',
          isHovered ? 'shadow-md scale-[1.02] translate-y-[-2px]' : ''
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0 pb-0 h-full flex flex-col">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className={cn('font-medium text-sm leading-snug break-words')}>
                {getEmoji(idea.type)} {idea.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors duration-200"
                  >
                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="min-w-[140px] p-1">
                  <DropdownMenuItem
                    onSelect={onEdit}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={onDelete}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md text-destructive dark:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Idea Description */}
          {idea.description && (
            <div className="text-sm text-muted-foreground mt-1 mb-2">{idea.description}</div>
          )}

          {/* Use our new component */}
          <div className="mt-auto">
            <CommentsSection idea={idea} commentCount={idea.comment_count || 0} />
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
            <div className="pt-1.5">
              <IdeaComments
                ideaId={idea.id}
                groupId={groupId}
                userId={userId}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default IdeaCard;
