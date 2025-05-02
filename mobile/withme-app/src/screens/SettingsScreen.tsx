import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: any) {
  const { user, profile, signOut } = useAuth();
  const theme = useTheme();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* User Info Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.userInfoContainer}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {profile?.name
                ? profile.name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userTextContainer}>
            <Text variant="h3" style={{ color: theme.colors.foreground }}>
              {profile?.name || 'User'}
            </Text>
            <Text variant="body2" style={{ color: theme.colors.mutedForeground }}>
              {user?.email || ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={22} color={theme.colors.foreground} />
          <Text variant="body1" style={[styles.settingText, { color: theme.colors.foreground }]}>
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* App Settings Section */}
      <Text
        variant="caption"
        style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}
      >
        APP SETTINGS
      </Text>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.foreground} />
          <Text variant="body1" style={[styles.settingText, { color: theme.colors.foreground }]}>
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
          onPress={() => navigation.navigate('Appearance')}
        >
          <Ionicons name="color-palette-outline" size={22} color={theme.colors.foreground} />
          <Text variant="body1" style={[styles.settingText, { color: theme.colors.foreground }]}>
            Appearance
          </Text>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Ionicons name="shield-outline" size={22} color={theme.colors.foreground} />
          <Text variant="body1" style={[styles.settingText, { color: theme.colors.foreground }]}>
            Privacy
          </Text>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('UIShowcase')}
        >
          <Ionicons name="color-wand-outline" size={22} color={theme.colors.foreground} />
          <Text
            style={{ flex: 1, marginLeft: 16, color: theme.colors.foreground }}
          >
            UI Components
          </Text>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <Text
        variant="caption"
        style={[styles.sectionTitle, { color: theme.colors.mutedForeground }]}
      >
        ACCOUNT
      </Text>
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.destructive} />
          <Text variant="body1" style={[styles.settingText, { color: theme.colors.destructive }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfoContainer}>
        <Text
          variant="caption"
          style={{ color: theme.colors.mutedForeground, textAlign: 'center' }}
        >
          WithMe.Travel v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  sectionTitle: {
    marginLeft: 24,
    marginBottom: 8,
    marginTop: 8,
  },
  userInfoContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  userTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  appInfoContainer: {
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
});
