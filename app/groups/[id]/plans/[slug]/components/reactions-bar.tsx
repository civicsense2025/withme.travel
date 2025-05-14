'use client';

// @ts-expect-error: No types for react-emoji-reaction
import { EmojiReactionBar } from 'react-emoji-reaction';
// @ts-expect-error: No types for emoji-mart
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { useEffect, useState } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';

// Define the database structure
interface ReactionFromDB {
  id: string;
  idea_id: string | null;
  emoji: string;
  user_id: string | null;
  created_at: string | null;
  guest_token: string | null;
}

// Define our cleaned up type
interface Reaction {
  id: string;
  idea_id: string;
  emoji: string;
  user_id: string;
  created_at?: string;
  guest_token?: string;
}

interface ReactionsBarProps {
  ideaId: string;
  userId: string;
  className?: string;
}

const supabase = getBrowserClient();

const ReactionsBar: React.FC<ReactionsBarProps> = ({ ideaId, userId, className }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [ideaId]);

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.GROUP_PLAN_IDEA_REACTIONS)
        .select('*')
        .eq('idea_id', ideaId);

      if (error) {
        console.error('Error loading reactions:', error);
        return;
      }

      // Filter out any items with null idea_id or user_id and transform to our Reaction type
      const validReactions: Reaction[] = (data as ReactionFromDB[])
        .filter((item) => item.idea_id !== null && item.user_id !== null)
        .map((item) => ({
          id: item.id,
          idea_id: item.idea_id as string, // Safe after filter
          emoji: item.emoji,
          user_id: item.user_id as string, // Safe after filter
          created_at: item.created_at || undefined,
          guest_token: item.guest_token || undefined,
        }));

      setReactions(validReactions);
    } catch (err) {
      console.error('Error loading reactions:', err);
    }
  };

  const saveReaction = async (emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find((r) => r.user_id === userId && r.emoji === emoji);

      if (existingReaction) {
        // Remove the reaction
        const { error } = await supabase
          .from(TABLES.GROUP_PLAN_IDEA_REACTIONS)
          .delete()
          .eq('id', existingReaction.id);

        if (error) {
          console.error('Error removing reaction:', error);
          return;
        }
      } else {
        // Add new reaction
        const { error } = await supabase.from(TABLES.GROUP_PLAN_IDEA_REACTIONS).insert({
          idea_id: ideaId,
          user_id: userId,
          emoji,
        });

        if (error) {
          console.error('Error saving reaction:', error);
          return;
        }
      }

      // Reload reactions
      loadReactions();
    } catch (err) {
      console.error('Error saving reaction:', err);
    }
  };

  const handleAddEmoji = (emoji: { native: string }) => {
    saveReaction(emoji.native);
    setShowPicker(false);
  };

  return (
    <div className={`reactions-bar ${className || ''}`}>
      <div className="emoji-reactions">
        {reactions.map((reaction, index) => (
          <span
            key={index}
            className="emoji-reaction"
            onClick={() => userId === reaction.user_id && saveReaction(reaction.emoji)}
          >
            {reaction.emoji}
          </span>
        ))}
      </div>
      <button
        className="add-reaction-btn"
        onClick={() => setShowPicker(!showPicker)}
        aria-label="Add reaction"
      >
        +
      </button>
      {showPicker && (
        <div className="emoji-picker-container">
          <Picker onSelect={handleAddEmoji} />
        </div>
      )}
    </div>
  );
};

export default ReactionsBar;
