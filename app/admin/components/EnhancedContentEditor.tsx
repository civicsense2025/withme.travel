'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading2,
  Undo,
  Redo,
  SaveIcon,
} from 'lucide-react';

interface EnhancedContentEditorProps {
  initialContent: string;
  contentType: string;
  contentId: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function EnhancedContentEditor({
  initialContent,
  contentType,
  contentId,
  onSave,
  onCancel,
  placeholder = 'Start typing...',
}: EnhancedContentEditorProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none',
      },
    },
  });

  const saveContent = useCallback(async () => {
    if (!editor) return;

    const content = editor.getHTML();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/${contentType}/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: 'Success',
        description: 'Content saved successfully',
      });

      if (onSave) {
        onSave(content);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [editor, contentType, contentId, toast, onSave]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <Card className="p-6 shadow-sm">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6">
        <EditorContent editor={editor} className="min-h-[200px] focus:outline-none" />
      </div>

      <div className="border-t p-3 flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button onClick={saveContent} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
