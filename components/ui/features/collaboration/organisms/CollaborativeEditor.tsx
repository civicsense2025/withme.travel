/**
 * CollaborativeEditor Component
 * 
 * A collaborative text editor that allows multiple users to edit simultaneously.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PresenceIndicator } from '../molecules/PresenceIndicator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useParams } from 'next/navigation';
import { Loader2, Save, UserCheck } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for CollaborativeEditor
 */
export interface CollaborativeEditorProps {
  /** Initial content for the editor */
  initialContent?: string;
  /** Channel ID for real-time collaboration */
  channelId?: string;
  /** Path to save content to in Supabase */
  savePath?: string;
  /** Table to save content to */
  saveTable?: string;
  /** ID field for the record to update */
  recordId?: string;
  /** Column name to save content to */
  contentColumn?: string;
  /** Additional CSS class names */
  className?: string;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Label text for the editor */
  label?: string;
  /** Placeholder text for the editor */
  placeholder?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CollaborativeEditor provides a text area with real-time collaboration capabilities
 */
export function CollaborativeEditor({
  initialContent = '',
  channelId,
  savePath,
  saveTable = 'notes',
  recordId,
  contentColumn = 'content',
  className = '',
  readOnly = false,
  label = 'Collaborative Notes',
  placeholder = 'Type here to collaborate with others...',
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const params = useParams();
  const supabase = createClient();
  
  // Use channelId from props or derive from route params
  const effectiveChannelId = channelId || 
    (params?.tripId ? `trip-${params.tripId}-notes` : null) ||
    (params?.id ? `group-${params.id}-notes` : null);
  
  // Set up real-time collaboration
  useEffect(() => {
    if (!effectiveChannelId) return;
    
    const channel = supabase.channel(`collab:${effectiveChannelId}`);
    
    // Handle incoming content updates
    channel
      .on('broadcast', { event: 'content-update' }, (payload) => {
        if (payload.payload && typeof payload.payload.content === 'string') {
          setContent(payload.payload.content);
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });
    
    // Fetch initial content if ID and path are provided
    const fetchInitialContent = async () => {
      if (recordId && saveTable) {
        try {
          const { data, error } = await supabase
            .from(saveTable)
            .select(contentColumn)
            .eq('id', recordId)
            .single();
          
          if (error) throw error;
          if (data && data[contentColumn]) {
            setContent(data[contentColumn]);
          }
        } catch (err) {
          console.error('Error fetching initial content:', err);
          setError('Failed to load content');
        }
      }
    };
    
    fetchInitialContent();
    
    return () => {
      channel.unsubscribe();
    };
  }, [effectiveChannelId, supabase, recordId, saveTable, contentColumn]);
  
  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Broadcast changes to other users
    if (effectiveChannelId) {
      supabase
        .channel(`collab:${effectiveChannelId}`)
        .send({
          type: 'broadcast',
          event: 'content-update',
          payload: { content: newContent },
        })
        .catch((err) => {
          console.error('Error broadcasting content update:', err);
        });
    }
  };
  
  // Save content to database
  const saveContent = async () => {
    if (!recordId || !saveTable) {
      setError('Cannot save: missing record ID or table');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from(saveTable)
        .update({ [contentColumn]: content, updated_at: new Date().toISOString() })
        .eq('id', recordId);
      
      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label htmlFor="collaborative-editor">{label}</Label>
        
        {/* Connection status and presence */}
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center text-xs text-primary gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Connected</span>
            </div>
          )}
          
          <PresenceIndicator 
            channelId={effectiveChannelId} 
            labelText="Editing:" 
          />
        </div>
      </div>
      
      {/* Collaborative text area */}
      <Textarea
        id="collaborative-editor"
        value={content}
        onChange={handleContentChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-40 transition-all"
      />
      
      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
      
      {/* Footer with save button and last saved timestamp */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        {lastSaved && (
          <div>
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
        
        {!readOnly && recordId && saveTable && (
          <Button 
            onClick={saveContent} 
            size="sm" 
            disabled={isSaving}
            className="ml-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 