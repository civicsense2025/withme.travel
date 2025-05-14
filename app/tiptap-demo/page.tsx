'use client';

import { useState } from 'react';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Card } from '@/components/ui/card';

export default function TipTapDemoPage() {
  const [content, setContent] = useState(
    '<h2>Try out our rich text editor!</h2><p>This is a fully-featured editor built with TipTap that supports:</p><ul><li>Text formatting (bold, italic, underline)</li><li>Headings</li><li>Lists (ordered and unordered)</li><li>Text alignment</li><li>Highlighting</li><li>Code blocks</li><li>And more!</li></ul><p>Just select some text to see the bubble menu, or use the toolbar above.</p>'
  );

  return (
    <div className="container max-w-5xl mx-auto py-16 px-4">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold">TipTap Editor Demo</h1>
        <p className="text-lg text-secondary-text">
          A modern WYSIWYG editor for your content needs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Editor</h2>
          <TipTapEditor
            initialContent={content}
            onChange={setContent}
            placeholder="Start typing here..."
            minHeight="300px"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Output HTML</h2>
          <Card className="p-4 bg-surface-subtle">
            <pre className="overflow-auto text-sm whitespace-pre-wrap">{content}</pre>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Rendered Output</h2>
          <Card className="p-6 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Read-only Example</h2>
          <TipTapEditor
            initialContent="<p>This is a read-only editor. You can't edit this content.</p>"
            editable={false}
            minHeight="100px"
          />
        </div>
      </div>

      <div className="mt-16 p-6 border rounded-lg bg-surface-light/50">
        <h2 className="text-2xl font-bold mb-4">Implementation Details</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p>
            This editor is implemented using the{' '}
            <a href="https://tiptap.dev/" target="_blank" rel="noopener noreferrer">
              TipTap
            </a>{' '}
            editor framework which is built on top of{' '}
            <a href="https://prosemirror.net/" target="_blank" rel="noopener noreferrer">
              ProseMirror
            </a>
            .
          </p>
          <p>Key features:</p>
          <ul>
            <li>Modern WYSIWYG editing experience</li>
            <li>Extensible architecture</li>
            <li>Support for collaborative editing</li>
            <li>Customizable toolbar and bubble menu</li>
            <li>Works well with React and Next.js</li>
          </ul>
          <p>Import and use it in your components:</p>
          <pre className="bg-surface-subtle p-4 rounded-md">
            {`import { TipTapEditor } from '@/components/tiptap-editor';

export default function MyComponent() {
  const [content, setContent] = useState('<p>Initial content</p>');

  return (
    <TipTapEditor
      initialContent={content}
      onChange={setContent}
      placeholder="Start typing..."
      minHeight="200px"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
