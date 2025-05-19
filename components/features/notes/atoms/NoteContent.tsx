/**
 * Note Content
 *
 * Atom component for displaying formatted note content with markdown support
 *
 * @module notes/atoms
 */

import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';


// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface NoteContentProps {
  /** The markdown content to display */
  content: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show placeholder when content is empty */
  showPlaceholder?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NoteContent({ content, className, showPlaceholder = true }: NoteContentProps) {
  // Handle empty content
  if (!content && showPlaceholder) {
    return (
      <div className={cn('text-muted-foreground italic', className)}>
        This note is empty. Start typing to add content.
      </div>
    );
  }

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none break-words', className)}>
      <ReactMarkdown
        components={{
          // Custom rendering for code blocks
          code({ node, inline, className, children, ...props }: { node: any, inline: boolean, className: string, children: React.ReactNode, props: any }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className={cn('bg-muted p-4 rounded-md overflow-x-auto', className)} {...props}>
                <code className={`language-${match[1]}`}>
                  {String(children).replace(/\n$/, '')}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Make links open in new tab
          a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
