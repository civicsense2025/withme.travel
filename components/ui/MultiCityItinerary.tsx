'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { useTheme } from 'next-themes';
import { COLORS, ThemeMode, getColorToken, SHADOWS } from '@/utils/constants/design-system';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface CityItem {
  id: number;
  type: string;
  name: string;
  time: string;
  votes: number;
}

export interface City {
  id: number;
  name: string;
  emoji: string;
  color: string;
  items: CityItem[];
}

export interface MultiCityItineraryProps {
  initialCities?: City[];
  mode?: ThemeMode;
  disablePopup?: boolean;
  withBackground?: boolean;
}

export function MultiCityItinerary({ initialCities, mode, disablePopup = false, withBackground = true }: MultiCityItineraryProps) {
  const { resolvedTheme } = useTheme();
  const currentTheme = mode || (resolvedTheme as ThemeMode) || 'light';

  const defaultCities: City[] = [
    {
      id: 1,
      name: 'Barcelona',
      emoji: '🇪🇸',
      color: 'bg-travel-purple',
      items: [
        { id: 1, type: 'activity', name: 'Morning coffee at El Born', time: '09:00 AM', votes: 3 },
        { id: 2, type: 'sight', name: 'Sagrada Familia', time: '11:30 AM', votes: 5 },
        { id: 3, type: 'restaurant', name: 'Tapas at La Bombeta', time: '08:00 PM', votes: 4 },
      ],
    },
    {
      id: 2,
      name: 'Madrid',
      emoji: '🇪🇸',
      color: 'bg-travel-blue',
      items: [
        { id: 1, type: 'museum', name: 'Prado Museum', time: '10:00 AM', votes: 6 },
        { id: 2, type: 'sight', name: 'Royal Palace', time: '02:30 PM', votes: 4 },
        { id: 3, type: 'restaurant', name: 'Dinner at Botín', time: '09:00 PM', votes: 5 },
      ],
    },
    {
      id: 3,
      name: 'Seville',
      emoji: '🇪🇸',
      color: 'bg-travel-pink',
      items: [
        { id: 1, type: 'activity', name: 'Alcázar Palace', time: '09:30 AM', votes: 4 },
        { id: 2, type: 'sight', name: 'Plaza de España', time: '02:00 PM', votes: 6 },
        { id: 3, type: 'restaurant', name: 'Tapas in Triana', time: '08:00 PM', votes: 7 },
      ],
    },
  ];

  const [cities, setCities] = useState(initialCities || defaultCities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCity, setActiveCity] = useState(1);
  const [newItem, setNewItem] = useState({ type: 'activity', name: '', time: '' });
  const [isAdding, setIsAdding] = useState(false);

  const itemTypes = [
    { type: 'activity', emoji: '☕', label: 'Activity' },
    { type: 'sight', emoji: '📍', label: 'Sight' },
    { type: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
    { type: 'accommodation', emoji: '🏨', label: 'Accommodation' },
    { type: 'transport', emoji: '🎫', label: 'Transport' },
    { type: 'sunset', emoji: '🌇', label: 'Sunset' },
    { type: 'museum', emoji: '🏛️', label: 'Museum' },
    { type: 'water', emoji: '🚢', label: 'Water' },
  ];

  const addNewItem = () => {
    setIsAdding(true);
    setTimeout(() => {
      setCities((prev) =>
        prev.map((city) => {
          if (city.id === activeCity) {
            const currentItems = [...city.items];
            if (currentItems.length >= 3) {
              currentItems.shift();
            }
            return {
              ...city,
              items: [
                ...currentItems,
                {
                  id: Date.now(),
                  type: newItem.type,
                  name: newItem.name || 'New awesome place',
                  time: newItem.time || '03:00 PM',
                  votes: 0,
                },
              ],
            };
          }
          return city;
        })
      );
      setNewItem({ type: 'activity', name: '', time: '' });
      setIsDialogOpen(false);
      setIsAdding(false);
    }, 600);
  };

  useEffect(() => {
    if (disablePopup) return;
    const demoItems = [
      { type: 'sight', name: 'Park Güell views', time: '02:30 PM' },
      { type: 'restaurant', name: 'Tapas at El Nacional', time: '08:30 PM' },
      { type: 'museum', name: 'Picasso Museum', time: '11:00 AM' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < demoItems.length) {
        setNewItem(demoItems[index]);
        setIsDialogOpen(true);
        setTimeout(() => {
          addNewItem();
        }, 1500);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disablePopup]);

  const getCityColor = (id: number) => {
    const city = cities.find((city) => city.id === id);
    return city?.color || 'bg-gray-100';
  };

  // Get icon for item type
  const getItemTypeIcon = (type: string) => {
    const itemType = itemTypes.find((item) => item.type === type);
    return itemType ? <span className="text-xl">{itemType.emoji}</span> : <span className="text-xl">☕</span>;
  };

  // Design token helpers
  const trueDark = currentTheme === 'dark';
  // ============================================================================
  // THEME EXTENSION TOKENS (DESIGN SYSTEM-COMPLIANT)
  // ============================================================================

  /**
   * Extended theme color tokens for MultiCityItinerary component.
   * Uses design system tokens from utils/constants/design-system for consistency.
   * Avoids hardcoded values; all colors reference the COLORS, SHADOWS, etc.
   */

  /**
   * Keys for extended theme tokens used in this component.
   */
  type ExtendedToken =
    | 'BUTTON_BG'
    | 'BUTTON_TEXT'
    | 'BUTTON_TEXT_ACTIVE'
    | 'BADGE_BG'
    | 'BADGE_BORDER'
    | 'BADGE_TEXT'
    | 'BADGE_BG_MUTED'
    | 'DIALOG_BG'
    | 'INPUT_BG'
    | 'INPUT_TEXT'
    | 'INPUT_BORDER'
    | 'PRIMARY_BG'
    | 'SHADOW_MD';

  /**
   * Extended theme tokens mapped to design system variables.
   * All values are derived from COLORS and SHADOWS, not hardcoded.
   */
  const themeExtensions: Record<'light' | 'dark', Record<ExtendedToken, string>> = {
    light: {
      BUTTON_BG: COLORS.light.SUBTLE, // subtle pastel background
      BUTTON_TEXT: COLORS.light.TEXT,
      BUTTON_TEXT_ACTIVE: COLORS.light.TEXT,
      BADGE_BG: COLORS.light.PRIMARY, // pastel indigo as badge background
      BADGE_BORDER: COLORS.light.BORDER,
      BADGE_TEXT: COLORS.light.PRIMARY,
      BADGE_BG_MUTED: COLORS.light.BACKGROUND,
      DIALOG_BG: COLORS.light.BACKGROUND,
      INPUT_BG: COLORS.light.SURFACE,
      INPUT_TEXT: COLORS.light.TEXT,
      INPUT_BORDER: COLORS.light.BORDER,
      PRIMARY_BG: COLORS.light.PRIMARY,
      SHADOW_MD: SHADOWS.md,
    },
    dark: {
      BUTTON_BG: COLORS.dark.SURFACE,
      BUTTON_TEXT: COLORS.dark.TEXT,
      BUTTON_TEXT_ACTIVE: COLORS.dark.TEXT,
      BADGE_BG: COLORS.dark.PRIMARY,
      BADGE_BORDER: COLORS.dark.BORDER,
      BADGE_TEXT: COLORS.light.PRIMARY,
      BADGE_BG_MUTED: COLORS.dark.BACKGROUND,
      DIALOG_BG: COLORS.dark.BACKGROUND,
      INPUT_BG: COLORS.dark.SURFACE,
      INPUT_TEXT: COLORS.dark.TEXT,
      INPUT_BORDER: COLORS.dark.BORDER,
      PRIMARY_BG: COLORS.dark.PRIMARY,
      SHADOW_MD: SHADOWS.md,
    },
  };

  // Helper function to get extended theme tokens
  const getExtendedToken = (tokenName: keyof typeof themeExtensions.light): string => {
    return themeExtensions[currentTheme][tokenName];
  };

  // Use design tokens for all style helpers
  const getCityButtonStyle = (city: City): React.CSSProperties => {
    const isActive = activeCity === city.id;
    return {
      minWidth: 110, // Fixed min width to prevent jump
      boxSizing: 'border-box',
      background: isActive
        ? getColorToken('SURFACE', currentTheme)
        : getExtendedToken('BUTTON_BG'),
      color: isActive
        ? getColorToken('TEXT', currentTheme)
        : getExtendedToken('BUTTON_TEXT'),
      border: isActive
        ? `1px solid ${getColorToken('BORDER', currentTheme)}`
        : `1px solid transparent`,
      fontWeight: isActive ? 600 : 400,
      transition: 'all 0.15s ease-in-out',
    };
  };

  const getItemCardStyle = (): React.CSSProperties => ({
    background: getColorToken('SURFACE', currentTheme),
    color: getColorToken('TEXT', currentTheme),
    borderColor: getColorToken('BORDER', currentTheme),
  });

  const getBadgeStyle = (): React.CSSProperties => ({
    background: getExtendedToken('BADGE_BG'),
    borderColor: getExtendedToken('BADGE_BORDER'),
    color: getColorToken('TEXT', currentTheme),
    fontWeight: 600,
  });

  const getMutedTextStyle = (): React.CSSProperties => ({
    color: getColorToken('MUTED', currentTheme),
  });

  const getDialogStyle = (): React.CSSProperties => ({
    background: getExtendedToken('DIALOG_BG'),
    color: getColorToken('TEXT', currentTheme),
    borderColor: getColorToken('BORDER', currentTheme),
  });

  const getInputStyle = (): React.CSSProperties => ({
    background: getExtendedToken('INPUT_BG'),
    color: getExtendedToken('INPUT_TEXT'),
    borderColor: getExtendedToken('INPUT_BORDER'),
  });

  const getButtonStyle = (cityId: number): React.CSSProperties => {
    if (activeCity === cityId) {
      return {
        background: `var(--${getCityColor(cityId).replace('bg-', '')})`,
        color: getExtendedToken('BUTTON_TEXT_ACTIVE'),
      };
    }
    return {
      background: getExtendedToken('BUTTON_BG'),
      color: getExtendedToken('BUTTON_TEXT'),
    };
  };

  const getPlusButtonStyle = (cityId: number): React.CSSProperties => ({
    background: `var(--${getCityColor(cityId).replace('bg-', '')}, ${getExtendedToken('PRIMARY_BG')})`,
    color: getColorToken('PRIMARY', currentTheme),
  });

  const getMutedBadgeStyle = (): React.CSSProperties => ({
    background: getExtendedToken('BADGE_BG_MUTED'),
    color: getColorToken('MUTED', currentTheme),
  });

  const getSurfaceStyle = (): React.CSSProperties => ({
    background: getColorToken('SURFACE', currentTheme),
  });

  const getCardFooterStyle = (): React.CSSProperties => ({
    borderTop: `1px solid ${getColorToken('BORDER', currentTheme)}`,
    background: getColorToken('SURFACE', currentTheme),
  });

  const getDialogFooterStyle = (): React.CSSProperties => ({
    borderTop: `1px solid ${getColorToken('BORDER', currentTheme)}`,
  });

  const getLabelStyle = (): React.CSSProperties => ({
    color: getColorToken('TEXT', currentTheme),
  });

  const getActivityTypeButtonStyle = (selected: boolean, cityId: number): React.CSSProperties => {
    if (selected) {
      return {
        background: `var(--${getCityColor(cityId).replace('bg-', '')})`,
        color: getExtendedToken('BUTTON_TEXT_ACTIVE'),
      };
    }
    return {
      background: getExtendedToken('BUTTON_BG'),
      color: getExtendedToken('BUTTON_TEXT'),
    };
  };

  const getEmptyStateStyle = (): React.CSSProperties => ({
    color: getColorToken('MUTED', currentTheme),
  });

  // Animation variants for staggered entry/exit
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.13,
        staggerDirection: 1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.10,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 32 } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.18 } },
  };

  // Update the card style to support background toggling
  const getCardStyle = (): React.CSSProperties => {
    return {
      backgroundColor: withBackground 
        ? getColorToken('BACKGROUND', currentTheme) 
        : 'transparent',
      border: withBackground 
        ? `1px solid ${getColorToken('BORDER', currentTheme)}` 
        : 'none',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: withBackground 
        ? getExtendedToken('SHADOW_MD') 
        : 'none',
      transition: 'all 0.2s ease-in-out',
      maxWidth: '100%',
    };
  };

  // --- RENDER ---
  return (
    <div style={getCardStyle()}>
      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Trip date */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '16px',
              fontWeight: 500,
              fontSize: '14px',
              background: getColorToken('SUBTLE', currentTheme),
              color: getColorToken('MUTED', currentTheme),
            }}
          >
            ✈️ Trip: Oct 15-24, 2025
          </div>
        </div>

        {/* City name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 700,
              color: getColorToken('TEXT', currentTheme),
            }}
          >
            Discover Europe
          </h3>
          <div style={{ fontSize: '14px', color: getColorToken('MUTED', currentTheme) }}>
            Plan your perfect adventure across cities
          </div>
        </div>

        <CardContent className="pb-0" style={getSurfaceStyle()}>
          <div className="flex space-x-3 mb-6 overflow-x-auto pb-4 scrollbar-hide">
            {cities.map((city) => (
              <button
                key={city.id}
                className="px-4 mt-2 ml-2 py-1 rounded-full text-sm font-medium flex items-center space-x-1.5 focus:outline-none focus:ring-2 transition-all"
                style={getCityButtonStyle(city)}
                onClick={() => setActiveCity(city.id)}
                aria-pressed={activeCity === city.id}
                tabIndex={0}
              >
                <span className="text-base">{city.emoji}</span>
                <span>{city.name}</span>
              </button>
            ))}
          </div>

          {/* Fixed height container for city content */}
          <div className="space-y-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {cities
                .filter((city) => city.id === activeCity)
                .map((city) => (
                  <motion.div
                    key={city.id}
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {city.items.map((item) => (
                      <motion.div
                        key={item.id}
                        className="p-4 rounded-lg border transition-all hover:shadow-sm"
                        style={getItemCardStyle()}
                        variants={itemVariants}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="rounded-full p-2 flex-shrink-0 text-xl"
                              style={getPlusButtonStyle(city.id)}
                            >
                              {getItemTypeIcon(item.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-base" style={getLabelStyle()}>
                                {item.name}
                              </h4>
                              <div
                                className="flex items-center text-xs mt-1"
                                style={getMutedTextStyle()}
                              >
                                {item.time}
                              </div>
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={getMutedBadgeStyle()}
                          >
                            <span className="mr-0.5">💗</span>
                            {item.votes}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {city.items.length === 0 && (
                      <motion.div
                        className="text-center py-8"
                        style={getEmptyStateStyle()}
                        variants={itemVariants}
                      >
                        <p>No activities added yet.</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter
          className="flex justify-between"
          style={getCardFooterStyle()}
        >
          <div
            className="text-xs flex items-center gap-1"
            style={getMutedTextStyle()}
          >
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            Edit All <span>➡️</span>
          </Button>
        </CardFooter>
      </div>

      {/* Add Activity Dialog */}
      {!disablePopup && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md" style={getDialogStyle()}>
            <DialogHeader>
              <DialogTitle style={getLabelStyle()}>Add Activity</DialogTitle>
              <DialogDescription style={getMutedTextStyle()}>
                Add a new activity to {cities.find((c) => c.id === activeCity)?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-name" style={getLabelStyle()}>
                  Activity Name
                </Label>
                <Input
                  id="activity-name"
                  placeholder="E.g., Visit La Sagrada Familia"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  style={getInputStyle()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-time" style={getLabelStyle()}>
                  Time
                </Label>
                <Input
                  id="activity-time"
                  placeholder="E.g., 10:00 AM"
                  value={newItem.time}
                  onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                  style={getInputStyle()}
                />
              </div>

              <div className="space-y-2">
                <Label style={getLabelStyle()}>Activity Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {itemTypes.map((type) => (
                    <Button
                      key={type.type}
                      type="button"
                      variant={newItem.type === type.type ? 'primary' : 'outline'}
                      size="sm"
                      className="justify-start gap-2"
                      style={getActivityTypeButtonStyle(newItem.type === type.type, activeCity)}
                      onClick={() => setNewItem({ ...newItem, type: type.type })}
                    >
                      {type.emoji}
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter style={getDialogFooterStyle()}>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={addNewItem}
                disabled={isAdding}
                className={getCityColor(activeCity)}
                style={getButtonStyle(activeCity)}
              >
                {isAdding ? <>Adding...</> : <>Add Activity</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default MultiCityItinerary;
