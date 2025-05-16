/**
 * GroupCircle Component
 * 
 * An interactive, animated circle representing a travel group with members.
 * Features animations, member avatars, and click interactions.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus } from 'lucide-react';

// Components
import { MemberAvatar } from './MemberAvatar';

// Utils and Constants
import {
  GroupWithStyle,
  LayoutType,
  MemberData,
  AVATAR_SIZE_STYLES,
} from '@/utils/constants/groupCirclesConstants';
import { ThemeMode, getColorToken } from '@/utils/constants/design-system';

// ============================================================================
// TYPES
// ============================================================================

/** Props for the GroupCircle component */
export interface GroupCircleProps {
  /** Group data with style information */
  group: GroupWithStyle;
  /** Calculated size for this specific circle */
  groupDisplaySize: number;
  /** Whether this group is currently active/selected */
  isActive: boolean;
  /** Current layout based on screen size */
  layout: LayoutType;
  /** Maximum number of avatars to display */
  avatarLimit: number;
  /** Current theme mode for styling */
  currentTheme: ThemeMode;
  /** Click handler for the group circle */
  onClick: () => void;
  /** Handler for adding a new member */
  onAddNewMember: (groupId: string) => void;
  /** Whether a member is currently being added */
  addingMemberInProgress: boolean;
  /** Positioning and sizing styles for the container */
  containerStyle: React.CSSProperties;
  /** Function to calculate positioning for member avatars */
  getMemberPositionStyle: (index: number, totalMembers: number, groupSize: number) => React.CSSProperties;
}

// Extending GroupWithStyle to include missing properties needed in this component
interface ExtendedGroupWithStyle extends GroupWithStyle {
  /** Formatted date text to display */
  dateText: string;
}

// Extending MemberData to include missing properties needed in this component
interface ExtendedMemberData extends MemberData {
  /** Unique identifier for the member */
  id: string;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/** Animation variants for the main circle */
const mainCircleVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 150, damping: 20, delay: 0.1 },
  },
  hover: {
    scale: 1.08,
    rotate: 2, // Playful rotation
    boxShadow: '0px 12px 35px rgba(0,0,0,0.15)',
    transition: { type: 'spring', stiffness: 300, damping: 10 },
  },
  active: {
    scale: 1.03,
    boxShadow: '0px 8px 28px rgba(0,0,0,0.12)',
  },
  adding: { // When a member is being added
    scale: [1, 1.04, 1],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

/** Animation variants for idle pulse effect */
const idlePulseVariants = {
  pulse: {
    scale: [1, 1.015, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut",
    },
  },
};

/** Animation variants for the member avatar container */
const memberAvatarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

/** Animation variants for individual member avatars */
const memberAvatarVariants = {
  hidden: { scale: 0, y: 15, opacity: 0 },
  visible: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 250, damping: 12 },
  },
};

/** Animation variants for the add member button */
const addMemberButtonVariants = {
  initial: { scale: 0, opacity: 0, rotate: -45 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 15, delay: 0.4 },
  },
  exit: { scale: 0, opacity: 0, rotate: 45, transition: { duration: 0.2 } },
  hover: { scale: 1.15, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  tap: { scale: 0.9, transition: { type: 'spring', stiffness: 400, damping: 15 } },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * GroupCircle - An interactive visual representation of a travel group
 * 
 * @example
 * <GroupCircle
 *   group={groupData}
 *   groupDisplaySize={280}
 *   isActive={false}
 *   layout="desktop"
 *   avatarLimit={5}
 *   currentTheme="light"
 *   onClick={handleGroupClick}
 *   onAddNewMember={handleAddMember}
 *   addingMemberInProgress={false}
 *   containerStyle={{ position: 'absolute', top: '50%', left: '50%' }}
 *   getMemberPositionStyle={(index, total, size) => ({ ... })}
 * />
 */
export function GroupCircle({
  group,
  groupDisplaySize,
  isActive,
  layout,
  avatarLimit,
  currentTheme,
  onClick,
  onAddNewMember,
  addingMemberInProgress,
  containerStyle,
  getMemberPositionStyle,
}: GroupCircleProps) {
  const textColor = getColorToken('TEXT', currentTheme);
  const mutedColor = getColorToken('MUTED', currentTheme);
  const componentBorderColor = getColorToken('BORDER', currentTheme);
  const surfaceColor = getColorToken('SURFACE', currentTheme);
  const addMemberButtonBg = '#7c83fd'; // Consider making this a theme token
  const addMemberButtonColor = 'white';

  // Cast to extended types with the extra properties we need
  const extendedGroup = group as ExtendedGroupWithStyle;
  const extendedMembers = group.members as ExtendedMemberData[];

  const avatarsToShow = extendedMembers.slice(0, avatarLimit);
  const extraAvatarsCount = extendedMembers.length - avatarLimit;
  const avatarSizeStyleProps = AVATAR_SIZE_STYLES[layout];

  const handleAddMemberClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent group click
    if (!addingMemberInProgress) {
      onAddNewMember(group.id);
    }
  };

  // Style definitions
  const groupInfoStyle: React.CSSProperties = {
    textAlign: 'center',
    zIndex: 10, // Above avatars if they overlap center
    padding: '0 0.5rem',
  };

  const emojiStyle: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '1.5rem' : '2rem',
    marginBottom: '0.25rem',
  };

  const nameStyle: React.CSSProperties = {
    fontWeight: 600,
    color: textColor,
    fontSize: layout === 'mobile' ? '1rem' : '1.25rem',
    marginBottom: '0.15rem',
  };

  const dateStyle: React.CSSProperties = {
    fontSize: layout === 'mobile' ? '0.75rem' : '0.9rem',
    color: mutedColor,
  };

  const addMemberButtonStyle: React.CSSProperties = {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: addMemberButtonBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: addMemberButtonColor,
    bottom: '8%',
    right: '8%',
    transform: 'translate(50%, 50%)', // To position icon relative to circle edge
    cursor: addingMemberInProgress ? 'default' : 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: `2px solid ${getColorToken('SURFACE', currentTheme)}`,
    zIndex: 30, // Above everything else in the circle
  };

  return (
    <motion.div
      style={{
        ...containerStyle, // Contains position, width, height from parent
        borderRadius: '50%',
        backgroundColor: surfaceColor,
        border: `${group.borderStyle} 2.5px ${componentBorderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      } as React.CSSProperties} // Type assertion for Framer Motion with CSS variables
      variants={mainCircleVariants}
      initial="initial"
      animate={[
        "animate",
        isActive ? "active" : "",
        addingMemberInProgress ? "adding" : ""
      ].filter(Boolean).join(" ") || "animate"} // Apply multiple variants
      whileHover="hover"
      role="button"
      tabIndex={0}
      aria-label={`Open group: ${group.name}`}
      aria-expanded={isActive}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      {/* Group info (center) */}
      <div style={groupInfoStyle}>
        <div style={emojiStyle}>{group.emoji}</div>
        <h3 style={nameStyle}>{group.name}</h3>
        <div style={dateStyle}>{extendedGroup.dateText}</div>
      </div>

      {/* Member avatars */}
      <motion.div
        variants={memberAvatarContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        {/* Regular avatars */}
        {avatarsToShow.map((member, idx) => (
          <motion.div key={member.id} variants={memberAvatarVariants}>
            <MemberAvatar
              member={member}
              styleProps={avatarSizeStyleProps}
              positionStyle={getMemberPositionStyle(idx, avatarsToShow.length, groupDisplaySize)}
              borderColor={surfaceColor}
            />
          </motion.div>
        ))}

        {/* +N extra avatars counter */}
        {extraAvatarsCount > 0 && (
          <motion.div variants={memberAvatarVariants}>
            <MemberAvatar
              isExtraCounter
              extraCount={extraAvatarsCount}
              styleProps={avatarSizeStyleProps}
              positionStyle={getMemberPositionStyle(
                avatarsToShow.length,
                avatarsToShow.length + 1,
                groupDisplaySize
              )}
              borderColor={surfaceColor}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Add member button */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            style={addMemberButtonStyle}
            variants={addMemberButtonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap="tap"
            onClick={handleAddMemberClick}
          >
            <UserPlus size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 