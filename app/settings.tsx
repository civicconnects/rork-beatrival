import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Shield, User, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [battleNotifications, setBattleNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightElement }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color={theme.colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon={User}
            title="Profile Settings"
            subtitle="Edit your profile information"
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
          />
          <SettingItem
            icon={Shield}
            title="Privacy & Safety"
            subtitle="Manage your privacy settings"
            rightElement={
              <Switch
                value={privateProfile}
                onValueChange={setPrivateProfile}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              />
            }
          />
          <SettingItem
            icon={Bell}
            title="Battle Invites"
            subtitle="Get notified of new battle invites"
            rightElement={
              <Switch
                value={battleNotifications}
                onValueChange={setBattleNotifications}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              />
            }
          />
          <SettingItem
            icon={Bell}
            title="Messages"
            subtitle="Get notified of new messages"
            rightElement={
              <Switch
                value={messageNotifications}
                onValueChange={setMessageNotifications}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon={HelpCircle}
            title="Help & FAQ"
            subtitle="Get help and find answers"
            onPress={() => router.push('/help')}
          />
          <SettingItem
            icon={Shield}
            title="Report Issue"
            subtitle="Report a problem or bug"
            onPress={() => router.push('/report')}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon={LogOut}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BeatRival v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for dancers worldwide</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  settingItem: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  settingSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
});