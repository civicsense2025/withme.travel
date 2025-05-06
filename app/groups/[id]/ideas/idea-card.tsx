'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pencil, MessageCircle, Smile, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { GroupIdea, IdeaPosition } from './store/idea-store';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { EmojiPicker } from 'frimousse';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import IdeaComments from './components/idea-comments';
import { formatDateRange } from './utils/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

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
    <div className="idea-card-container flex flex-col">
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
              
              {/* Add reaction button */}
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
                <PopoverContent className="p-4 rounded-2xl shadow-lg bg-white/95 border border-gray-100 min-w-[220px] max-w-xs">
                  <EmojiPicker.Root>
                    <EmojiPicker.Search className="mb-1 rounded-md bg-gray-100 px-3 py-2 text-base border border-input focus:outline-none focus:ring-2 focus:ring-[hsl(var(--travel-purple))]" />
                    <EmojiPicker.Viewport className="max-h-40 overflow-y-auto">
                      <EmojiPicker.Loading className="text-gray-400 text-xs"><Skeleton className="w-full h-6" /></EmojiPicker.Loading>
                      <EmojiPicker.Empty className="text-gray-400 text-xs">No emoji found.</EmojiPicker.Empty>
                      <EmojiPicker.List
                        className="select-none pb-1 grid grid-cols-8 gap-2"
                        components={{
                          Emoji: ({ emoji, ...props }) => (
                            <button
                              {...props}
                              className="flex size-8 items-center justify-center rounded-md text-xl hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-[hsl(var(--travel-purple))]"
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
              
              {/* Link icon button - moved to footer next to emoji */}
              <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    aria-label="Add link"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4 rounded-2xl shadow-lg bg-white/95 border border-gray-100 w-80">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="link-input" className="text-xs font-medium">Attach a link</label>
                    <Input
                      id="link-input"
                      type="url"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      placeholder="https://example.com"
                      className="text-base"
                    />
                    <Button
                      className="mt-2 px-3 py-2 bg-[hsl(var(--travel-purple))] text-purple-900 rounded-2xl disabled:opacity-50 hover:bg-purple-300 focus:ring-2 focus:ring-[hsl(var(--travel-purple))] h-10"
                      disabled={!isValidUrl(linkInput) || linkLoading}
                      onClick={async () => {
                        if (isValidUrl(linkInput)) await fetchLinkMeta(linkInput);
                      }}
                    >
                      {linkLoading ? 'Fetching...' : 'Preview'}
                    </Button>
                    {linkError && <div className="text-xs text-red-500">{linkError}</div>}
                    {linkMeta && (
                      <div className="mt-2 border rounded p-2 flex gap-2 items-center bg-gray-50">
                        {linkMeta.image && <img src={linkMeta.image} alt="" className="w-12 h-12 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs truncate">{linkMeta.title}</div>
                          <div className="text-xs text-gray-500 truncate">{linkMeta.description}</div>
                          <div className="text-xs text-blue-500 truncate">{linkMeta.siteName || linkMeta.url}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        className="flex-1 px-3 py-2 bg-[hsl(var(--travel-purple))] text-purple-900 rounded-2xl disabled:opacity-50 hover:bg-purple-300 focus:ring-2 focus:ring-[hsl(var(--travel-purple))] h-10"
                        disabled={!linkMeta}
                        onClick={() => { setLinkPopoverOpen(false); }}
                      >Save</Button>
                      <Button
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-2xl h-10 hover:bg-gray-300"
                        onClick={() => setLinkPopoverOpen(false)}
                      >Cancel</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Comments button */}
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
      
      {/* Show comments inline when expanded - nested under card with margin and styling */}
      {showComments && (
        <div className="mt-2 mb-4 ml-4 pl-2 border-l-2 border-gray-200 rounded-bl-xl">
          <React.Suspense fallback={<Skeleton className="w-full h-10 rounded-md" />}>
            <IdeaComments 
              ideaId={idea.id} 
              userId={userId}
              isAuthenticated={isAuthenticated}
              groupId={idea.group_id || groupId}
              className="pt-2"
            />
          </React.Suspense>
        </div>
      )}
    </div>
  );
});

export default IdeaCard;