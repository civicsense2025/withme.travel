'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from 'lodash';
import IdeaCard from './idea-card';
import { AddIdeaModal } from './add-idea-modal';
import { Button } from '@/components/ui/button';
import { Plus, Users, Sparkles, ChevronRight, MapPin, Activity, DollarSign, MessageCircle, CalendarDays, Info, HelpCircle, ArrowLeft, PlusCircle, Download } from 'lucide-react';
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
import { useTheme } from 'next-themes';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import CreateIdeaDialog from './create-idea-dialog';
import { WelcomeBanner } from './welcome-banner';
import { AnimatedEntrance } from './animated-entrance';
import { Onborda } from 'onborda';
import { ideasWhiteboardTour } from '@/app/lib/onboarding/tours/ideas-whiteboard-tour';
import { useIdeasTourController } from './ideas-tour-controller';
import './styles/column-classes.css';
import Link from 'next/link';
import PlanIdeasClient from './plan-ideas-client';

// Define column structure with smaller emojis
const COLUMNS = [
  { id: 'destination', label: 'Destination', icon: <MapPin className="h-4 w-4" />, emoji: '📍' },
  { id: 'date', label: 'Date', icon: <CalendarDays className="h-4 w-4" />, emoji: '📅' },
  { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" />, emoji: '🏄‍♂️' },
  { id: 'budget', label: 'Budget', icon: <DollarSign className="h-4 w-4" />, emoji: '💰' },
  { id: 'other', label: 'Other', icon: <MessageCircle className="h-4 w-4" />, emoji: '💭' }
];

// Define a Vote icon since it doesn't exist in lucide-react
const Vote = (props: any) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 2L8 7H16L12 2Z" />
      <path d="M5 13H19V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V13Z" />
      <path d="M6 13V7H10" />
      <path d="M18 13V7H14" />
    </svg>
  );
};

interface IdeasWhiteboardProps {
  groupId: string;
  groupName: string;
  isAuthenticated: boolean;
  isGuest?: boolean;
  guestToken?: string | null;
  isAdmin?: boolean;
  isCreator?: boolean;
  planSlug: string;
  planId: string;
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

export default function IdeasWhiteboard({ groupId, groupName, isAuthenticated, isGuest, guestToken, isAdmin, isCreator, planSlug, planId }: IdeasWhiteboardProps) {
  const { user } = useAuth();
  const params = useParams();
  const resolvedGroupId = groupId || params?.id as string;
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simplifiedView, setSimplifiedView] = useState(false);
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);
  const [createIdeaSubmitting, setCreateIdeaSubmitting] = useState(false);
  
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
  const ideasByColumnMemo = React.useMemo(() => {
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

  // Defensive fallback for ideasByColumn
  const safeIdeasByColumn = ideasByColumnMemo ?? {
    destination: [],
    date: [],
    activity: [],
    budget: [],
    other: []
  };

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
    const columnIdeas = safeIdeasByColumn[columnId as ColumnId];
    const updates = columnIdeas.map((idea, index) => ({
      id: idea.id,
      position: { columnId, index } as IdeaPosition
    }));
    // Save to database
    savePositionUpdates(updates);
  }, [safeIdeasByColumn, savePositionUpdates]);

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

  // Update the handleIdeaSubmit method to support guests properly
  const handleIdeaSubmit = async (ideaData: any) => {
    // Show loading state
    setIsSubmitting(true);
    
    try {
      // Create the API payload
      const payload = {
        ...ideaData,
        position: ideaData.position || { columnId: ideaData.type, index: 0 }
      };
      
      // Send the API request
      const response = await fetch(`/api/groups/${groupId}/plans/${planId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create idea');
      }
      
      // Process successful response
      const { idea } = await response.json();
      
      // Update the local state
      addStoreIdea(idea);
      
      // Show success message
      toast({
        title: "Created!",
        description: `Idea "${idea.title}" has been added`,
        variant: "default",
      });
      
      return idea;
    } catch (error) {
      console.error('Error creating idea:', error);
      
      // Show error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create idea",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      // Reset loading state
      setIsSubmitting(false);
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
      updateIdeaPositions(columnId as ColumnId);
      
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

  // Setup dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedIdea(active.id as string);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Get column from over element data
    const overId = over.id as string;
    const overIdData = overId.split('-');
    
    if (overIdData.length >= 2) {
      const columnId = overIdData[0] as ColumnId;
      const index = parseInt(overIdData[1], 10);
      
      setDragOverColumn(columnId);
      setDragOverIndex(index);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDraggedIdea(null);
      setDragOverColumn(null);
      setDragOverIndex(null);
      return;
    }
    
    // Get column and index from over element data
    const overId = over.id as string;
    const activeId = active.id as string;
    const overIdData = overId.split('-');
    
    if (overIdData.length >= 2) {
      const targetColumnId = overIdData[0] as ColumnId;
      const targetIndex = parseInt(overIdData[1], 10);
      
      // Find the dragged idea
      const draggedIdea = ideas.find(idea => idea.id === activeId);
      
      if (draggedIdea) {
        // Safely handle position - if null/undefined, use type field as fallback
        const sourceColumnId = (draggedIdea.position && 'columnId' in draggedIdea.position) 
          ? draggedIdea.position.columnId 
          : draggedIdea.type as ColumnId;
        const sourceIndex = (draggedIdea.position && 'index' in draggedIdea.position) 
          ? draggedIdea.position.index 
          : 0;
        
        // Update the idea's position and type
        try {
          await updateStoreIdea(activeId, {
            position: { columnId: targetColumnId, index: targetIndex },
            type: targetColumnId
          });
          // Save the new position to the database
          savePositionUpdates([
            { id: activeId, position: { columnId: targetColumnId, index: targetIndex } }
          ]);
        } catch (error) {
          console.error('Failed to update idea position:', error);
        }
      }
    }
    
    // Clear drag state
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
        index: safeIdeasByColumn[columnId].length 
      };

      // Add auth details - use guest token if appropriate
      const authDetails = isGuest && guestToken
        ? { created_by: null, created_by_guest_token: guestToken }
        : { created_by: user?.id || null };
      
      const { data, error: insertError } = await getBrowserClient()
        .from('group_ideas')
        .insert([{
          ...ideaData,
          group_id: resolvedGroupId,
          position,
          ...authDetails
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
    (safeIdeasByColumn.destination?.length ?? 0) > 0 &&
    (safeIdeasByColumn.activity?.length ?? 0) > 0 &&
    (safeIdeasByColumn.budget?.length ?? 0) > 0;

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
    safeIdeasByColumn.destination.length === 0 ||
    safeIdeasByColumn.date.length === 0 ||
    safeIdeasByColumn.activity.length === 0 ||
    safeIdeasByColumn.budget.length === 0;

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

  // Calculate progress for ready to vote
  const ideasProgress = useMemo(() => {
    // Need at least one idea in each column to be ready
    const columnsWithIdeas = COLUMNS.filter(
      column => safeIdeasByColumn[column.id as ColumnId]?.length > 0
    ).length;
    
    // Progress as percentage (each column is 20%)
    return (columnsWithIdeas / COLUMNS.length) * 100;
  }, [safeIdeasByColumn]);
  
  const readyForVoting = ideasProgress >= 80; // At least 4 types have ideas

  // Add a handle for column add click
  const handleColumnAddClick = (columnId: ColumnId) => {
    setInlineEditColumn(columnId);
    setNewIdeaTitle('');
  };

  // Modify handlePositionChange function if it doesn't exist
  const handlePositionChange = (ideaId: string, newPosition: IdeaPosition) => {
    updateStoreIdea(ideaId, { position: newPosition } as any);
  };

  // Modify handleEditIdea function if it doesn't exist
  const handleEditIdea = (idea: any) => {
    setEditingIdea(idea);
    setShowAddModal(true);
  };

  // Add state for tour
  const [showTour, setShowTour] = useState(false);
  
  // Start tour handler
  const handleStartTour = useCallback(() => {
    setShowTour(true);
  }, []);

  const { showOnborda, handleCloseTour } = useIdeasTourController(isGuest);

  // Fix keyboard shortcuts by adding a useEffect that listens for keypresses
  useEffect(() => {
    // Function to handle keyboard shortcuts
    function handleKeyboardShortcuts(e: KeyboardEvent) {
      // Ignore shortcuts if an input is focused
      if (document.activeElement instanceof HTMLInputElement || 
          document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Check for key shortcuts for columns
      switch (e.key.toUpperCase()) {
        case 'D':
          handleColumnAddClick('destination');
          break;
        case 'A':
          handleColumnAddClick('activity');
          break;
        case 'B':
          handleColumnAddClick('budget');
          break;
        case 'T':
          handleColumnAddClick('date');
          break;
        case 'O':
          handleColumnAddClick('other');
          break;
        case '/':
          setShowHelpDialog(true);
          break;
        case 'ESCAPE':
          // Close any open dialog or modal
          if (showAddModal) setShowAddModal(false);
          if (showReadyModal) setShowReadyModal(false);
          if (showHelpDialog) setShowHelpDialog(false);
          if (datePickerOpen) setDatePickerOpen(false);
          if (showDatePickerDialog) setShowDatePickerDialog(false);
          if (showDateDialog) setShowDateDialog(false);
          if (showBudgetDialog) setShowBudgetDialog(false);
          if (showOtherDialog) setShowOtherDialog(false);
          if (showMapboxDialog) setShowMapboxDialog(false);
          if (createIdeaOpen) setCreateIdeaOpen(false);
          break;
      }
      
      // Check for ready for voting shortcut (Ctrl+Shift+Enter)
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter' && (isCreator || isAdmin)) {
        // Call the voting function directly - don't need the event parameter
        setShowReadyModal(true);
      }
    }
    
    // Add event listener
    window.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [
    handleColumnAddClick, 
    setShowHelpDialog, 
    showAddModal, 
    showReadyModal, 
    showHelpDialog, 
    datePickerOpen, 
    showDatePickerDialog, 
    showDateDialog, 
    showBudgetDialog, 
    showOtherDialog, 
    showMapboxDialog, 
    createIdeaOpen,
    isCreator,
    isAdmin
  ]);

  // Add FloatingControlBar component at the end of the render function before the closing main tag
  // Create a FloatingControlBar component to make adding ideas faster
  const FloatingControlBar = () => {
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2 z-50">
        <TooltipProvider>
          {COLUMNS.map((column) => (
            <Tooltip key={column.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full hover:bg-${column.id === 'destination' ? 'blue' : column.id === 'date' ? 'yellow' : column.id === 'activity' ? 'green' : column.id === 'budget' ? 'orange' : 'purple'}-100 p-2`}
                  onClick={() => handleColumnAddClick(column.id as ColumnId)}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {column.icon}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Add {column.label} (Press {column.id === 'date' ? 'T' : column.id.charAt(0).toUpperCase()})</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
          
          {/* Help button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
                onClick={() => setShowHelpDialog(true)}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <HelpCircle className="h-5 w-5" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Show Help (Press /)</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Export button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
                onClick={handleExportAsImage}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <Download className="h-5 w-5" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Export as image</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Voting button (if admin or creator) */}
          {(isCreator || isAdmin) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={readyForVoting ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full p-2",
                    readyForVoting 
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={handleVotingButtonClick}
                  disabled={readyForVotingDisabled}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    <Vote className="h-5 w-5" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {readyForVotingDisabled 
                  ? votingTooltip 
                  : "Ready for Voting (Press Ctrl+Shift+Enter)"}
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Collaborators button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
                onClick={() => setShowCollaborators(prev => !prev)}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <Users className="h-5 w-5" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Show Collaborators</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <IdeasPresenceContext.Provider value={presenceContext}>
      <Onborda
        steps={[{ tour: ideasWhiteboardTour.id, steps: ideasWhiteboardTour.steps as any }]}
        showOnborda={showOnborda}
      >
        {simplifiedView ? (
          <PlanIdeasClient
            groupId={resolvedGroupId}
            planId={planId}
            planSlug={planSlug}
            planName={groupName}
            groupName={groupName}
            initialIdeas={ideas}
            isAdmin={isAdmin || false}
            isCreator={isCreator || false}
            userId={user?.id || ''}
            isAuthenticated={isAuthenticated}
            isGuest={isGuest}
            guestToken={guestToken}
          />
        ) : (
          <div className="h-screen w-screen bg-background p-0 m-0 relative overflow-hidden">
            {/* Main editor */}
            <div className="h-full flex flex-col">
              {/* Header */}
              <header className="p-4 lg:px-8 bg-card border-b shadow-sm border-b-card z-10 sticky top-0">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                      <Link href={`/groups/${groupId}`}>
                        <ArrowLeft className="h-6 w-6 text-muted-foreground" />
                      </Link>
                    </Button>
                    
                    <div className="flex items-center space-x-3">
                      {/* Version label - remove help menu icon */}
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full border">
                        Ideas
                      </span>
                    </div>
                  </div>
                  
                  {/* Theme Toggle and Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark');
                      }}
                    >
                      {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSimplifiedView(!simplifiedView)}
                      className="ml-2"
                    >
                      {simplifiedView ? 'Switch to Board View' : 'Switch to Simple View'}
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setCreateIdeaOpen(true)}
                      className="ml-2"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Idea
                    </Button>
                    <CreateIdeaDialog 
                      open={createIdeaOpen}
                      onOpenChange={setCreateIdeaOpen}
                      onSubmit={async (formData) => {
                        setCreateIdeaSubmitting(true);
                        try {
                          await handleIdeaSubmit(formData);
                          setCreateIdeaOpen(false);
                        } catch (error) {
                          console.error('Error creating idea:', error);
                        } finally {
                          setCreateIdeaSubmitting(false);
                        }
                      }}
                      isSubmitting={createIdeaSubmitting}
                    />
                    <Button 
                      onClick={() => setShowReadyModal(true)}
                      disabled={!readyForVoting}
                      className={cn(
                        "ml-2",
                        readyForVoting 
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
                          : ""
                      )}
                    >
                      Ready for Voting
                    </Button>
                  </div>
                </div>

                {/* Group name and subtitle */}
                <div className="mb-2">
                  <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2">{groupName}</h1>
                  <p className="text-base lg:text-xl text-muted-foreground">
                    Generate ideas for your trip with your group members
                  </p>
                </div>

                {/* Progress indicator */}
                <motion.div 
                  className="mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">{Math.round(ideasProgress)}%</span>
                  </div>
                  <Progress value={ideasProgress} />
                </motion.div>

                {/* Main Content - Columns */}
                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-4 mt-6 xl:mt-10 px-4 md:px-8">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                  >
                    {COLUMNS.map((column, index) => (
                      <div
                        key={column.id}
                        data-column-type={column.id}
                        className={`column-container flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 p-4 lg:p-6 xl:p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col ${
                          dragOverColumn === column.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {/* Column header */}
                        <div className="flex items-center justify-between mb-3 xl:mb-6">
                          <h3 className="font-semibold text-sm lg:text-lg xl:text-xl flex items-center gap-2">
                            {column.icon}
                            {column.label}
                            <Badge variant="outline" className="ml-1">
                              {safeIdeasByColumn[column.id as ColumnId]?.length || 0}
                            </Badge>
                          </h3>
                        </div>
                        
                        {/* Ideas list with SortableContext */}
                        <SortableContext
                          items={safeIdeasByColumn[column.id as ColumnId]?.map(idea => idea.id) || []}
                          strategy={verticalListSortingStrategy}
                        >
                          <div
                            className={cn(
                              "flex flex-col gap-4 p-3 rounded-lg min-h-[200px]",
                              dragOverColumn === column.id ? "bg-blue-50 dark:bg-blue-950/30" : "bg-gray-100/50 dark:bg-gray-900/20"
                            )}
                          >
                            {safeIdeasByColumn[column.id as ColumnId]?.map((idea, idx) => (
                              <div key={idea.id} id={`${column.id}-${idx}`}>
                                <SortableIdeaCard
                                  idea={idea}
                                  onDelete={() => handleDeleteIdea(idea.id)}
                                  onEdit={() => handleEditIdea(idea)}
                                  position={idea.position}
                                  onPositionChange={(newPosition) => handlePositionChange(idea.id, newPosition)}
                                  userId={user?.id || ''}
                                  isAuthenticated={isAuthenticated}
                                  groupId={resolvedGroupId}
                                />
                              </div>
                            ))}
                            
                            {/* Inline add input */}
                            {inlineEditColumn === column.id && (
                              <div
                                ref={inlineEditInputRefWrapper}
                                className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border"
                              >
                                <Input
                                  ref={inlineEditInputRef}
                                  value={newIdeaTitle}
                                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineIdeaSubmit(column.id as ColumnId);
                                    }
                                  }}
                                  placeholder={`Add ${column.label.toLowerCase()}`}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        </SortableContext>

                        {/* Update add idea button to add data-action for tour targeting */}
                        <div className="mt-auto pt-2">
                          <Button
                            data-action="add-idea"
                            ref={(el) => {
                              if (addButtonRefs.current) {
                                addButtonRefs.current[index] = el;
                              }
                            }}
                            onClick={() => handleColumnAddClick(column.id as ColumnId)}
                            variant="outline"
                            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-800 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-transparent dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add {column.label}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </DndContext>
                </div>
              </header>
            </div>

            {/* All your modal components */}
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

            {/* Other modals and dialogs... */}
            {/* ... keep all your other existing modal components here ... */}

            {/* Add a guest notification banner at the top of the UI for guests */}
            {isGuest && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 mb-4 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You're viewing this as a guest. <a href="/signup" className="underline font-medium">Sign up</a> to create an account and keep track of your ideas.
                  </p>
                </div>
              </div>
            )}

            {/* Floating control bar */}
            <FloatingControlBar />
          </div>
        )}
      </Onborda>
    </IdeasPresenceContext.Provider>
  );
}

// Fix the SortableIdeaCard component with proper TypeScript
const SortableIdeaCard = ({ 
  idea, 
  onDelete, 
  onEdit, 
  position, 
  onPositionChange, 
  userId, 
  isAuthenticated, 
  groupId 
}: {
  idea: GroupIdea;
  onDelete: () => void;
  onEdit: () => void;
  position: IdeaPosition;
  onPositionChange: (position: IdeaPosition) => void;
  userId: string;
  isAuthenticated: boolean;
  groupId: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: idea.id });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IdeaCard
        idea={idea}
        onDelete={onDelete}
        onEdit={onEdit}
        position={position}
        onPositionChange={onPositionChange}
        userId={userId}
        isAuthenticated={isAuthenticated}
        groupId={groupId}
      />
    </div>
  );
};