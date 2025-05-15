/**
 * SurveyBuilder Component
 *
 * Main admin UI for building and managing milestone-based surveys.
 * Handles milestones, questions, and live preview in one screen.
 *
 * @module components/research/SurveyBuilder
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';

/**
 * Props for the SurveyBuilder component
 */
export interface SurveyBuilderProps {
  /** Survey ID to load/edit */
  surveyId: string;
}

/**
 * Event type for survey analytics
 */
export type SurveyEventType = 'completion' | 'dropoff' | 'answered' | 'error' | 'other';

/**
 * Represents a tracked survey event
 */
export interface SurveyEvent {
  id: string;
  type: SurveyEventType;
  milestone?: string;
  question?: string;
  user?: string;
  value?: string;
  timestamp: string; // ISO string
}

/**
 * Survey milestone type
 */
export interface SurveyMilestone {
  id: string;
  name: string;
  description?: string;
  order: number;
  questions: SurveyQuestion[];
}

/**
 * Survey question type
 */
export interface SurveyQuestion {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  // For rating questions
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Survey definition type
 */
export interface SurveyDefinition {
  survey_id: string;
  title: string;
  description?: string;
  milestones: SurveyMilestone[];
}

/**
 * LiveEventsPanel displays recent survey events in the builder UI
 */
export function LiveEventsPanel({ events, filter, setFilter }: {
  events: SurveyEvent[];
  filter: SurveyEventType | 'all';
  setFilter: (type: SurveyEventType | 'all') => void;
}) {
  // Emoji badges for event types
  const typeEmoji: Record<SurveyEventType, string> = {
    completion: '🟢',
    dropoff: '⚠️',
    answered: '👀',
    error: '❌',
    other: '🔎',
  };

  // Filter events
  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  return (
    <aside className="w-full md:w-80 md:fixed md:right-0 md:top-0 md:h-full bg-purple-50 dark:bg-gray-900/80 border-l border-purple-200 dark:border-purple-700 p-4 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">Live Events <span>✨</span></h2>
        <Select value={filter} onValueChange={v => setFilter(v as SurveyEventType | 'all')}>
          <SelectTrigger className="w-28 h-8 text-sm">
            <span className="capitalize">{filter === 'all' ? 'All' : filter}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completion">Completion</SelectItem>
            <SelectItem value="dropoff">Drop-off</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-8">No events yet.</div>
        )}
        {filtered.map(event => (
          <Card key={event.id} className="flex items-center gap-3 p-3 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
            <span className="text-xl" aria-label={event.type}>{typeEmoji[event.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs px-2 py-0.5 border-purple-300 dark:border-purple-600 bg-purple-100/60 dark:bg-purple-900/40">
                  {event.type}
                </Badge>
                {event.milestone && (
                  <Badge variant="secondary" className="text-xs bg-pink-100/60 dark:bg-pink-900/40 border-pink-200 dark:border-pink-700">
                    {event.milestone}
                  </Badge>
                )}
                {event.question && (
                  <Badge variant="secondary" className="text-xs bg-blue-100/60 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700">
                    Q: {event.question}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 truncate">
                {event.user && <span className="font-semibold">{event.user}</span>}
                {event.value && <span> answered: <span className="font-mono">{event.value}</span></span>}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(event.timestamp)}</div>
            </div>
          </Card>
        ))}
      </div>
    </aside>
  );
}

/**
 * Helper to format ISO timestamp as relative time (e.g., '2m ago')
 */
function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

/**
 * Sortable milestone card wrapper
 */
function SortableMilestone({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/**
 * Sortable question card wrapper
 */
function SortableQuestion({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

/**
 * SurveyBuilder admin UI (milestone-based)
 */
export function SurveyBuilder({ surveyId }: SurveyBuilderProps) {
  // Live events state
  const [filter, setFilter] = useState<SurveyEventType | 'all'>('all');
  const [events, setEvents] = useState<SurveyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Survey config state
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [surveyLoading, setSurveyLoading] = useState(true);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  // Sensors for drag-and-drop
  const sensors = useSensors(useSensor(PointerSensor));

  // Add state for dialog
  const [addDialogOpen, setAddDialogOpen] = useState<{ open: boolean; milestoneIdx: number | null }>({ open: false, milestoneIdx: null });
  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({ type: 'text', label: '', required: false });
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch events (poll every 15s)
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    const fetchEvents = async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const res = await fetch(`/api/research/surveys/${surveyId}/events`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        if (isMounted) setEvents(data.events || []);
      } catch (err: any) {
        if (isMounted) setEventsError(err.message || 'Error loading events');
      } finally {
        if (isMounted) setEventsLoading(false);
      }
    };
    fetchEvents();
    interval = setInterval(fetchEvents, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [surveyId]);

  // Fetch survey config
  useEffect(() => {
    let isMounted = true;
    const fetchSurvey = async () => {
      setSurveyLoading(true);
      setSurveyError(null);
      try {
        const res = await fetch(`/api/research/surveys/${surveyId}`);
        if (!res.ok) throw new Error('Failed to fetch survey');
        const data = await res.json();
        if (isMounted) setSurvey(data);
      } catch (err: any) {
        if (isMounted) setSurveyError(err.message || 'Error loading survey');
      } finally {
        if (isMounted) setSurveyLoading(false);
      }
    };
    fetchSurvey();
    return () => { isMounted = false; };
  }, [surveyId]);

  // Handlers for milestones/questions
  const handleMilestoneChange = (idx: number, field: keyof SurveyMilestone, value: string) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    milestones[idx] = { ...milestones[idx], [field]: value };
    setSurvey({ ...survey, milestones });
  };
  const handleAddMilestone = () => {
    if (!survey) return;
    const newMilestone: SurveyMilestone = {
      id: crypto.randomUUID(),
      name: 'New Milestone',
      order: survey.milestones.length,
      questions: [],
    };
    setSurvey({ ...survey, milestones: [...survey.milestones, newMilestone] });
  };
  const handleDeleteMilestone = (idx: number) => {
    if (!survey) return;
    const milestones = survey.milestones.filter((_, i) => i !== idx);
    setSurvey({ ...survey, milestones });
  };
  const handleMoveMilestone = (idx: number, dir: -1 | 1) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    if (idx + dir < 0 || idx + dir >= milestones.length) return;
    [milestones[idx], milestones[idx + dir]] = [milestones[idx + dir], milestones[idx]];
    setSurvey({ ...survey, milestones });
  };
  const handleAddQuestion = (milestoneIdx: number) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    const newQuestion: SurveyQuestion = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New Question',
      required: false,
    };
    milestones[milestoneIdx].questions = [...milestones[milestoneIdx].questions, newQuestion];
    setSurvey({ ...survey, milestones });
  };
  const handleDeleteQuestion = (milestoneIdx: number, qIdx: number) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    milestones[milestoneIdx].questions = milestones[milestoneIdx].questions.filter((_, i) => i !== qIdx);
    setSurvey({ ...survey, milestones });
  };
  const handleMoveQuestion = (milestoneIdx: number, qIdx: number, dir: -1 | 1) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    const questions = [...milestones[milestoneIdx].questions];
    if (qIdx + dir < 0 || qIdx + dir >= questions.length) return;
    [questions[qIdx], questions[qIdx + dir]] = [questions[qIdx + dir], questions[qIdx]];
    milestones[milestoneIdx].questions = questions;
    setSurvey({ ...survey, milestones });
  };
  const handleQuestionChange = (milestoneIdx: number, qIdx: number, field: keyof SurveyQuestion, value: any) => {
    if (!survey) return;
    const milestones = [...survey.milestones];
    const questions = [...milestones[milestoneIdx].questions];
    questions[qIdx] = { ...questions[qIdx], [field]: value };
    milestones[milestoneIdx].questions = questions;
    setSurvey({ ...survey, milestones });
  };

  // Drag end handler for milestones
  const handleMilestoneDragEnd = (event: DragEndEvent) => {
    if (!survey) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = survey.milestones.findIndex(m => m.id === active.id);
    const newIdx = survey.milestones.findIndex(m => m.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const newMilestones = arrayMove(survey.milestones, oldIdx, newIdx);
    setSurvey({ ...survey, milestones: newMilestones });
  };

  // Drag end handler for questions (per milestone)
  const handleQuestionDragEnd = (milestoneIdx: number) => (event: DragEndEvent) => {
    if (!survey) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const questions = survey.milestones[milestoneIdx].questions;
    const oldIdx = questions.findIndex(q => q.id === active.id);
    const newIdx = questions.findIndex(q => q.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const newQuestions = arrayMove(questions, oldIdx, newIdx);
    const milestones = [...survey.milestones];
    milestones[milestoneIdx] = { ...milestones[milestoneIdx], questions: newQuestions };
    setSurvey({ ...survey, milestones });
  };

  // Helper: Render question in preview mode
  function renderPreviewQuestion(q: SurveyQuestion, value: any, onChange: (v: any) => void) {
    switch (q.type) {
      case 'text':
        return (
          <div>
            <label className="block font-medium mb-1">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              placeholder={q.placeholder || ''}
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              disabled
            />
          </div>
        );
      case 'single_choice':
        return (
          <div>
            <label className="block font-medium mb-1">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
            {q.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 mb-1">
                <input type="radio" disabled checked={value === opt.value} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'multiple_choice':
        return (
          <div>
            <label className="block font-medium mb-1">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
            {q.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 mb-1">
                <input type="checkbox" disabled checked={Array.isArray(value) && value.includes(opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case 'rating':
        return (
          <div>
            <label className="block font-medium mb-1">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
            <input type="range" min={q.min || 1} max={q.max || 5} step={q.step || 1} value={value || q.min || 1} disabled />
            <span className="ml-2">{value || q.min || 1}</span>
          </div>
        );
      default:
        return <div>Unsupported question type</div>;
    }
  }

  // Helper: Render question editing fields
  function renderQuestionEditFields(q: SurveyQuestion, mIdx: number, qIdx: number) {
    switch (q.type) {
      case 'text':
        return (
          <div className="flex gap-2 mt-2">
            <Input
              className="w-1/2"
              value={q.placeholder || ''}
              onChange={e => handleQuestionChange(mIdx, qIdx, 'placeholder', e.target.value)}
              placeholder="Placeholder"
            />
            {/* Min/Max length (optional) */}
          </div>
        );
      case 'single_choice':
      case 'multiple_choice':
        return (
          <ChoiceOptionsEditor
            options={q.options || []}
            onChange={opts => handleQuestionChange(mIdx, qIdx, 'options', opts)}
          />
        );
      case 'rating':
        return (
          <div className="flex gap-2 mt-2">
            <Input
              className="w-20"
              type="number"
              value={q.min ?? 1}
              onChange={e => handleQuestionChange(mIdx, qIdx, 'min', Number(e.target.value))}
              placeholder="Min"
            />
            <Input
              className="w-20"
              type="number"
              value={q.max ?? 5}
              onChange={e => handleQuestionChange(mIdx, qIdx, 'max', Number(e.target.value))}
              placeholder="Max"
            />
            <Input
              className="w-20"
              type="number"
              value={q.step ?? 1}
              onChange={e => handleQuestionChange(mIdx, qIdx, 'step', Number(e.target.value))}
              placeholder="Step"
            />
          </div>
        );
      default:
        return null;
    }
  }

  /**
   * Editor for choice question options (add, edit, delete, reorder)
   */
  function ChoiceOptionsEditor({ options, onChange }: { options: Array<{ label: string; value: string }>; onChange: (opts: Array<{ label: string; value: string }>) => void }) {
    const [localOptions, setLocalOptions] = useState(options);
    useEffect(() => { setLocalOptions(options); }, [options]);
    const handleAdd = () => {
      setLocalOptions([...localOptions, { label: 'New Option', value: crypto.randomUUID() }]);
    };
    const handleDelete = (idx: number) => {
      setLocalOptions(localOptions.filter((_, i) => i !== idx));
    };
    const handleChange = (idx: number, field: 'label' | 'value', value: string) => {
      const opts = [...localOptions];
      opts[idx] = { ...opts[idx], [field]: value };
      setLocalOptions(opts);
    };
    const handleMove = (idx: number, dir: -1 | 1) => {
      if (idx + dir < 0 || idx + dir >= localOptions.length) return;
      const opts = [...localOptions];
      [opts[idx], opts[idx + dir]] = [opts[idx + dir], opts[idx]];
      setLocalOptions(opts);
    };
    useEffect(() => { onChange(localOptions); }, [localOptions]);
    return (
      <div className="space-y-1 mt-2">
        {localOptions.map((opt, idx) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Input
              className="w-1/2"
              value={opt.label}
              onChange={e => handleChange(idx, 'label', e.target.value)}
              placeholder="Option label"
            />
            <Input
              className="w-1/3"
              value={opt.value}
              onChange={e => handleChange(idx, 'value', e.target.value)}
              placeholder="Value"
            />
            <Button size="icon" variant="ghost" onClick={() => handleMove(idx, -1)} disabled={idx === 0}>↑</Button>
            <Button size="icon" variant="ghost" onClick={() => handleMove(idx, 1)} disabled={idx === localOptions.length - 1}>↓</Button>
            <Button size="icon" variant="destructive" onClick={() => handleDelete(idx)}>✕</Button>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={handleAdd}>+ Add Option</Button>
      </div>
    );
  }

  // Save handler
  const handleSave = async () => {
    if (!survey) return;
    setSaving(true);
    setSaveError(null);
    toast({ title: 'Saving...', description: 'Saving survey changes...', duration: 2000 });
    const prevSurvey = { ...survey };
    try {
      const res = await fetch(`/api/research/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: survey.milestones }),
      });
      if (!res.ok) throw new Error('Failed to save survey');
      toast({ title: 'Saved!', description: 'Survey changes saved successfully.', duration: 3000 });
    } catch (err: any) {
      setSaveError(err.message || 'Error saving survey');
      setSurvey(prevSurvey); // revert
      toast({ title: 'Error', description: err.message || 'Error saving survey', duration: 4000, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = (milestoneIdx: number) => {
    setNewQuestion({ type: 'text', label: '', required: false });
    setAddDialogOpen({ open: true, milestoneIdx });
    setAddError(null);
  };
  const closeAddDialog = () => setAddDialogOpen({ open: false, milestoneIdx: null });
  const handleAddDialogSubmit = () => {
    if (!newQuestion.type || !newQuestion.label) {
      setAddError('Type and label are required');
      return;
    }
    if (addDialogOpen.milestoneIdx === null || !survey) return;
    const milestones = [...survey.milestones];
    const question: SurveyQuestion = {
      id: crypto.randomUUID(),
      type: newQuestion.type,
      label: newQuestion.label,
      required: !!newQuestion.required,
      options: newQuestion.type === 'single_choice' || newQuestion.type === 'multiple_choice' ? (newQuestion.options || []) : undefined,
      placeholder: newQuestion.placeholder,
      min: newQuestion.min,
      max: newQuestion.max,
      step: newQuestion.step,
    };
    milestones[addDialogOpen.milestoneIdx].questions = [...milestones[addDialogOpen.milestoneIdx].questions, question];
    setSurvey({ ...survey, milestones });
    closeAddDialog();
  };

  // UI
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Survey Builder (Milestone Mode)</h1>
        <p className="mb-6 text-gray-600">Survey ID: <span className="font-mono">{surveyId}</span></p>
        {surveyLoading ? (
          <div className="flex items-center gap-2 text-purple-600"><Loader2 className="animate-spin" /> Loading survey...</div>
        ) : surveyError ? (
          <div className="text-red-500">{surveyError}</div>
        ) : survey ? (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Button onClick={handleAddMilestone} variant="secondary">+ Add Milestone</Button>
              <Button onClick={handleSave} disabled={saving} variant="default">{saving ? 'Saving...' : 'Save'}</Button>
              <Button onClick={() => setPreview(p => !p)} variant="outline">{preview ? 'Edit' : 'Preview'}</Button>
              {saveError && <span className="text-red-500 ml-4">{saveError}</span>}
            </div>
            <div className="space-y-8">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMilestoneDragEnd}>
                <SortableContext items={survey.milestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  {survey.milestones.map((milestone, mIdx) => (
                    <SortableMilestone key={milestone.id} id={milestone.id}>
                      <Card className="p-6 bg-pink-50 dark:bg-gray-900/60 border-pink-200 dark:border-pink-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            className="font-bold text-lg flex-1"
                            value={milestone.name}
                            onChange={e => handleMilestoneChange(mIdx, 'name', e.target.value)}
                            placeholder="Milestone name"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleMoveMilestone(mIdx, -1)} disabled={mIdx === 0} aria-label="Move up">↑</Button>
                          <Button size="icon" variant="ghost" onClick={() => handleMoveMilestone(mIdx, 1)} disabled={mIdx === survey.milestones.length - 1} aria-label="Move down">↓</Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteMilestone(mIdx)} aria-label="Delete milestone">✕</Button>
                        </div>
                        <Input
                          className="mb-4"
                          value={milestone.description || ''}
                          onChange={e => handleMilestoneChange(mIdx, 'description', e.target.value)}
                          placeholder="Milestone description (optional)"
                        />
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold">Questions</span>
                          <Button size="sm" variant="secondary" onClick={() => openAddDialog(mIdx)}>+ Add Question</Button>
                        </div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd(mIdx)}>
                          <SortableContext items={milestone.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                            {milestone.questions.map((q, qIdx) => (
                              <SortableQuestion key={q.id} id={q.id}>
                                <Card className="p-3 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 border-0 shadow-sm">
                                  <Input
                                    className="flex-1"
                                    value={q.label}
                                    onChange={e => handleQuestionChange(mIdx, qIdx, 'label', e.target.value)}
                                    placeholder="Question text"
                                  />
                                  <Select value={q.type} onValueChange={v => handleQuestionChange(mIdx, qIdx, 'type', v)}>
                                    <SelectTrigger className="w-32 h-8 text-sm"><span className="capitalize">{q.type}</span></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="single_choice">Single Choice</SelectItem>
                                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                      <SelectItem value="rating">Rating</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <label className="flex items-center gap-1 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={q.required}
                                      onChange={e => handleQuestionChange(mIdx, qIdx, 'required', e.target.checked)}
                                    />
                                    Required
                                  </label>
                                  <Button size="icon" variant="ghost" onClick={() => handleMoveQuestion(mIdx, qIdx, -1)} disabled={qIdx === 0} aria-label="Move up">↑</Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleMoveQuestion(mIdx, qIdx, 1)} disabled={qIdx === milestone.questions.length - 1} aria-label="Move down">↓</Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteQuestion(mIdx, qIdx)} aria-label="Delete question">✕</Button>
                                </Card>
                              </SortableQuestion>
                            ))}
                          </SortableContext>
                        </DndContext>
                      </Card>
                    </SortableMilestone>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {preview ? (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Preview</h2>
                {survey.milestones.length === 0 ? (
                  <div className="text-gray-400">No milestones to preview.</div>
                ) : (
                  <div className="max-w-xl mx-auto">
                    <div className="mb-4 flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewStep(s => Math.max(0, s - 1))} disabled={previewStep === 0}>Previous</Button>
                      <span className="text-sm">Step {previewStep + 1} of {survey.milestones.length}</span>
                      <Button size="sm" variant="ghost" onClick={() => setPreviewStep(s => Math.min(survey.milestones.length - 1, s + 1))} disabled={previewStep === survey.milestones.length - 1}>Next</Button>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">{survey.milestones[previewStep].name}</h3>
                      <div className="text-gray-500 mb-2">{survey.milestones[previewStep].description}</div>
                      {survey.milestones[previewStep].questions.map(q => (
                        <div key={q.id} className="mb-4">
                          {renderPreviewQuestion(q, undefined, () => {})}
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-2 bg-purple-400 transition-all" style={{ width: `${((previewStep + 1) / survey.milestones.length) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl bg-purple-50 dark:bg-gray-900/80 p-8 text-center text-lg text-gray-700 dark:text-gray-200 border border-purple-200 dark:border-purple-700 mt-8">
            Milestone-based survey builder UI coming soon!<br />
            (You'll be able to add milestones, questions, and preview the flow here.)
          </div>
        )}
      </main>
      <aside className="w-full md:w-80 md:fixed md:right-0 md:top-0 md:h-full">
        {eventsLoading ? (
          <div className="flex items-center gap-2 text-purple-600 p-4"><Loader2 className="animate-spin" /> Loading events...</div>
        ) : eventsError ? (
          <div className="text-red-500 p-4">{eventsError}</div>
        ) : (
          <LiveEventsPanel events={events} filter={filter} setFilter={setFilter} />
        )}
      </aside>
      <Dialog open={addDialogOpen.open} onOpenChange={v => { if (!v) closeAddDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="font-semibold">Type</label>
              <span title="survey_questions.type (enum)"><Info className="h-4 w-4 text-blue-500" /></span>
              <Select value={newQuestion.type} onValueChange={v => setNewQuestion(q => ({ ...q, type: v }))}>
                <SelectTrigger className="w-40"><span className="capitalize">{newQuestion.type}</span></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Label</label>
              <span title="survey_questions.label (text)"><Info className="h-4 w-4 text-blue-500" /></span>
              <Input value={newQuestion.label || ''} onChange={e => setNewQuestion(q => ({ ...q, label: e.target.value }))} placeholder="Question text" />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Required</label>
              <span title="survey_questions.required (boolean)"><Info className="h-4 w-4 text-blue-500" /></span>
              <input type="checkbox" checked={!!newQuestion.required} onChange={e => setNewQuestion(q => ({ ...q, required: e.target.checked }))} />
            </div>
            {['single_choice', 'multiple_choice'].includes(newQuestion.type || '') && (
              <div className="flex items-center gap-2">
                <label className="font-semibold">Options</label>
                <span title="survey_questions.options (json)"><Info className="h-4 w-4 text-blue-500" /></span>
                {/* Simple options editor for dialog */}
                <Input
                  value={(newQuestion.options?.map(o => o.label).join(', ') || '')}
                  onChange={e => setNewQuestion(q => ({ ...q, options: e.target.value.split(',').map(l => ({ label: l.trim(), value: crypto.randomUUID() })) }))}
                  placeholder="Comma-separated options"
                />
              </div>
            )}
            {newQuestion.type === 'text' && (
              <div className="flex items-center gap-2">
                <label className="font-semibold">Placeholder</label>
                <span title="survey_questions.placeholder (text)"><Info className="h-4 w-4 text-blue-500" /></span>
                <Input value={newQuestion.placeholder || ''} onChange={e => setNewQuestion(q => ({ ...q, placeholder: e.target.value }))} placeholder="Placeholder text" />
              </div>
            )}
            {newQuestion.type === 'rating' && (
              <div className="flex items-center gap-2">
                <label className="font-semibold">Min</label>
                <span title="survey_questions.min (int)"><Info className="h-4 w-4 text-blue-500" /></span>
                <Input type="number" value={newQuestion.min ?? 1} onChange={e => setNewQuestion(q => ({ ...q, min: Number(e.target.value) }))} className="w-20" />
                <label className="font-semibold">Max</label>
                <span title="survey_questions.max (int)"><Info className="h-4 w-4 text-blue-500" /></span>
                <Input type="number" value={newQuestion.max ?? 5} onChange={e => setNewQuestion(q => ({ ...q, max: Number(e.target.value) }))} className="w-20" />
                <label className="font-semibold">Step</label>
                <span title="survey_questions.step (int)"><Info className="h-4 w-4 text-blue-500" /></span>
                <Input type="number" value={newQuestion.step ?? 1} onChange={e => setNewQuestion(q => ({ ...q, step: Number(e.target.value) }))} className="w-20" />
              </div>
            )}
            {addError && <div className="text-red-500 text-sm">{addError}</div>}
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={closeAddDialog}>Cancel</Button>
            <Button onClick={handleAddDialogSubmit}>Add Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 