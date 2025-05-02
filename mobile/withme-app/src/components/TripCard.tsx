import React from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Text } from './ui/Text';
import { Card } from './ui/Card';

export interface TripCardProps {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  dates?: { start?: string | null; end?: string | null };
  membersCount?: number;
  onPress?: (id: string) => void;
  style?: ViewStyle;
  compact?: boolean;
  location?: string;
}

export function TripCard({
  id,
  name,
  description,
  imageUrl,
  dates,
  membersCount,
  onPress,
  style,
  compact = false,
  location,
}: TripCardProps) {
  const theme = useTheme();

  // Format date range if available
  const formattedDateRange = React.useMemo(() => {
    if (!dates || (!dates.start && !dates.end)) return null;

    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const start = formatDate(dates.start);
    const end = formatDate(dates.end);

    if (start && end) return `${start} - ${end}`;
    if (start) return `From ${start}`;
    if (end) return `Until ${end}`;
    return null;
  }, [dates]);

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // Determine card height based on compact mode
  const cardHeight = compact ? 160 : 220;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.container, { height: cardHeight }, style]}
    >
      <Card variant="elevated" padding="none" style={styles.card}>
        {imageUrl ? (
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.imageBackground}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.overlay}>
              <View style={styles.contentContainer}>
                <Text
                  variant="h3"
                  weight="bold"
                  color="custom"
                  customColor="#fff"
                  numberOfLines={1}
                >
                  {name}
                </Text>

                {location && !compact && (
                  <Text
                    variant="body2"
                    color="custom"
                    customColor="rgba(255, 255, 255, 0.9)"
                    style={styles.location}
                  >
                    {location}
                  </Text>
                )}

                {formattedDateRange && (
                  <View style={styles.dateContainer}>
                    <Text variant="caption" weight="medium" color="custom" customColor="#fff">
                      {formattedDateRange}
                    </Text>
                  </View>
                )}

                {membersCount !== undefined && membersCount > 0 && !compact && (
                  <View style={styles.membersContainer}>
                    <Text variant="caption" color="custom" customColor="#fff">
                      {membersCount} {membersCount === 1 ? 'member' : 'members'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.noImageContainer, { backgroundColor: theme.colors.travelPurple }]}>
            <View style={styles.contentContainer}>
              <Text variant="h3" weight="bold" color="custom" customColor="#fff" numberOfLines={1}>
                {name}
              </Text>

              {location && !compact && (
                <Text
                  variant="body2"
                  color="custom"
                  customColor="rgba(255, 255, 255, 0.9)"
                  style={styles.location}
                >
                  {location}
                </Text>
              )}

              {formattedDateRange && (
                <View style={styles.dateContainer}>
                  <Text variant="caption" weight="medium" color="custom" customColor="#fff">
                    {formattedDateRange}
                  </Text>
                </View>
              )}

              {membersCount !== undefined && membersCount > 0 && !compact && (
                <View style={styles.membersContainer}>
                  <Text variant="caption" color="custom" customColor="#fff">
                    {membersCount} {membersCount === 1 ? 'member' : 'members'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  contentContainer: {
    padding: 16,
  },
  location: {
    marginTop: 4,
  },
  dateContainer: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  membersContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
