// @ts-expect-error: No types for react-emoji-reaction
import { EmojiReactionBar } from 'react-emoji-reaction';
// @ts-expect-error: No types for emoji-mart
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { useEffect, useState } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
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

  // Fetch reactions
  useEffect(() => {
    async function fetchReactions() {
      const { data, error } = await supabase
        .from('group_idea_reactions')
        .select('*')
        .eq('idea_id', ideaId);
      if (!error && data) setReactions(data);
    }
    fetchReactions();
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`reactions-${ideaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_idea_reactions', filter: `idea_id=eq.${ideaId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setReactions((prev) => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setReactions((prev) => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [ideaId]);

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, string[]>>((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(r.user_id);
    return acc;
  }, {});

  // Convert to format for EmojiReactionBar
  const emojiReactions = Object.entries(grouped).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    reacted: userIds.includes(userId),
  }));

  const handleReaction = async (emoji: string) => {
    const hasReacted = grouped[emoji]?.includes(userId);
    if (hasReacted) {
      // Remove reaction
      await supabase
        .from('group_idea_reactions')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId)
        .eq('emoji', emoji);
    } else {
      // Add reaction
      await supabase
        .from('group_idea_reactions')
        .insert({ idea_id: ideaId, user_id: userId, emoji });
    }
  };

  const handleAddEmoji = () => setShowPicker(true);
  const handleSelectEmoji = async (emojiObj: any) => {
    setShowPicker(false);
    await handleReaction(emojiObj.native);
  };

  return (
    <div className={className}>
      <EmojiReactionBar
        reactions={emojiReactions}
        onSelect={handleReaction}
        onAddEmoji={handleAddEmoji}
        userId={userId}
        style={{ fontSize: 18, minHeight: 28 }}
      />
      {showPicker && (
        <div className="absolute z-50">
          <Picker onSelect={handleSelectEmoji} showPreview={false} showSkinTones={false} />
        </div>
      )}
    </div>
  );
};

export default ReactionsBar; 