// utils/constants/groupCirclesConstants.ts

export const MOBILE_MAX_WIDTH = 640;
export const TABLET_MAX_WIDTH = 1024;

export type LayoutType = 'mobile' | 'tablet' | 'desktop';

export const GROUP_LIMITS: Record<LayoutType, number> = {
  mobile: 2,
  tablet: 3,
  desktop: 5,
};

export const AVATAR_LIMITS: Record<LayoutType, number> = {
  mobile: 3,
  tablet: 4,
  desktop: 6,
};

export interface MemberData {
  emoji: string;
  color: string;
}

export interface GroupData {
  id: string;
  name: string;
  emoji: string;
  date: string;
  planningStage: string; // This wasn't used in the UI display, but good to keep if needed
  members: MemberData[];
  position: { top: string; left: string }; // For desktop/tablet layout
}

export interface GroupWithStyle extends GroupData {
  borderStyle: 'solid' | 'dashed';
  // Position might be adjusted for mobile, so the component will handle final style
}

export const BASE_GROUPS_DATA: GroupData[] = [
  {
    id: 'barcelona',
    name: 'Barcelona Trip',
    emoji: '🇪🇸',
    date: 'June 15-22, 2025',
    planningStage: 'Finalizing hotels',
    members: [
      { emoji: '👩🏽', color: '#a5b4fc' },
      { emoji: '👨🏻', color: '#7c83fd' },
      { emoji: '👩🏼', color: '#6ad7e5' },
      { emoji: '👨🏿', color: '#fcb1a6' },
    ],
    position: { top: '15%', left: '25%' },
  },
  {
    id: 'japan',
    name: 'Japan 2025',
    emoji: '🇯🇵',
    date: 'April 5-18, 2025',
    planningStage: 'Researching destinations',
    members: [
      { emoji: '👩🏽', color: '#a5b4fc' },
      { emoji: '👨🏻', color: '#7c83fd' },
      { emoji: '👨🏿', color: '#fcb1a6' },
    ],
    position: { top: '30%', left: '60%' },
  },
  {
    id: 'italy',
    name: 'Italian Summer',
    emoji: '🇮🇹',
    date: 'July 10-24, 2025',
    planningStage: 'Voting on activities',
    members: [
      { emoji: '👩🏼', color: '#6ad7e5' },
      { emoji: '👨🏿', color: '#fcb1a6' },
      { emoji: '👨🏻', color: '#7c83fd' },
      { emoji: '👩🏻', color: '#ffa3fd' },
      { emoji: '👨🏼', color: '#ff9b76' },
    ],
    position: { top: '60%', left: '30%' },
  },
  {
    id: 'mexico',
    name: 'Mexico City',
    emoji: '🇲🇽',
    date: 'Nov 1-8, 2025',
    planningStage: 'Just getting started',
    members: [
      { emoji: '👩🏻', color: '#ffa3fd' },
      { emoji: '👨🏼', color: '#ff9b76' },
    ],
    position: { top: '20%', left: '48%' },
  },
  {
    id: 'bali',
    name: 'Bali Beaches',
    emoji: '🇮🇩',
    date: 'Feb 5-15, 2026',
    planningStage: 'Booking flights',
    members: [
      { emoji: '👩🏽', color: '#a5b4fc' },
      { emoji: '👨🏻', color: '#7c83fd' },
      { emoji: '👩🏼', color: '#6ad7e5' },
    ],
    position: { top: '55%', left: '65%' },
  },
];

export const NEW_MEMBERS_POOL: MemberData[] = [
  { emoji: '👩🏻', color: '#ffa3fd' },
  { emoji: '👨🏼', color: '#ff9b76' },
  { emoji: '👩🏾', color: '#99d17b' },
  { emoji: '👨🏽', color: '#ffdb80' },
];

export const FEATURE_CALLOUTS_CONTENT = [
  {
    emoji: '🗣️',
    title: "No one's left out",
    description:
      'Even your friend who always "just goes with the flow" can drop a pin or two. Everyone\'s voice, every wild idea—right here.',
  },
  {
    emoji: '✨',
    title: 'Plans change? No sweat',
    description:
      "You'll see it before your coffee gets cold. Real-time updates mean you're never out of the loop, even if you're still in your pajamas.",
  },
  {
    emoji: '🗺️',
    title: 'All your chaos, organized',
    description:
      'Every group\'s wild ideas, in one place—no more lost links, mystery spreadsheets, or "wait, where\'s that doc?" moments.',
  },
];

export const AVATAR_SIZE_STYLES: Record<
  LayoutType,
  { width: number; height: number; fontSize: string }
> = {
  mobile: { width: 18, height: 18, fontSize: '0.9rem' },
  tablet: { width: 24, height: 24, fontSize: '1.1rem' },
  desktop: { width: 24, height: 24, fontSize: '1.1rem' }, // Same as tablet in original
};

export const GROUP_CIRCLE_SIZES_BY_LAYOUT: Record<LayoutType, number[]> = {
  mobile: [120, 140],
  tablet: [160, 180, 200],
  desktop: [180, 200, 220, 160, 140],
};

export const FLOATING_BUBBLE_COLORS = [
  'rgba(124,131,253,0.08)',
  'rgba(106,215,229,0.08)',
  'rgba(252,177,166,0.08)',
  'rgba(255,163,253,0.08)',
];
