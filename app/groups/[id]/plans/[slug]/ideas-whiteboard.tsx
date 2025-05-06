'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import IdeaCard from './idea-card';
import { AddIdeaModal } from './add-idea-modal';
import { Button } from '@/components/ui/button';
import { Plus, Users, Sparkles, ChevronRight, MapPin, Activity, DollarSign, MessageCircle, CalendarDays, Info } from 'lucide-react';
import { useIdeaStore, GroupIdea, ColumnId, IdeaPosition } from './store/idea-store';
import { IdeasPresenceContext, useIdeasPresence } from './context/ideas-presence-context';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { ReadyForVotingModal } from './ready-for-voting-modal';
import { useAuth } from '@/components/auth-provider';
import AddIdeaInput from './add-idea-input';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Logo } from '@/components/logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapboxDestinationInput } from '@/app/components/MapboxDestinationInput';
import KeyboardShortcutsBar, { KeyboardShortcutsShowButton } from '@/components/KeyboardShortcutsBar';
import { IdeasBoardHelpDialog } from './components/ideas-board-help-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { CollaboratorList } from './components/collaborator-list';
import { toast } from '@/components/ui/use-toast';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { trackEvent, EVENT_CATEGORY, EVENT_NAME, useAnalytics } from '@/lib/analytics';
import { useLayoutMode } from '@/app/context/layout-mode-context';

// Define column structure
const COLUMNS = [
  { id: 'destination', label: 'Destination', icon: <MapPin className="h-4 w-4" />, emoji: '📍' },
  { id: 'date', label: 'Date', icon: <CalendarDays className="h-4 w-4" />, emoji: '📅' },
  { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" />, emoji: '🏄‍♂️' },
  { id: 'budget', label: 'Budget', icon: <DollarSign className="h-4 w-4" />, emoji: '💰' },
  { id: 'other', label: 'Other', icon: <MessageCircle className="h-4 w-4" />, emoji: '💭' }
];

interface IdeasWhiteboardProps {
  groupId: string;
  groupName: string;
  isAuthenticated: boolean;
}

// Helper to get initials from profile or user
function getProfileInitials(profile: any, user: any): string {
  if (profile?.name) {
    return profile.name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  return user?.email?.charAt(0).toUpperCase() || 'U';
}

export default function IdeasWhiteboard({ groupId, groupName, isAuthenticated }: IdeasWhiteboardProps) {
  const { user } = useAuth();
  const params = useParams();
  const resolvedGroupId = groupId || params?.id as string;
  const planSlug = params?.slug as string;
  const { toast } = useToast();
  
  // Get layout mode context to handle fullscreen
  const { setFullscreen } = useLayoutMode();
  
  // Store user ID in localStorage for comments system
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      localStorage.setItem('user_id', user.id);
    }
  }, [user?.id]);
  
  // Set fullscreen mode when component mounts
  useEffect(() => {
    // Enable fullscreen mode (removes navbar)
    setFullscreen(true);
    
    // Cleanup: disable fullscreen mode when component unmounts
    return () => {
      setFullscreen(false);
    };
  }, [setFullscreen]);
  
  // Ideas store
  const { 
    ideas, 
    setIdeas, 
    loading, 
    setLoading, 
    error,
    addIdea: addStoreIdea,
    updateIdea: updateStoreIdea,
    removeIdea: deleteStoreIdea
  } = useIdeaStore();
  
  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [isReadyForVoting, setIsReadyForVoting] = useState(false);
  const [draggedIdea, setDraggedIdea] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [inlineEditColumn, setInlineEditColumn] = useState<string | null>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePickerDialog, setShowDatePickerDialog] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  const [dateDialogValue, setDateDialogValue] = useState<Date | undefined>(undefined);
  const [budgetDialogValue, setBudgetDialogValue] = useState<string>('');
  const [budgetCustomValue, setBudgetCustomValue] = useState<string>('');
  const [openMobileColumn, setOpenMobileColumn] = useState<string | null>(null);
  const [highlightedBudgetIdx, setHighlightedBudgetIdx] = useState(0);
  const [showMapboxInput, setShowMapboxInput] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showMapboxDialog, setShowMapboxDialog] = useState(false);
  const [showShortcutsBar, setShowShortcutsBar] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Refs
  const boardRef = useRef<HTMLDivElement>(null);
  const inlineEditInputRef = useRef<HTMLInputElement>(null);
  const inlineEditInputRefWrapper = useRef<HTMLDivElement>(null);
  const budgetInputRef = useRef<HTMLInputElement>(null);
  const addButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // Presence context
  const presenceContext = useIdeasPresence(resolvedGroupId);
  const activeUsers = presenceContext.activeUsers || [];
  const currentUserId = user?.id || '';
  
  // Filter out duplicate users and get unique active users
  const uniqueActiveUsers = React.useMemo(() => {
    const userMap = new Map();
    activeUsers.forEach(user => {
      if (user && user.id) {
        userMap.set(user.id, user);
      }
    });
    return Array.from(userMap.values());
  }, [activeUsers]);

  // Group ideas by column
  const ideasByColumn = React.useMemo(() => {
    const grouped: Record<ColumnId, any[]> = {
      destination: [],
      date: [],
      activity: [],
      budget: [],
      other: []
    };
    
    ideas.forEach(idea => {
      const columnId = idea.position && 'columnId' in idea.position 
        ? idea.position.columnId as ColumnId 
        : idea.type;
      
      if (grouped[columnId]) {
        grouped[columnId].push(idea);
      } else {
        grouped.other.push(idea);
      }
    });
    
    // Sort ideas by their index within each column
    Object.keys(grouped).forEach(columnId => {
      grouped[columnId as ColumnId].sort((a, b) => {
        const aIndex = a.position && 'index' in a.position ? a.position.index : 0;
        const bIndex = b.position && 'index' in b.position ? b.position.index : 0;
        return aIndex - bIndex;
      });
    });
    
    return grouped;
  }, [ideas]);

  // Focus input when showing inline edit
  useEffect(() => {
    if (inlineEditColumn && inlineEditInputRef.current) {
      inlineEditInputRef.current.focus();
    }
  }, [inlineEditColumn]);

  // Fetch ideas from database
  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      try {
        const { data, error: fetchError } = await getBrowserClient()
          .from('group_ideas')
          .select('*')
          .eq('group_id', resolvedGroupId);
          
        if (fetchError) throw fetchError;
        
        // Normalize position data to column-based format
        const processedIdeas = (data || []).map(idea => {
          let position: IdeaPosition;
          
          // Set position to column-based format
          if (!idea.position) {
            position = {
              columnId: idea.type as ColumnId,
              index: 0
            };
          } else if ('x' in idea.position) {
            // Convert old x,y position to columnId,index
            position = {
              columnId: idea.type as ColumnId, 
              index: 0
            };
          } else {
            position = idea.position as IdeaPosition;
          }
          
          return { ...idea, position };
        });
        
        setIdeas(processedIdeas);
      } catch (err) {
        console.error('Error fetching ideas:', err);
        toast({
          title: 'Error loading ideas',
          description: 'There was a problem loading the ideas board.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (resolvedGroupId) {
      fetchIdeas();
    }
  }, [resolvedGroupId, setIdeas, setLoading, toast]);

  // Save position updates
  const savePositionUpdates = useCallback(
    debounce(async (updates: { id: string; position: IdeaPosition }[]) => {
      if (updates.length === 0) return;
      
      try {
        const { error: updateError } = await getBrowserClient()
          .from('group_ideas')
          .upsert(
            updates.map(u => ({ 
              id: u.id, 
              position: u.position, 
              updated_at: new Date().toISOString() 
            })),
            { onConflict: 'id' }
          );
          
        if (updateError) throw updateError;
      } catch (err) {
        console.error('Error saving position updates:', err);
        toast({
          title: 'Error Saving Layout',
          description: 'Could not save the new idea positions.',
          variant: 'destructive'
        });
      }
    }, 1000),
    [toast]
  );
  
  // Update idea positions after dragging
  const updateIdeaPositions = useCallback((columnId: ColumnId) => {
    const columnIdeas = ideasByColumn[columnId];
    const updates = columnIdeas.map((idea, index) => ({
      id: idea.id,
      position: { columnId, index } as IdeaPosition
    }));
    // Save to database
    savePositionUpdates(updates);
  }, [ideasByColumn, savePositionUpdates]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = getBrowserClient()
      .channel(`idea-changes-${resolvedGroupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_ideas', filter: `group_id=eq.${resolvedGroupId}` },
        (payload) => {
          console.log('Realtime event:', payload);
          switch (payload.eventType) {
            case 'INSERT':
              // Cast payload.new to GroupIdea and ensure position is correct
              const insertedIdea = payload.new as any; // Cast to any temporarily
              const position: IdeaPosition = insertedIdea.position && typeof insertedIdea.position === 'object' && 'columnId' in insertedIdea.position 
                ? insertedIdea.position 
                : { columnId: insertedIdea.type as ColumnId, index: 0 };
                
              const newIdeaForStore: GroupIdea = {
                ...insertedIdea, // Spread the validated/casted data
                id: insertedIdea.id, // Ensure required fields are present
                group_id: insertedIdea.group_id,
                created_by: insertedIdea.created_by,
                type: insertedIdea.type,
                // Add other required fields explicitly if necessary, or ensure they exist on insertedIdea
                position: position,
              };
              addStoreIdea(newIdeaForStore);
              break;
            case 'UPDATE':
              // Ensure payload.new conforms to GroupIdea or partial update type
              const updatedIdeaData = payload.new as Partial<GroupIdea>; 
              updateStoreIdea(payload.old.id, updatedIdeaData);
              break;
            case 'DELETE':
              // Ensure payload.old has an id
              if (payload.old && payload.old.id) {
                 deleteStoreIdea(payload.old.id as string);
              } else {
                 console.warn('Realtime DELETE event missing old record id', payload);
              }
              break;
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime channel subscribed');
        }
        if (err) {
          console.error('Realtime subscription error:', err);
          toast({ 
            title: 'Realtime Error', 
            description: 'Could not connect for live updates.', 
            variant: 'destructive' 
          });
        }
      });
      
    return () => {
      channel.unsubscribe();
    };
  }, [resolvedGroupId, addStoreIdea, updateStoreIdea, deleteStoreIdea, toast]);

  // Handle idea submission (add/edit)
  const handleIdeaSubmit = async (ideaData: any) => {
    try {
      if (editingIdea) {
        // Update existing idea
        const typeChanged = ideaData.type !== editingIdea.type;
        const updates = {
          ...ideaData,
          updated_at: new Date().toISOString()
        };
        
        // Update position if type changes
        if (typeChanged) {
          updates.position = {
            columnId: ideaData.type as ColumnId,
            index: ideasByColumn[ideaData.type as ColumnId].length
          };
        }
        
        const { data, error: updateError } = await getBrowserClient()
          .from('group_ideas')
          .update(updates)
          .eq('id', editingIdea.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        
        // Update in store
        updateStoreIdea(editingIdea.id, data);
        
        // Re-index columns if needed
        if (typeChanged) {
          updateIdeaPositions(ideaData.type as ColumnId);
          updateIdeaPositions(editingIdea.type as ColumnId);
        }
        
        // Track idea edit event
        trackEvent(
          EVENT_NAME.IDEA_EDITED,
          EVENT_CATEGORY.IDEA_BOARD,
          {
            idea_id: editingIdea.id,
            idea_type: ideaData.type,
            group_id: resolvedGroupId,
            type_changed: typeChanged
          }
        );
        
        toast({ title: 'Idea updated!', description: 'Your changes have been saved.' });
      } else {
        // Add new idea
        if (!ideaData.title || !ideaData.type) {
          throw new Error('Title and type are required');
        }
        
        const columnId = ideaData.type as ColumnId;
        const position: IdeaPosition = { 
          columnId, 
          index: ideasByColumn[columnId].length 
        };
        
        const { data, error: insertError } = await getBrowserClient()
          .from('group_ideas')
          .insert([{
            ...ideaData,
            group_id: resolvedGroupId,
            position,
            created_by: user?.id || null
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        // Track idea creation event
        trackEvent(
          EVENT_NAME.IDEA_CREATED,
          EVENT_CATEGORY.IDEA_BOARD,
          {
            idea_id: data.id,
            idea_type: data.type,
            group_id: resolvedGroupId,
            title_length: data.title.length,
            has_description: !!data.description
          }
        );
        
        toast({ title: 'Idea added!', description: 'Your idea has been added to the board.' });
      }
    } catch (err) {
      console.error('Error handling idea submit:', err);
      const message = err instanceof Error ? err.message : 'There was a problem saving your idea.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setEditingIdea(null);
      setShowAddModal(false);
    }
  };

  // Handle idea deletion
  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const ideaToDelete = ideas.find(i => i.id === ideaId);
      if (!ideaToDelete) return;
      
      const columnId = ideaToDelete.position && 'columnId' in ideaToDelete.position 
        ? ideaToDelete.position.columnId as ColumnId 
        : ideaToDelete.type;
      
      await getBrowserClient()
        .from('group_ideas')
        .delete()
        .eq('id', ideaId);
        
      // Remove from store
      deleteStoreIdea(ideaId);
      
      // Re-index the column
      updateIdeaPositions(columnId);
      
      // Track idea deletion event
      trackEvent(
        EVENT_NAME.IDEA_DELETED,
        EVENT_CATEGORY.IDEA_BOARD,
        {
          idea_id: ideaId,
          idea_type: ideaToDelete.type,
          group_id: resolvedGroupId,
          column_id: columnId
        }
      );
      
      toast({ title: 'Idea deleted' });
    } catch (err) {
      console.error('Error deleting idea:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete the idea.', 
        variant: 'destructive' 
      });
    }
  };

  // Export board as image
  const handleExportAsImage = async () => {
    if (!boardRef.current) {
      toast({ 
        title: 'Export failed', 
        description: 'Board element not found.', 
        variant: 'destructive' 
      });
      return;
    }
    
    toast({ title: 'Exporting whiteboard...' });
    
    try {
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: '#f7fafc',
        scale: 1.5,
        logging: false,
        useCORS: true
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `withme-ideas-${resolvedGroupId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
      
      toast({ title: 'Export complete' });
    } catch (error) {
      console.error('Error exporting whiteboard:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (idea: any, index: number) => {
    setDraggedIdea(idea.id);
    setDragOverIndex(index);
  };
  
  const handleCardDragOver = (e: React.DragEvent, columnId: ColumnId, index: number) => {
    e.preventDefault();
    setDragOverColumn(columnId);
    setDragOverIndex(index);
  };
  
  const handleDrop = async (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedIdea) return;
    
    const idea = ideas.find(i => i.id === draggedIdea);
    if (!idea) return;
    
    const sourceColumnId = idea.position && 'columnId' in idea.position 
      ? idea.position.columnId as ColumnId 
      : idea.type;
    
    // If dropping in the same column and dragOverIndex is set, reorder
    if (sourceColumnId === columnId && dragOverIndex !== null) {
      const columnIdeas = [...ideasByColumn[columnId]];
      const fromIndex = columnIdeas.findIndex(i => i.id === draggedIdea);
      if (fromIndex === -1) return;
      const [movedIdea] = columnIdeas.splice(fromIndex, 1);
      columnIdeas.splice(dragOverIndex, 0, movedIdea);
      // Update positions
      const updates = columnIdeas.map((idea, idx) => ({
        id: idea.id,
        position: { columnId, index: idx }
      }));
      updates.forEach(update => {
        updateStoreIdea(update.id, { position: update.position } as any);
      });
      updateIdeaPositions(columnId);
      setDraggedIdea(null);
      setDragOverIndex(null);
      return;
    }
    
    // Do nothing if dropping in the same column
    if (sourceColumnId === columnId) {
      setDraggedIdea(null);
      return;
    }
    
    // Update idea's type and position
    const newPosition: IdeaPosition = {
      columnId,
      index: ideasByColumn[columnId].length
    };
    
    // Update in database
    try {
      await getBrowserClient()
        .from('group_ideas')
        .update({
          type: columnId,
          position: newPosition,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedIdea);
        
      // Update in store - use any to bypass strict type checking
      updateStoreIdea(draggedIdea as string, { 
        type: columnId, 
        position: newPosition 
      } as any);
      
      // Re-index both columns
      updateIdeaPositions(columnId);
      updateIdeaPositions(columnId);
      
      toast({ title: 'Idea moved', description: `Moved to ${columnId} column` });
    } catch (err: unknown) {
      console.error('Error moving idea:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to move the idea.', 
        variant: 'destructive' 
      });
    } finally {
      setDraggedIdea(null);
      setDragOverIndex(null);
    }
  };

  // Handle drag end (cleanup)
  const handleDragEnd = () => {
    setDraggedIdea(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  };

  // Handle inline idea submission
  const handleInlineIdeaSubmit = async (columnId: ColumnId) => {
    if (!newIdeaTitle.trim()) {
      setInlineEditColumn(null);
      setNewIdeaTitle('');
      return;
    }

    try {
      const ideaData = {
        title: newIdeaTitle.trim(),
        type: columnId,
        description: columnId === 'date' && selectedDate 
          ? `Date: ${selectedDate.toLocaleDateString()}` 
          : null
      };
      
      const position: IdeaPosition = { 
        columnId, 
        index: ideasByColumn[columnId].length 
      };
      
      const { data, error: insertError } = await getBrowserClient()
        .from('group_ideas')
        .insert([{
          ...ideaData,
          group_id: resolvedGroupId,
          position,
          created_by: user?.id || null
        }])
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      toast({ title: 'Idea added!', description: 'Your idea has been added to the board.' });
    } catch (err) {
      console.error('Error adding idea:', err);
      const message = err instanceof Error ? err.message : 'There was a problem saving your idea.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setInlineEditColumn(null);
      setNewIdeaTitle('');
      setSelectedDate(undefined);
    }
  };

  // Budget options
  const BUDGET_OPTIONS = [
    '$50', '$100', '$200', '$500+', 'Other'
  ];

  useEffect(() => {
    if (!inlineEditColumn) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        inlineEditInputRefWrapper.current &&
        !inlineEditInputRefWrapper.current.contains(event.target as Node)
      ) {
        setInlineEditColumn(null);
        setNewIdeaTitle('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inlineEditColumn]);

  const firstAddButtonRef = useRef<HTMLButtonElement>(null);

  // after user and ideasByColumn are available, but before any useEffect or handler that uses them ...
  const isOwner = typeof user !== 'undefined' && user?.role === 'owner'; // fallback
  const canVote =
    (ideasByColumn.destination?.length ?? 0) > 0 &&
    (ideasByColumn.activity?.length ?? 0) > 0 &&
    (ideasByColumn.budget?.length ?? 0) > 0;

  // ... now the useEffect that uses isOwner and canVote ...
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    function isInputFocused() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
      );
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat || isInputFocused()) return;
      // Esc: close dialogs/inline
      if (e.key === 'Escape') {
        setShowDateDialog(false);
        setShowBudgetDialog(false);
        setShowOtherDialog(false);
        setInlineEditColumn(null);
        return;
      }
      // /: focus first add button
      if (e.key === '/') {
        addButtonRefs.current[0]?.focus();
        e.preventDefault();
        return;
      }
      // D: destination
      if (e.key.toLowerCase() === 'd') {
        setShowMapboxDialog(true);
        return;
      }
      // A: activity
      if (e.key.toLowerCase() === 'a') {
        setInlineEditColumn('activity');
        return;
      }
      // B: budget
      if (e.key.toLowerCase() === 'b') {
        setShowBudgetDialog(true);
        setHighlightedBudgetIdx(0);
        return;
      }
      // T: date
      if (e.key.toLowerCase() === 't') {
        setShowDateDialog(true);
        return;
      }
      // O: other
      if (e.key.toLowerCase() === 'o') {
        setInlineEditColumn('other');
        return;
      }
      // Ctrl+Shift+Enter: Ready for Voting
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        if (!isOwner) return;
        if (canVote) {
          openVotingModal();
        } else {
          toast({ title: 'Cannot start voting', description: 'You need at least one destination, activity, and budget idea to start voting.' });
        }
        e.preventDefault();
        return;
      }
      // Budget dialog navigation
      if (showBudgetDialog) {
        if (e.key === 'ArrowDown') {
          setHighlightedBudgetIdx(i => (i + 1) % BUDGET_OPTIONS.length);
          e.preventDefault();
          return;
        }
        if (e.key === 'ArrowUp') {
          setHighlightedBudgetIdx(i => (i - 1 + BUDGET_OPTIONS.length) % BUDGET_OPTIONS.length);
          e.preventDefault();
          return;
        }
        if (e.key === 'Enter') {
          const selected = BUDGET_OPTIONS[highlightedBudgetIdx];
          if (selected === 'Other') {
            budgetInputRef.current?.focus();
          } else {
            handleBudgetIdeaSubmit(selected);
            setShowBudgetDialog(false);
          }
          e.preventDefault();
          return;
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBudgetDialog, highlightedBudgetIdx, isOwner, canVote]);

  // Use setIsReadyForVoting for the modal
  const openVotingModal = typeof setIsReadyForVoting === 'function' ? () => setIsReadyForVoting(true) : () => {};

  // Budget idea submit handler
  const handleBudgetIdeaSubmit = (value: string) => {
    if (!value) return;
    handleIdeaSubmit({
      type: 'budget',
      title: value,
      description: `Budget: ${value} per person`,
    });
  };

  // Keyboard shortcut for help dialog
  useEffect(() => {
    function isInputFocused() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
      );
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return;
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setShowHelpDialog(true);
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setShowHelpDialog(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const readyForVotingDisabled =
    ideasByColumn.destination.length === 0 ||
    ideasByColumn.date.length === 0 ||
    ideasByColumn.activity.length === 0 ||
    ideasByColumn.budget.length === 0;

  const votingTooltip =
    'Add at least one idea to each column (Destination, Date, Activity, Budget) to start voting.';

  function handleVotingButtonClick(e: React.MouseEvent | React.TouchEvent) {
    if (readyForVotingDisabled) {
      // Detect touch device
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        toast({ title: 'Not ready for voting', description: votingTooltip, variant: 'default' });
        e.preventDefault();
      }
    }
  }

  if (isReadyForVoting) {
    return <ReadyForVotingModal onClose={() => setIsReadyForVoting(false)} groupId={resolvedGroupId} planSlug={planSlug} />;
  }

  // Responsive state for window width (avoid SSR window usage)
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // AvatarGroup with glow and +X others logic
  const maxAvatars = 3;
  const visibleUsers = uniqueActiveUsers.slice(0, maxAvatars);
  const extraCount = uniqueActiveUsers.length - maxAvatars;

  return (
    <>
      <IdeasBoardHelpDialog open={showHelpDialog} onOpenChange={setShowHelpDialog} />
      <IdeasPresenceContext.Provider value={presenceContext}>
        <div className="fixed inset-0 flex flex-col bg-[#f7fafc] overflow-hidden z-10">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 border-b bg-white z-20">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <a href="/groups" className="hover:underline flex items-center gap-1">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7m-9 2v8a2 2 0 002 2h4a2 2 0 002-2v-8m-6 0h6"/></svg>
                  Groups
                </a>
                <span className="mx-1">/</span>
                <span className="font-semibold text-gray-700">{groupName}</span>
              </div>
              {loading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
              {error && <span className="text-sm text-red-500">(Error)</span>}
            </div>
            <div className="flex items-center gap-3">
              {/* Active Users Button */}
              <div className="cursor-pointer" onClick={() => setShowCollaborators(true)}>
                <div className="flex items-center -space-x-2">
                  {visibleUsers.map((user, idx) => (
                    <span key={user.id} className="relative">
                      <span
                        className={`absolute inset-0 rounded-full z-0 ${user.status === 'online' ? 'ring-2 ring-green-400 animate-pulse' : ''}`}
                        aria-hidden="true"
                      ></span>
                      <span className="relative z-10">
                        <AvatarGroup
                          items={[{
                            src: user.profile?.avatar_url,
                            fallback: getProfileInitials(user.profile, user),
                            alt: user.profile?.name || user.email || 'User',
                          }]}
                          max={1}
                          avatarSize="h-8 w-8"
                        />
                      </span>
                    </span>
                  ))}
                  {extraCount > 0 && (
                    <span className="ml-2 text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1 font-medium">
                      +{extraCount} others
                    </span>
                  )}
                </div>
              </div>
              <Dialog open={showCollaborators} onOpenChange={setShowCollaborators}>
                <DialogContent className="max-w-md p-0">
                  <DialogTitle className="sr-only">Collaborators</DialogTitle>
                  <CollaboratorList
                    open={showCollaborators}
                    onClose={() => setShowCollaborators(false)}
                    activeUsers={uniqueActiveUsers}
                    currentUserId={currentUserId}
                  />
                </DialogContent>
              </Dialog>
              {/* Voting Button */}
              <TooltipProvider>
                <Tooltip disableHoverableContent={false}>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold h-10 px-5 rounded-2xl focus:ring-2 focus:ring-[hsl(var(--travel-purple))] transition-all duration-200"
                        onClick={handleVotingButtonClick}
                        disabled={readyForVotingDisabled}
                        aria-disabled={readyForVotingDisabled}
                      >
                        <Sparkles className="h-4 w-4 md:mr-1" />
                        <span className="hidden md:inline">Ready for Voting</span>
                        <ChevronRight className="h-4 w-4 md:ml-1" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {readyForVotingDisabled && (
                    <TooltipContent side="top" align="center">
                      {votingTooltip}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              {/* Export Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-5 rounded-2xl font-medium"
                onClick={handleExportAsImage}
              >
                Export
              </Button>
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>

          {/* Main Content - Columns */}
          <div
            ref={boardRef}
            className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-[#f7fafc] overflow-y-auto"
          >
            {COLUMNS.map((column, idx) => (
              <CollapsibleSection
                key={column.id}
                title={column.label}
                icon={<span className="text-2xl md:text-3xl">{column.emoji}</span>}
                className="flex flex-col h-full max-h-full bg-gray-100 rounded-2xl shadow-sm transition-all duration-200"
                headerAction={ideasByColumn[column.id as ColumnId]?.length || 0}
                defaultOpen={true}
              >
                <div className="flex-1 flex flex-col gap-2 p-2 pt-0">
                  {/* Column Content */}
                  <div className="flex-1 overflow-y-auto pt-0 space-y-2 scrollbar-thin">
                    {ideasByColumn[column.id as ColumnId]?.map((idea, idx) => (
                      <div
                        key={idea.id}
                        draggable
                        onDragStart={() => handleDragStart(idea, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => handleCardDragOver(e, column.id as ColumnId, idx)}
                        className={`cursor-grab ${draggedIdea === idea.id ? 'opacity-50' : ''} ${dragOverIndex === idx && dragOverColumn === column.id ? 'ring-2 ring-blue-300' : ''}`}
                      >
                        <IdeaCard
                          idea={idea}
                          onDelete={() => handleDeleteIdea(idea.id)}
                          onEdit={() => { setEditingIdea(idea); setShowAddModal(true); }}
                          position={{
                            columnId: column.id as ColumnId,
                            index: idea.position && 'index' in idea.position ? idea.position.index : 0
                          }}
                          onPositionChange={() => {}}
                          userId={user?.id || ''}
                          isAuthenticated={isAuthenticated}
                          groupId={resolvedGroupId}
                        />
                      </div>
                    ))}

                    {/* Inline Add Idea Form or Dialog Triggers */}
                    {column.id === 'destination' ? (
                      <>
                        {showMapboxDialog ? (
                          <div className="mt-2">
                            <MapboxDestinationInput
                              onSelect={(place) => {
                                handleIdeaSubmit({
                                  type: 'destination',
                                  title: place.place_name,
                                  description: JSON.stringify(place)
                                });
                                setShowMapboxDialog(false);
                              }}
                              placeholder="Add a destination..."
                            />
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowMapboxDialog(false)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-muted-foreground hover:bg-gray-200 border-dashed border-2 rounded-xl border-blue-200"
                            onClick={() => setShowMapboxDialog(true)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Destination Idea
                          </Button>
                        )}
                      </>
                    ) : column.id === 'date' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-muted-foreground hover:bg-gray-200 border-dashed border-2 rounded-xl border-green-200"
                        onClick={() => setShowDateDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Date Idea
                      </Button>
                    ) : column.id === 'budget' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-muted-foreground hover:bg-gray-200 border-dashed border-2 rounded-xl border-orange-200"
                        onClick={() => setShowBudgetDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Budget Idea
                      </Button>
                    ) : (
                      inlineEditColumn === column.id ? (
                        <div ref={inlineEditInputRefWrapper} className="p-2 bg-white rounded-md shadow" tabIndex={-1}>
                          <Input
                            ref={inlineEditInputRef}
                            type="text"
                            value={newIdeaTitle}
                            onChange={(e) => setNewIdeaTitle(e.target.value)}
                            placeholder={`Add a ${column.label.toLowerCase()}...`}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlineIdeaSubmit(column.id as ColumnId);
                              if (e.key === 'Escape') {
                                setInlineEditColumn(null);
                                setNewIdeaTitle('');
                              }
                            }}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => handleInlineIdeaSubmit(column.id as ColumnId)} className="flex-1">
                              Add Idea
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setInlineEditColumn(null); setNewIdeaTitle(''); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-muted-foreground hover:bg-gray-200 border-dashed border-2 rounded-xl border-purple-200"
                          onClick={() => {
                            setInlineEditColumn(column.id);
                            setNewIdeaTitle('');
                          }}
                          ref={idx === 0 ? firstAddButtonRef : undefined}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add {column.label} Idea
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CollapsibleSection>
            ))}
          </div>

          {/* Modal for editing ideas */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AddIdeaModal
                  onClose={() => { 
                    setShowAddModal(false); 
                    setEditingIdea(null); 
                  }}
                  onSubmit={handleIdeaSubmit}
                  editingIdea={editingIdea}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Dialog */}
          <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Date Idea</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Calendar 
                  mode="single"
                  selected={dateDialogValue}
                  onSelect={setDateDialogValue}
                />
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      if (!dateDialogValue) return;
                      await handleIdeaSubmit({
                        type: 'date',
                        title: format(dateDialogValue, 'yyyy-MM-dd'),
                        description: `Date: ${format(dateDialogValue, 'PPP')}`
                      });
                      setShowDateDialog(false);
                      setDateDialogValue(undefined);
                    }}
                    disabled={!dateDialogValue}
                  >
                    Add Date
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Budget Dialog */}
          <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Idea</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {BUDGET_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt}
                    tabIndex={0}
                    ref={el => { addButtonRefs.current[idx] = el; }}
                    className={`w-full px-4 py-2 rounded-md text-left ${highlightedBudgetIdx === idx ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-white'}`}
                    onClick={() => {
                      if (opt === 'Other') {
                        budgetInputRef.current?.focus();
                      } else {
                        handleBudgetIdeaSubmit(opt);
                        setShowBudgetDialog(false);
                      }
                    }}
                  >
                    {opt}
                  </button>
                ))}
                {highlightedBudgetIdx === BUDGET_OPTIONS.length - 1 && (
                  <input
                    ref={budgetInputRef}
                    type="text"
                    className="mt-2 p-2 border rounded-md"
                    placeholder="Custom budget (per person)"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleBudgetIdeaSubmit(budgetInputRef.current?.value || '');
                        setShowBudgetDialog(false);
                      }
                    }}
                  />
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setShowBudgetDialog(false)} variant="ghost">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Keyboard Shortcuts Bar and Show Button (desktop only) */}
          {(windowWidth === null || windowWidth >= 1024) && (
            showShortcutsBar ? (
              <KeyboardShortcutsBar onHide={() => setShowShortcutsBar(false)} />
            ) : (
              <KeyboardShortcutsShowButton onClick={() => setShowShortcutsBar(true)} />
            )
          )}

          {/* Fixed Logo in bottom right */}
          <Logo className="fixed bottom-4 right-4 z-50" />
        </div>
      </IdeasPresenceContext.Provider>
    </>
  );
} 