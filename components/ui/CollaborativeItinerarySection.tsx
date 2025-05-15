import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { useTheme } from 'next-themes';
import { getColorToken, ThemeMode } from '@/utils/constants/design-system';

export interface CollaborativeItinerarySectionProps {
  mode?: ThemeMode;
}

export function CollaborativeItinerarySection({ mode }: CollaborativeItinerarySectionProps) {
  const [active, setActive] = useState(false);
  const { resolvedTheme } = useTheme();
  const currentTheme = mode || (resolvedTheme as ThemeMode) || 'light';
  const textColor = getColorToken('TEXT', currentTheme);
  const mutedColor = getColorToken('MUTED', currentTheme);
  const borderColor = getColorToken('BORDER', currentTheme);
  const surfaceColor = getColorToken('SURFACE', currentTheme);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const avatarVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 200, delay: 1.2 },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  const voteVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.1, y: -5 },
  };

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '6rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '4rem' }}
      >
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: textColor }}>
          Plan together, decide together 🙌
        </h2>
        <p style={{ fontSize: '1.25rem', color: mutedColor, maxWidth: 600, margin: '0 auto' }}>
          Build itineraries collaboratively with your travel crew. Add places, vote on ideas, and
          see changes in real-time.
        </p>
      </motion.div>
      <motion.div
        style={{
          background: surfaceColor,
          borderRadius: 32,
          boxShadow: '0 6px 24px 0 rgba(124, 131, 253, 0.09)',
          overflow: 'hidden',
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 500, color: textColor }}>Barcelona Trip Itinerary</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.div
              variants={avatarVariants}
              initial="initial"
              animate="animate"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              👩🏽
            </motion.div>
            <motion.div
              variants={avatarVariants}
              initial="initial"
              animate="animate"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#7c83fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              👨🏻
            </motion.div>
            <motion.div
              variants={avatarVariants}
              initial="initial"
              animate="animate"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#6ad7e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              👩🏿
            </motion.div>
            <motion.div
              variants={avatarVariants}
              initial="initial"
              animate="animate"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#fcb1a6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              👨🏼
            </motion.div>
          </div>
        </div>
        {/* Itinerary Items */}
        <div style={{ padding: '1.5rem' }}>
          <motion.div
            variants={itemVariants}
            style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, color: textColor }}>Morning: Park Güell 🏞️</div>
              <div style={{ fontSize: 14, color: mutedColor }}>9:00 AM</div>
            </div>
            <p style={{ fontSize: 14, color: mutedColor, marginBottom: 12 }}>
              Gaudí's colorful park with amazing city views. Buy tickets in advance!
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: textColor }}>Added by Maya</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.div
                  variants={voteVariants}
                  whileHover="hover"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#7c83fd',
                  }}
                >
                  <span style={{ marginRight: 4 }}>👍</span>
                  <span style={{ fontSize: 14 }}>4</span>
                </motion.div>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: mutedColor,
                  }}
                >
                  <span style={{ marginRight: 4 }}>💬</span>
                  <span style={{ fontSize: 14 }}>2</span>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            style={{
              border: `1px solid ${borderColor}`,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, color: textColor }}>Lunch: La Boqueria Market 🥘</div>
              <div style={{ fontSize: 14, color: mutedColor }}>1:00 PM</div>
            </div>
            <p style={{ fontSize: 14, color: mutedColor, marginBottom: 12 }}>
              Famous food market off La Rambla. Try fresh juice and tapas at the stalls inside.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: textColor }}>Added by James</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.div
                  variants={voteVariants}
                  whileHover="hover"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#7c83fd',
                  }}
                >
                  <span style={{ marginRight: 4 }}>👍</span>
                  <span style={{ fontSize: 14 }}>3</span>
                </motion.div>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: mutedColor,
                  }}
                >
                  <span style={{ marginRight: 4 }}>💬</span>
                  <span style={{ fontSize: 14 }}>1</span>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            style={{
              border: `2px dashed #7c83fd33`,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c83fd',
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={() => setActive(!active)}
          >
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
              style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}
            >
              <span style={{ marginRight: 8 }}>+</span> Add afternoon activity
            </motion.div>
          </motion.div>
          {active && (
            <motion.div
              variants={itemVariants}
              style={{
                border: `1px solid ${borderColor}`,
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                background: '#7c83fd0d',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 500, color: textColor }}>
                  Afternoon: Sagrada Familia 🏛️
                </div>
                <div style={{ fontSize: 14, color: mutedColor }}>4:00 PM</div>
              </div>
              <p style={{ fontSize: 14, color: mutedColor, marginBottom: 12 }}>
                Gaudí's masterpiece and Barcelona's most iconic sight. Amazing light inside!
              </p>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ fontSize: 12, color: textColor }}>Added by you just now</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.div
                    variants={voteVariants}
                    whileHover="hover"
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#7c83fd',
                    }}
                  >
                    <span style={{ marginRight: 4 }}>👍</span>
                    <span style={{ fontSize: 14 }}>1</span>
                  </motion.div>
                  <div
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: mutedColor,
                    }}
                  >
                    <span style={{ marginRight: 4 }}>💬</span>
                    <span style={{ fontSize: 14 }}>0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <motion.div
            variants={itemVariants}
            style={{ border: `1px solid ${borderColor}`, borderRadius: 18, padding: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 500, color: textColor }}>Evening: Tapas in El Born 🍷</div>
              <div style={{ fontSize: 14, color: mutedColor }}>8:00 PM</div>
            </div>
            <p style={{ fontSize: 14, color: mutedColor, marginBottom: 12 }}>
              Bar hop through the trendy El Born district. Try El Xampanyet for cava and tapas!
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: textColor }}>Added by Zoe</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.div
                  variants={voteVariants}
                  whileHover="hover"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#7c83fd',
                  }}
                >
                  <span style={{ marginRight: 4 }}>👍</span>
                  <span style={{ fontSize: 14 }}>4</span>
                </motion.div>
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: mutedColor,
                  }}
                >
                  <span style={{ marginRight: 4 }}>💬</span>
                  <span style={{ fontSize: 14 }}>3</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Typing indicator */}
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              borderTop: `1px solid ${borderColor}`,
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#7c83fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                marginRight: 12,
              }}
            >
              👨🏻
            </div>
            <div style={{ fontSize: 14, color: mutedColor, display: 'flex', alignItems: 'center' }}>
              James is typing
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ marginLeft: 4 }}
              >
                ...
              </motion.span>
            </div>
          </motion.div>
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ textAlign: 'center', marginTop: 32, color: mutedColor }}
      >
        Everyone sees updates in real-time, just like they're in the room together ✨
      </motion.p>
    </div>
  );
}

export default CollaborativeItinerarySection;
