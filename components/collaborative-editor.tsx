'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Button } from '@/components/ui/button';
import { Loader2, Bold, Italic, List, ListOrdered, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface CollaborativeEditorProps {
  initialContent: string;
  documentId: string;
  tripId: string;
  onSave: (content: any) => void;
  onCancel: () => void;
}

export function CollaborativeEditor({
  initialContent,
  documentId,
  tripId,
  onSave,
  onCancel,
}: CollaborativeEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);

  // Initialize the collaborative editing session
  useEffect(() => {
    const doc = new Y.Doc();
    const roomName = `withme-travel-${tripId}-${documentId}`;

    // In a production app, you would use a more secure provider
    // This is just for demonstration purposes
    const webrtcProvider = new WebrtcProvider(roomName, doc, {
      signaling: ['wss://signaling.yjs.dev'],
  });

    setYdoc(doc);
    setProvider(webrtcProvider);

    // Set initial content if the document is empty
    const ytext = doc.getText('content');
    if (ytext.toString() === '' && initialContent) {
      ytext.insert(0, initialContent);
    }

    setIsLoading(false);

    return () => {
      webrtcProvider.destroy();
    };
  }, [tripId, documentId, initialContent]);

  // Set up the editor with collaboration extensions
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Collaboration.configure({
          document: ydoc,
  }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: user?.profile?.name || user?.email?.split('@')[0] || 'Anonymous',
            color: getRandomColor(),
            avatar:
              user?.profile?.avatar_url ||
              `/api/avatar?name=${encodeURIComponent(user?.profile?.name || 'User')}`,
          },
        }),
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'prose prose-sm focus:outline-none min-h-[100px] p-4'
        },
      },
    },
    [ydoc, provider]
  );

  // Handle save
  const handleSave = () => {
    if (!editor) return;

    setIsSaving(true);

    try {
      const content = editor.getHTML();
      onSave(content);
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content',
        variant: 'destructive',
  });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          data-active={editor?.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          data-active={editor?.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          data-active={editor?.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          data-active={editor?.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} className="min-h-[150px]" />

      <div className="flex justify-end gap-2 p-2 border-t bg-muted/50">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper function to generate random colors for user cursors
function getRandomColor() {
  const colors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}