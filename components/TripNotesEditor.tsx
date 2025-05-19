'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';
import { formatError } from '@/utils/lib-utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Save,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/hooks/use-toast'

type TripNotesEditorProps = {
  tripId: string;
  noteId?: string | null;
  initialContent?: string;
  placeholder?: string;
  readOnly?: boolean;
};

export function TripNotesEditor({
  tripId,
  noteId,
  initialContent = '',
  placeholder = 'Add notes about your trip...',
  readOnly = false,
}: TripNotesEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:text-blue-700',
        },
      }),
    ],
    editable: !readOnly,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose focus:outline-none max-w-none p-4 min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      // If implementing auto-save, trigger save here (debounced)
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
    }
  }, [initialContent, editor]);

  const saveContent = async () => {
    if (!editor || !noteId) {
      toast({
        title: 'Cannot Save',
        description: 'No note selected to save to.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getHTML();

      const response = await fetch(`/api/trips/${tripId}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save notes');
      }

      toast({
        title: 'Note Saved!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast({
        title: 'Failed to save note',
        description: formatError(error),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          editor.chain().focus().setImage({ src: e.target.result, alt: file.name }).run();
        }
      };
      reader.readAsDataURL(file);

      const timestamp = new Date().getTime();
      const fileName = `trip-notes-${tripId}-${timestamp}-${file.name.replace(/\s+/g, `-`)}`;
      const filePath = `trip-notes/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trip-media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from('trip-media').getPublicUrl(filePath);

      if (urlData && urlData.publicUrl) {
        const imagePos = editor.state.selection.$anchor.pos;
        let foundPos = -1;
        editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node, pos) => {
          if (foundPos > -1) return false;
          if (node.type.name === 'image') {
            const nodePos = pos;
            if (nodePos <= imagePos && imagePos <= nodePos + node.nodeSize) {
              foundPos = nodePos;
              return false;
            }
          }
          return true;
        });

        if (foundPos > -1) {
          editor
            .chain()
            .setNodeSelection(foundPos)
            .deleteSelection()
            .setImage({ src: urlData.publicUrl, alt: file.name })
            .run();
        } else {
          editor.chain().focus().setImage({ src: urlData.publicUrl, alt: file.name }).run();
        }

        toast({
          title: 'Image uploaded',
          description: 'Image has been added to your notes',
        });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: 'Failed to upload image',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!editor) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload Image"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <div className="flex-grow"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={saveContent}
            disabled={isSaving || !noteId}
            title="Save Note"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor, view, state, oldState, from, to }: any) => {
            // Only show when text is selected
            return !editor.isActive('image') && from !== to;
          }}
        >
          <div className="flex items-center gap-1 p-1 rounded-md bg-background border shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const url = window.prompt('Enter the URL');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              data-active={editor.isActive('link')}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}
