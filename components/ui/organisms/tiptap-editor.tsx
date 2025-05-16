'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Highlighter,
  Underline as UnderlineIcon,
  Redo,
  Undo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  autofocus?: boolean;
  editable?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
}

export function TipTapEditor({
  initialContent = '',
  placeholder = 'Start typing...',
  onChange,
  autofocus = false,
  editable = true,
  className = '',
  minHeight = '150px',
  maxHeight = 'none',
}: TipTapEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      CodeBlock,
    ],
    content,
    autofocus,
    editable,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert max-w-none focus:outline-none p-4',
          isFocused ? 'ring-1 ring-accent-purple/40' : ''
        ),
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
      },
    },
  });

  useEffect(() => {
    // Update content if initialContent changes externally
    if (editor && initialContent !== content) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent, content]);

  return (
    <div className={cn('border rounded-md bg-background', className)}>
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-surface-light/50">
          <EditorMenuButton
            editor={editor}
            action="toggleBold"
            isActive={(editor) => (editor ? editor.isActive('bold') : false)}
            icon={<Bold className="h-4 w-4" />}
            tooltip="Bold"
          />
          <EditorMenuButton
            editor={editor}
            action="toggleItalic"
            isActive={(editor) => (editor ? editor.isActive('italic') : false)}
            icon={<Italic className="h-4 w-4" />}
            tooltip="Italic"
          />
          <EditorMenuButton
            editor={editor}
            action="toggleUnderline"
            isActive={(editor) => (editor ? editor.isActive('underline') : false)}
            icon={<UnderlineIcon className="h-4 w-4" />}
            tooltip="Underline"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <EditorMenuButton
            editor={editor}
            action="toggleHeading"
            args={{ level: 1 }}
            isActive={(editor) => (editor ? editor.isActive('heading', { level: 1 }) : false)}
            icon={<Heading1 className="h-4 w-4" />}
            tooltip="Heading 1"
          />
          <EditorMenuButton
            editor={editor}
            action="toggleHeading"
            args={{ level: 2 }}
            isActive={(editor) => (editor ? editor.isActive('heading', { level: 2 }) : false)}
            icon={<Heading2 className="h-4 w-4" />}
            tooltip="Heading 2"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <EditorMenuButton
            editor={editor}
            action="toggleBulletList"
            isActive={(editor) => (editor ? editor.isActive('bulletList') : false)}
            icon={<List className="h-4 w-4" />}
            tooltip="Bullet List"
          />
          <EditorMenuButton
            editor={editor}
            action="toggleOrderedList"
            isActive={(editor) => (editor ? editor.isActive('orderedList') : false)}
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="Numbered List"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <EditorMenuButton
            editor={editor}
            action="setTextAlign"
            args="left"
            isActive={(editor) => (editor ? editor.isActive({ textAlign: 'left' }) : false)}
            icon={<AlignLeft className="h-4 w-4" />}
            tooltip="Align Left"
          />
          <EditorMenuButton
            editor={editor}
            action="setTextAlign"
            args="center"
            isActive={(editor) => (editor ? editor.isActive({ textAlign: 'center' }) : false)}
            icon={<AlignCenter className="h-4 w-4" />}
            tooltip="Align Center"
          />
          <EditorMenuButton
            editor={editor}
            action="setTextAlign"
            args="right"
            isActive={(editor) => (editor ? editor.isActive({ textAlign: 'right' }) : false)}
            icon={<AlignRight className="h-4 w-4" />}
            tooltip="Align Right"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <EditorMenuButton
            editor={editor}
            action="toggleHighlight"
            isActive={(editor) => (editor ? editor.isActive('highlight') : false)}
            icon={<Highlighter className="h-4 w-4" />}
            tooltip="Highlight"
          />
          <EditorMenuButton
            editor={editor}
            action="toggleCodeBlock"
            isActive={(editor) => (editor ? editor.isActive('codeBlock') : false)}
            icon={<Code className="h-4 w-4" />}
            tooltip="Code Block"
          />
          <div className="flex-1" />
          <EditorMenuButton
            editor={editor}
            action="undo"
            isActive={() => false}
            icon={<Undo className="h-4 w-4" />}
            tooltip="Undo"
          />
          <EditorMenuButton
            editor={editor}
            action="redo"
            isActive={() => false}
            icon={<Redo className="h-4 w-4" />}
            tooltip="Redo"
          />
        </div>
      )}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="bg-background rounded-md shadow-md border flex overflow-hidden"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            data-active={editor.isActive('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            data-active={editor.isActive('highlight')}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

interface EditorMenuButtonProps {
  editor: Editor | null;
  action: string;
  args?: any;
  isActive: (editor: Editor | null) => boolean;
  icon: React.ReactNode;
  tooltip: string;
}

function EditorMenuButton({
  editor,
  action,
  args,
  isActive,
  icon,
  tooltip,
}: EditorMenuButtonProps) {
  const handleClick = () => {
    if (!editor) return;

    if (args !== undefined) {
      (editor.chain().focus() as any)[action](args).run();
    } else {
      (editor.chain().focus() as any)[action]().run();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', isActive(editor) ? 'bg-accent-purple/10 text-accent-purple' : '')}
      onClick={handleClick}
      title={tooltip}
      disabled={!editor}
    >
      {icon}
    </Button>
  );
}
