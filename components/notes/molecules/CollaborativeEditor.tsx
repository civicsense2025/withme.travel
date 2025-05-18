/**
 * Collaborative Editor
 *
 * Molecule component for real-time collaborative markdown editing
 *
 * @module notes/molecules
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { NoteEditor } from '../atoms/NoteEditor';
import { NoteContent } from '../atoms/NoteContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, UserIcon, Eye, Edit, Users } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface CollaborativeEditorProps {
  /** ID of the trip to fetch notes for */
  tripId: string;
  /** Initial content (optional) */
  initialContent?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Optional callback when content changes */
  onChange?: (content: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Type for a collaborator in the editor
 */
interface Collaborator {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActive: Date;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CollaborativeEditor({
  tripId,
  initialContent = '',
  readOnly = false,
  onChange,
  className,
}: CollaborativeEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isUserActive, setIsUserActive] = useState(true);
  const userActivityTimeout = useRef<NodeJS.Timeout | null>(null);

  // Use the notes hook
  const { content, isLoading, isSaving, error, updateContent, collaborationSession } =
    useNotes(tripId);

  // Update content when it changes from the hook
  useEffect(() => {
    if (onChange && content) {
      onChange(content);
    }
  }, [content, onChange]);

  // Track user activity
  useEffect(() => {
    const trackActivity = () => {
      setIsUserActive(true);

      // Reset timeout
      if (userActivityTimeout.current) {
        clearTimeout(userActivityTimeout.current);
      }

      // Set inactive after 5 minutes of no activity
      userActivityTimeout.current = setTimeout(
        () => {
          setIsUserActive(false);
        },
        5 * 60 * 1000
      );
    };

    // Set up event listeners for activity tracking
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, trackActivity);
    });

    // Initial activity tracking
    trackActivity();

    // Clean up
    return () => {
      if (userActivityTimeout.current) {
        clearTimeout(userActivityTimeout.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  // Handle content changes and propagate to the API
  const handleContentChange = (newContent: string) => {
    if (readOnly) return;
    updateContent(newContent);
  };

  // Auto-save content periodically
  const handleAutoSave = (newContent: string) => {
    if (readOnly) return;
    updateContent(newContent);
  };

  // Determine if collaboration is available
  const isCollaborationAvailable =
    collaborationSession?.sessionId && collaborationSession?.accessToken && !error;

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-24 w-full mb-2" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Card className={cn('w-full bg-destructive/10', className)}>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Error Loading Notes</h3>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <div className="flex justify-between items-center p-2 border-b">
        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as 'edit' | 'preview')}
        >
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="edit" disabled={readOnly}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Collaboration status indicator */}
        <div className="flex items-center">
          {isCollaborationAvailable ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <Users className="h-4 w-4 mx-1" />
              <span>Collaborative</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <UserIcon className="h-4 w-4 mx-1" />
              <span>Local editing</span>
            </div>
          )}

          {isSaving && (
            <div className="ml-2 text-xs text-muted-foreground animate-pulse">Saving...</div>
          )}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'edit' && !readOnly ? (
          <NoteEditor
            value={content}
            onChange={handleContentChange}
            onAutoSave={handleAutoSave}
            autoSaveDelay={2000}
            minHeight="300px"
          />
        ) : (
          <NoteContent content={content} className="min-h-[300px]" />
        )}
      </div>

      {collaborators.length > 0 && (
        <div className="px-4 py-2 border-t flex items-center gap-2">
          <span className="text-xs text-muted-foreground">People editing:</span>
          <div className="flex -space-x-2">
            {collaborators.map((user) => (
              <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
