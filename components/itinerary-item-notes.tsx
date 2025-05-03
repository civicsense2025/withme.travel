'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Define connection status type
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type ItineraryItemNotesProps = {
  tripId: string;
  itemId: string;
  initialContent?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
};

// Function to generate a random color based on user ID
function getRandomColor(userId: string): string {
  const colors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFEB3B',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
  ];
  const index = Math.abs(userId.charCodeAt(0) % colors.length);
  return colors[index];
}

export function ItineraryItemNotes({
  tripId,
  itemId,
  initialContent = '',
  readOnly = false,
  onSave,
}: ItineraryItemNotesProps) {
  // Auth state
  const { user, supabase } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isSaving, setIsSaving] = useState(false);
  
  // Create refs for Y.js document and provider
  const ydoc = useMemo(() => new Y.Doc(), []);
  const providerRef = useRef<WebsocketProvider | null>(null);
  
  // Create and connect to the WebSocket provider
  const provider = useMemo(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
      return null;
    }
    // Construct the room name
    const roomName = `withme-notes-${tripId}-${itemId}`;

    // Use environment variables for WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_YJS_WEBSOCKET_URL || 'ws://localhost:1234';

    console.log(`[Notes ${itemId}] Initializing Yjs provider for room: ${roomName} at ${wsUrl}`);

    // Initialize the provider
    const wsProvider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      // Optional: Add authentication or other params here if needed
      // params: { auth: 'your-auth-token' }
    });

    wsProvider.on('status', (event: { status: ConnectionStatus }) => {
      console.log(`[Notes ${itemId}] Yjs Connection Status:`, event.status);
      setConnectionStatus(event.status);
      if (event.status === 'disconnected') {
        // Optional: Add retry logic here if needed
        console.warn(
          `[Notes ${itemId}] Yjs disconnected. Will attempt to reconnect automatically.`
        );
      }
    });

    wsProvider.on('sync', (isSynced: boolean) => {
      console.log(`[Notes ${itemId}] Yjs Sync Status:`, isSynced ? 'Synced' : 'Syncing...');
      // You might want to update UI based on sync status
    });

    return wsProvider;
  }, [ydoc, tripId, itemId]);

  const ytext = ydoc.getText('content');

  // If there's initial content and the ytext is empty, set it
  useEffect(() => {
    if (initialContent && ytext.toString() === '') {
      ytext.insert(0, initialContent);
    }
  }, [initialContent, ytext]);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        // Check if supabase client is available
        console.error('Supabase client not available in ItineraryItemNotes');
        setIsLoaded(true); // Set loaded even if client fails
        return;
      }
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
          color: getRandomColor(user.id),
          avatar:
            profile?.avatar_url ||
            `/api/avatar?name=${encodeURIComponent(profile?.name || 'User')}`,
        });
      }
      setIsLoaded(true);
    };

    getUser();

    // Store the current provider reference in a local variable
    providerRef.current = provider;
    const currentProvider = providerRef.current;

    return () => {
      // Use the captured variable instead of providerRef.current
      if (currentProvider) {
        currentProvider.disconnect();
        currentProvider.destroy();
      }
      ydoc.destroy();
    };
  }, [user, supabase, provider, ydoc]); // Add supabase dependency

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider,
          user: currentUser,
        }),
      ],
      editable: !readOnly,
      content: '', // Content is managed by Yjs
      editorProps: {
        attributes: {
          class: 'prose prose-sm focus:outline-none min-h-[100px] max-w-none'
        },
      },
    },
    [currentUser, provider, ydoc, readOnly]
  ); // Added dependencies

  // Save the content
  const saveContent = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const content = editor.getHTML();

      // We might still want an explicit save to backend, even with Yjs
      // This depends on the desired persistence strategy
      const response = await fetch(`/api/trips/${tripId}/itinerary/${itemId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes to backend');
      }

      if (onSave) {
        onSave(content);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      // Add user feedback, e.g., toast notification
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Status: {connectionStatus}</div>
      <EditorContent
        editor={editor}
        className="min-h-[100px] border rounded-md p-2 bg-background"
      />

      {!readOnly && (
        <div className="flex justify-end">
          <Button
            onClick={saveContent}
            size="sm"
            disabled={isSaving || connectionStatus !== 'connected'}
          >
            {isSaving
              ? 'Saving...'
              : connectionStatus !== 'connected'
                ? 'Connecting...'
                : 'Save Notes'}
          </Button>
        </div>
      )}
    </div>
  );
}