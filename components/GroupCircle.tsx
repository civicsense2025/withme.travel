import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { MemberAvatar } from './MemberAvatar';
import {
  GroupWithStyle,
  LayoutType,
  MemberData,
  AVATAR_SIZE_STYLES,
} from '@/utils/constants/groupCirclesConstants'; // Adjust path
import { ThemeMode, getColorToken } from '@/utils/constants/design-system'; // Adjust path

interface GroupCircleProps {
  group: GroupWithStyle;
  groupDisplaySize: number; // Calculated size for this specific circle
  isActive: boolean;
  layout: LayoutType;
  avatarLimit: number;
  currentTheme: ThemeMode;
  onClick: () => void;
  onAddNewMember: (groupId: string) => void;
  addingMemberInProgress: boolean;
  // Calculated styles from parent
  containerStyle: React.CSSProperties;
  getMemberPositionStyle: (index: number, totalMembers: number, groupSize: number) => React.CSSProperties;
}

// Animation Variants
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
    // Potentially a subtle pulse or other continuous animation here if desired
    // Example: transition: { scale: { yoyo: Infinity, duration: 0.8, ease: "easeInOut" } }
  },
  adding: { // New variant for when a member is being added
    scale: [1, 1.04, 1],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

const idlePulseVariants = {
  pulse: {
    scale: [1, 1.015, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "mirror" as const, // Use "mirror" for smoother back and forth
      ease: "easeInOut",
    },
  },
};

const memberAvatarContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Stagger effect for avatars
      delayChildren: 0.3, // Delay after parent circle animates in
    },
  },
};

const memberAvatarVariants = {
  hidden: { scale: 0, y: 15, opacity: 0 },
  visible: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 250, damping: 12 },
  },
};

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

export const GroupCircle: React.FC<GroupCircleProps> = ({
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
}) => {
  const textColor = getColorToken('TEXT', currentTheme);
  const mutedColor = getColorToken('MUTED', currentTheme);
  const componentBorderColor = getColorToken('BORDER', currentTheme);
  const surfaceColor = getColorToken('SURFACE', currentTheme);
  const addMemberButtonBg = '#7c83fd'; // Consider making this a theme token
  const addMemberButtonColor = 'white';

  const avatarsToShow = group.members.slice(0, avatarLimit);
  const extraAvatarsCount = group.members.length - avatarLimit;
  const avatarSizeStyleProps = AVATAR_SIZE_STYLES[layout];

  const handleAddMemberClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent group click
    if (!addingMemberInProgress) {
      onAddNewMember(group.id);
    }
  };

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
    border: `2px solid ${getColorToken('SURFACE', currentTheme)}`, // Or a specific border color like 'white'
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
      {/* Group Info */}
      <div style={groupInfoStyle}>
        <motion.div style={emojiStyle} variants={idlePulseVariants} animate="pulse">{group.emoji}</motion.div>
        <h3 style={nameStyle}>{group.name}</h3>
        <p style={dateStyle}>{group.date}</p>
      </div>

      {/* Member Avatars Container - for positioning context */}
      <motion.div
        style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}
        variants={memberAvatarContainerVariants}
        initial="hidden"
        animate={isActive || layout === 'mobile' ? "visible" : "hidden"}
      >
        {avatarsToShow.map((member, idx) => (
          <motion.div
            key={`${group.id}-member-${idx}`}
            variants={memberAvatarVariants}
          >
            <MemberAvatar
              member={member}
              styleProps={avatarSizeStyleProps}
              positionStyle={getMemberPositionStyle(idx, avatarsToShow.length, groupDisplaySize)}
              borderColor={surfaceColor}
            />
          </motion.div>
        ))}
        {extraAvatarsCount > 0 && (
          <motion.div
            variants={memberAvatarVariants}
          >
            <MemberAvatar
              isExtraCounter
              extraCount={extraAvatarsCount}
              styleProps={avatarSizeStyleProps}
              positionStyle={getMemberPositionStyle(avatarsToShow.length, avatarsToShow.length + 1, groupDisplaySize)}
              borderColor={surfaceColor}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Add Member Button */}
      <AnimatePresence>
        {isActive && layout !== 'mobile' && (
          <motion.div
            key={`${group.id}-add-member-btn`}
            variants={addMemberButtonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover={!addingMemberInProgress ? "hover" : ""}
            whileTap={!addingMemberInProgress ? "tap" : ""}
            style={addMemberButtonStyle}
            onClick={handleAddMemberClick}
            role="button"
            aria-label="Add new member"
          >
            <UserPlus size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 