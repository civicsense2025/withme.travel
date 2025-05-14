'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface HeroEmojiExplosionSpeechBubble {
  show: boolean;
  text: string;
}

interface HeroEmojiExplosionProps {
  emojis?: string[];
  size?: number;
  interval?: number;
  variant?: 'default' | 'people-bounce';
  tooltipVariant?: 'default' | 'cute';
  speechBubble?: HeroEmojiExplosionSpeechBubble;
}

const DEFAULT_EMOJIS = ['✈️', '🌴', '📷', '🧳', '☀️', '🌍', '🏖️', '🏝️'];

const PEOPLE_EMOJIS = [
  '🧑‍🤝‍🧑', '👨‍👩‍👧‍👦', '👩‍❤️‍👨', '👨‍👨‍👧', '👩‍👩‍👦', '🧑‍🎤', '🧑‍💻', '🧑‍🚀'
];

// Use 4 expressive, trip-relevant emojis for the people-bounce variant
const BOUNCE_EMOJIS = ['💃', '🧑‍💻', '🧑‍🍳', '🧑‍🚀'];
const EMOJI_MESSAGES: Record<string, string> = {
  '💃': 'The Planner: No more chaos—organize everything in one place!',
  '🧑‍💻': 'The Researcher: Share links, notes, and hidden gems with the group.',
  '🧑‍🍳': 'The Foodie: Pin must-try eats and vote on where to go next.',
  '🧑‍🚀': 'The Adventurer: Build an itinerary everyone can add to!',
};

const HeroEmojiExplosion: React.FC<HeroEmojiExplosionProps> = ({
  emojis = DEFAULT_EMOJIS,
  size = 40,
  interval = 500,
  variant = 'default',
  tooltipVariant = 'default',
  speechBubble,
}) => {
  const emojiRef = useRef<HTMLDivElement>(null);
  const inView = useInView(emojiRef, { margin: '-20% 0px -20% 0px', amount: 0.2 });

  if (variant === 'people-bounce') {
    const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null);
    // Hide tooltip on scroll/tap elsewhere (mobile UX)
    React.useEffect(() => {
      if (activeTooltip === null) return;
      const clear = () => setActiveTooltip(null);
      window.addEventListener('scroll', clear, { passive: true });
      window.addEventListener('touchstart', clear);
      return () => {
        window.removeEventListener('scroll', clear);
        window.removeEventListener('touchstart', clear);
      };
    }, [activeTooltip]);
    return (
      <div className="relative flex justify-between items-end w-full max-w-2xl mx-auto h-24 mt-8 px-8">
        {BOUNCE_EMOJIS.map((emoji, i) => (
          <div
            key={emoji}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setActiveTooltip(i)}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={() => setActiveTooltip(i)}
            onBlur={() => setActiveTooltip(null)}
            onTouchStart={e => { e.stopPropagation(); setActiveTooltip(i); }}
            onTouchEnd={e => { e.stopPropagation(); setActiveTooltip(null); }}
            onTouchCancel={e => { e.stopPropagation(); setActiveTooltip(null); }}
            onTouchMove={e => { e.stopPropagation(); setActiveTooltip(null); }}
            tabIndex={0}
            aria-label={EMOJI_MESSAGES[emoji]}
          >
            <motion.span
              className="text-5xl"
              style={{ fontSize: size }}
              initial={{ y: 0, opacity: 0.92 }}
              animate={{ y: [0, -18, 0], opacity: 1 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.22,
                ease: 'easeInOut',
              }}
              aria-label="Celebration Emoji"
              role="img"
            >
              {emoji}
            </motion.span>
            <AnimatePresence>
              {activeTooltip === i && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 32 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-16 sm:top-[3.5rem] left-1/2 -translate-x-1/2 z-50"
                >
                  <div className="bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2 shadow-lg max-w-xs w-[200px] text-center text-xs sm:text-xs text-zinc-700 dark:text-zinc-100 whitespace-normal">
                    {EMOJI_MESSAGES[emoji]}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={emojiRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <motion.span
        className="absolute left-[12%] top-[34%] text-2xl animate-emoji-float-1 hidden sm:block"
        style={{ animationDelay: '0.1s' }}
        role="img"
        aria-label="Airplane"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        ✈️
      </motion.span>
      <motion.span
        className="absolute left-[80%] top-[18%] text-2xl animate-emoji-float-2 hidden sm:block"
        style={{ animationDelay: '0.3s' }}
        role="img"
        aria-label="Palm Tree"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        🌴
      </motion.span>
      <motion.span
        className="absolute right-[20%] bottom-[10%] text-2xl animate-emoji-float-4"
        style={{ animationDelay: '0.2s' }}
        role="img"
        aria-label="Camera"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        📷
      </motion.span>
      <motion.span
        className="absolute left-[50%] top-[5%] text-2xl animate-emoji-float-5"
        style={{ animationDelay: '0.4s' }}
        role="img"
        aria-label="Luggage"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        🧳
      </motion.span>
      <motion.span
        className="absolute left-[15%] top-[80%] text-2xl animate-emoji-float-6"
        style={{ animationDelay: '0.6s' }}
        role="img"
        aria-label="Sun"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        ☀️
      </motion.span>
      <motion.span
        className="absolute right-[10%] top-[50%] text-2xl animate-emoji-float-7 hidden sm:block"
        style={{ animationDelay: '0.7s' }}
        role="img"
        aria-label="Globe"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        🌍
      </motion.span>
    </div>
  );
};

export default HeroEmojiExplosion;

export type { HeroEmojiExplosionSpeechBubble };
