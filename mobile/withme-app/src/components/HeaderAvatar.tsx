import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Text } from './ui';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function HeaderAvatar() {
  const { user, profile } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Settings');
  };

  // Get first letter of name or email for avatar
  const getInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Get name for greeting
  const getFirstName = () => {
    if (profile?.name) {
      return profile.name.split(' ')[0]; // Get first part of name
    }
    return 'there'; // Fallback
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.avatarContainer, { backgroundColor: theme.colors.travelPurple }]}>
        <Text style={styles.avatarText}>{getInitial()}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text variant="caption" style={[styles.greeting, { color: theme.colors.mutedForeground }]}>
          Hi,
        </Text>
        <Text
          variant="subtitle1"
          weight="semibold"
          style={[styles.name, { color: theme.colors.foreground }]}
          numberOfLines={1}
        >
          {getFirstName()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textContainer: {
    marginLeft: 8,
    maxWidth: 100, // Limit width to avoid overflow
  },
  greeting: {
    fontSize: 12,
    lineHeight: 14,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
  },
});
