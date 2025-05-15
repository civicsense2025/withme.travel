/**
 * GroupCirclesSection.tsx
 *
 * Orchestrates the display of interactive group circles, feature callouts, and a CTA.
 * Features responsive design, dynamic content rendering, and theme awareness.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { getColorToken, ThemeMode } from '@/utils/constants/design-system'; // Adjust path

// Hooks and Constants
import { useScreenSize } from '@/hooks/useScreenSize'; // Adjust path
import {
  LayoutType,
  GROUP_LIMITS,
  AVATAR_LIMITS,
  AVATAR_SIZE_STYLES,
  BASE_GROUPS_DATA,
  NEW_MEMBERS_POOL,
  FEATURE_CALLOUTS_CONTENT,
  GROUP_CIRCLE_SIZES_BY_LAYOUT,
  FLOATING_BUBBLE_COLORS,
  GroupWithStyle,
  GroupData,
} from '@/utils/constants/groupCirclesConstants'; // Adjust path

// Sub-components
import { SectionHeader } from './SectionHeader'; // Adjust path
import { FloatingBubble } from './FloatingBubble'; // Adjust path
import { GroupCircle } from './GroupCircle'; // Adjust path
import { FeatureCard } from './FeatureCard'; // Adjust path
import { CallToActionButton } from './CallToActionButton'; // Adjust path

export interface GroupCirclesSectionProps {
  mode?: ThemeMode; // For overriding theme in Storybook or tests
}

export function GroupCirclesSection({ mode }: GroupCirclesSectionProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false); // Renamed for clarity

  const { resolvedTheme } = useTheme();
  const currentTheme = mode || (resolvedTheme as ThemeMode) || 'light';

  const { layout, isMobile, isDesktop } = useScreenSize();

  // Theme-aware colors (memoized for stability if passed to many children)
  const textColor = useMemo(() => getColorToken('TEXT', currentTheme), [currentTheme]);
  const mutedColor = useMemo(() => getColorToken('MUTED', currentTheme), [currentTheme]);
  const surfaceColor = useMemo(() => getColorToken('SURFACE', currentTheme), [currentTheme]); // Used by GroupCircle border for avatars

  // Responsive limits
  const groupLimit = GROUP_LIMITS[layout];
  const avatarLimit = AVATAR_LIMITS[layout];
  const groupBaseSizes = GROUP_CIRCLE_SIZES_BY_LAYOUT[layout];

  // Memoized group data processing
  const displayedGroups = useMemo(() => {
    return BASE_GROUPS_DATA.slice(0, groupLimit).map((g: GroupData) => ({
      ...g,
      borderStyle: Math.random() > 0.5 ? 'solid' : 'dashed',
    })) as GroupWithStyle[];
    // No need to depend on layout for position here, that's a style concern for the GroupCircle component or its container.
  }, [groupLimit]);


  // Floating bubbles (less on mobile)
  const floatingBubblesData = useMemo(() => {
    if (isMobile) return [];
    return Array.from({ length: 7 }, (_, i) => ({
      id: i,
      size: Math.random() * 60 + 30,
      color: FLOATING_BUBBLE_COLORS[Math.floor(Math.random() * FLOATING_BUBBLE_COLORS.length)],
      position: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` },
    }));
  }, [isMobile]);

  // Event Handlers
  const handleToggleGroupActive = useCallback((groupId: string) => {
    setActiveGroupId((prev) => (prev === groupId ? null : groupId));
  }, []);

  const handleAddNewMember = useCallback((groupId: string) => {
    if (addingMember) return;
    setAddingMember(true);
    console.log(`Simulating add member to ${groupId} with ${NEW_MEMBERS_POOL[0].emoji}`);
    // In a real app, update group data here
    setTimeout(() => {
      setAddingMember(false);
    }, 500);
  }, [addingMember]);

  const handleCTAClick = useCallback(() => {
    console.log('CTA clicked: Start planning together');
    // Implement navigation or modal logic
  }, []);

  // Style calculation functions to pass to GroupCircle
  const getGroupContainerStyle = useCallback((group: GroupWithStyle, index: number): React.CSSProperties => {
    const size = groupBaseSizes[index % groupBaseSizes.length];
    if (isMobile) {
      return {
        position: 'relative', // For stacking in flex container
        width: size,
        height: size,
        // margin is handled by gap in flex container
      };
    }
    return { // Desktop / Tablet scattered layout
      position: 'absolute',
      width: size,
      height: size,
      top: group.position.top,
      left: group.position.left,
      transform: 'translate(-50%, -50%)',
    };
  }, [isMobile, groupBaseSizes]);


  const getMemberPositionStyle = useCallback((index: number, total: number, groupSize: number): React.CSSProperties => {
      // const avatarSizeConfig = AVATAR_LIMITS[layout]; // This is incorrect, should be AVATAR_SIZE_STYLES
      const memberAvatarCurrentSize = AVATAR_SIZE_STYLES[layout]; // Corrected

      if (isMobile) {
          // Simplified row for mobile avatars, can be refined
          // Calculate total width of avatars to center them
          const avatarWidth = memberAvatarCurrentSize.width;
          const spacing = avatarWidth * 0.2; // Small space between avatars
          const totalAvatarWidth = total * avatarWidth + (total - 1) * spacing;
          const startX = (groupSize - totalAvatarWidth) / 2;

          return {
              left: `${startX + index * (avatarWidth + spacing)}px`, // Use px for direct calculation
              top: '75%', // Percentage of group circle height
              transform: 'translateY(-50%)', // Center vertically at that 'top' line
          };
      }
      // Desktop/Tablet circular positioning
      const radius = groupSize / 2 - (memberAvatarCurrentSize.width / 2 + 4); // 4px padding from edge
      const angleStep = (2 * Math.PI) / Math.max(total, 1);
      const angle = index * angleStep - Math.PI / 2; // Start from top

      return {
          left: `${50 + (radius / (groupSize / 2)) * Math.cos(angle) * 50}%`,
          top: `${50 + (radius / (groupSize / 2)) * Math.sin(angle) * 50}%`,
          transform: 'translate(-50%, -50%)',
      };
  }, [layout, isMobile]); // Added isMobile to dependency array as it's used indirectly via layout


  // Main layout styles
  const sectionWrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    padding: isMobile ? '2rem 0.5rem' : '4rem 1.5rem',
    position: 'relative',
    overflow: 'hidden', // Important for containing absolutely positioned bubbles
  };

  const groupsAreaStyle: React.CSSProperties = isMobile
    ? { // Mobile: Stacked layout
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem', // Spacing between stacked circles
        paddingTop: '1rem',
        position: 'relative',
        zIndex: 2,
        marginBottom: '1rem',
      }
    : { // Desktop/Tablet: Scattered layout in a fixed-height canvas
        height: 650,
        position: 'relative',
        marginBottom: '2rem',
        zIndex: 2,
      };

  const featureCalloutsContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Assumes 3 features
    gap: '2rem',
    maxWidth: 900,
    margin: '3rem auto 0', // Added top margin
    position: 'relative',
    zIndex: 2,
  };

  const ctaSectionStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: isMobile ? '2rem' : '4rem',
    position: 'relative',
    zIndex: 2,
  };

  return (
    <div style={sectionWrapperStyle}>
      {/* Floating bubbles (decorative, behind other content) */}
      {floatingBubblesData.map((bubble) => (
        <FloatingBubble key={bubble.id} {...bubble} />
      ))}

      <SectionHeader
        title={<>Plan Together With Your Travel Tribes <span role="img" aria-label="sparkles">🌟</span></>}
        subtitle="Create, coordinate, and explore with the people who matter most"
        layout={layout}
        textColor={textColor}
        mutedColor={mutedColor}
      />

      {/* Main Area for Group Circles */}
      <div style={groupsAreaStyle}>
        {displayedGroups.map((group, idx) => {
          const groupDisplaySize = groupBaseSizes[idx % groupBaseSizes.length];
          return (
            <GroupCircle
              key={group.id}
              group={group}
              groupDisplaySize={groupDisplaySize}
              isActive={activeGroupId === group.id}
              layout={layout}
              avatarLimit={avatarLimit}
              currentTheme={currentTheme}
              onClick={() => handleToggleGroupActive(group.id)}
              onAddNewMember={handleAddNewMember}
              addingMemberInProgress={addingMember}
              containerStyle={getGroupContainerStyle(group, idx)}
              getMemberPositionStyle={getMemberPositionStyle}
            />
          );
        })}
      </div>

      {/* Feature Callouts (hide on mobile) */}
      {isDesktop && ( // Or !isMobile if you want on tablet too
        <div style={featureCalloutsContainerStyle}>
          {FEATURE_CALLOUTS_CONTENT.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} currentTheme={currentTheme} />
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div style={ctaSectionStyle}>
        <CallToActionButton
            layout={layout}
            onClick={handleCTAClick}
            buttonText="Start planning together"
        />
        <p style={{ color: mutedColor, marginTop: '0.75rem', fontSize: '0.85rem' }}>
          Free for up to 8 travelers per group
        </p>
      </div>
    </div>
  );
}

export default GroupCirclesSection; 