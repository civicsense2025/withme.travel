/**
 * CollaborativeEditor Component Stories
 * 
 * Storybook stories for the CollaborativeEditor component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CollaborativeEditor } from './CollaborativeEditor';
import { useState, useEffect } from 'react';

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof CollaborativeEditor> = {
  title: 'UI/Features/collaboration/CollaborativeEditor',
  component: CollaborativeEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 
          'The CollaborativeEditor component allows multiple users to edit text content in real-time. ' +
          'This is a mock version for Storybook - the real component connects to Supabase Realtime.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    readOnly: { control: 'boolean' },
    initialContent: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CollaborativeEditor>;

// ============================================================================
// MOCK COMPONENT
// ============================================================================

/**
 * Mock version of the CollaborativeEditor for Storybook
 */
function MockCollaborativeEditor({ 
  initialContent = '',
  label = 'Collaborative Notes',
  placeholder = 'Type here to collaborate with others...',
  readOnly = false,
  className = '',
}) {
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Simulate occasional content updates from other users
  useEffect(() => {
    if (readOnly) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const insertions = [
          ' 👋 Hello there! ',
          ' [User2 is typing...] ',
          ' [Alex added a comment] ',
          ' [Maria edited this section] ',
        ];
        const randomInsertion = insertions[Math.floor(Math.random() * insertions.length)];
        setContent(prev => prev + randomInsertion);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [readOnly]);
  
  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1500);
  };
  
  return (
    <div className={`w-[500px] space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <div>{label}</div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs text-primary gap-1">
            <span>⚡ Connected</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground mr-2">Editing:</span>
            <div className="flex -space-x-2">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt="Jane Davis"
                className="h-8 w-8 rounded-full border-2 border-background"
              />
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                alt="Alex Johnson"
                className="h-8 w-8 rounded-full border-2 border-background"
              />
            </div>
          </div>
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full border border-gray-300 rounded-md h-40 p-2"
      />
      
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        {lastSaved && (
          <div>
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
        
        {!readOnly && (
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md ml-auto"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <em>Note: This is a mocked component for Storybook display only</em>
      </div>
    </div>
  );
}

// ============================================================================
// STORIES
// ============================================================================

/**
 * Default collaborative editor
 */
export const Default: Story = {
  render: (args) => <MockCollaborativeEditor {...args} />,
  args: {
    initialContent: 'This is a collaborative editor where multiple people can edit at once.\n\nTry typing something!',
    label: 'Trip Notes',
    placeholder: 'Type your notes here...',
  },
};

/**
 * Read-only view
 */
export const ReadOnly: Story = {
  render: (args) => <MockCollaborativeEditor {...args} />,
  args: {
    initialContent: 'This content is read-only and cannot be edited.\n\nIt\'s useful for displaying content to users who shouldn\'t be able to modify it.',
    label: 'Read-Only Notes',
    readOnly: true,
  },
};

/**
 * Empty state
 */
export const Empty: Story = {
  render: (args) => <MockCollaborativeEditor {...args} />,
  args: {
    initialContent: '',
    label: 'Start collaborating',
    placeholder: 'Share your thoughts with your team...',
  },
};

/**
 * With sample travel notes
 */
export const TravelItinerary: Story = {
  render: (args) => <MockCollaborativeEditor {...args} />,
  args: {
    initialContent: '## Tokyo Trip Notes\n\n### Day 1\n- Arrive at Narita Airport\n- Check-in at hotel in Shinjuku\n- Evening: Explore Shibuya Crossing\n\n### Day 2\n- Morning: Tokyo National Museum\n- Afternoon: Harajuku and Meiji Shrine\n- Dinner: Try ramen at [TBD - any suggestions?]',
    label: 'Trip Itinerary',
    placeholder: 'Add details to your travel plans...',
  },
}; 