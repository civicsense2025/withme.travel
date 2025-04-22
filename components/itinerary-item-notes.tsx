"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"

type ItineraryItemNotesProps = {
  tripId: string
  itemId: string
  initialContent?: string
  readOnly?: boolean
  onSave?: (content: string) => void
}

// Function to generate a random color based on user ID
function getRandomColor(userId: string): string {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#9E9E9E",
    "#607D8B",
  ]
  const index = Math.abs(userId.charCodeAt(0) % colors.length)
  return colors[index]
}

export function ItineraryItemNotes({ 
  tripId, 
  itemId,
  initialContent = '', 
  readOnly = false,
  onSave
}: ItineraryItemNotesProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();
  
  // Set up Yjs document
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(`trip-item-${tripId}-${itemId}`, ydoc, {
    signaling: ['wss://signaling.yjs.dev']
  });
  
  const ytext = ydoc.getText('content');
  
  // If there's initial content and the ytext is empty, set it
  if (initialContent && ytext.toString() === '') {
    ytext.insert(0, initialContent);
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
          avatar: profile?.avatar_url || `/api/avatar?name=${encodeURIComponent(profile?.name || 'User')}`
        });
      }
      setIsLoaded(true);
    };
    
    getUser();
    
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  const editor = useEditor({
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
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[100px] max-w-none',
      },
    },
  }, [currentUser]);

  // Save the content
  const saveContent = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      
      await fetch(`/api/trips/${tripId}/itinerary/${itemId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (onSave) {
        onSave(content);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
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
      <EditorContent editor={editor} className="min-h-[100px] border rounded-md p-2" />
      
      {!readOnly && (
        <div className="flex justify-end">
          <Button 
            onClick={saveContent} \
