import { Variants } from 'framer-motion';

// Constants for consistent durations
export const ANIMATION_DURATIONS = {
  fast: 0.2,
  medium: 0.4,
  slow: 0.6,
};

export const easings = {
  // Smooth easing for most UI elements
  smooth: [0.4, 0, 0.2, 1],
  // Bounce effect for elements that need emphasis
  bounce: [0.175, 0.885, 0.32, 1.275],
  // Snappy effect for responsive interactions
  snappy: [0.05, 0.7, 0.1, 1.0],
  // Spring effect for natural motion
  spring: [0.43, 0.13, 0.23, 0.96],
};

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Fade + scale animations
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Slide up animation
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Slide down animation
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Slide in from left animation
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
};

// Slide in from right animation
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
    },
  },
};

// Bounce animation for important elements
export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.bounce,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Staggered children animation (parent)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

// Toast notification animations
export const toastAnimation: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
    },
  },
};

// Page transitions
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.medium,
      ease: easings.smooth,
      when: 'beforeChildren',
      staggerChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATIONS.fast,
      ease: easings.smooth,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};
