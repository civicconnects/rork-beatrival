import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Award, Users, LogOut, Crown, Gem, MessageCircle, Flag, HelpCircle, Video } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    router.replace('/(tabs)');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={theme.colors.gradients.electric}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {user.isPro && (
            <View style={styles.proBadge}>
              <Crown size={16} color="white" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        <View style={styles.profileHeader}>
          <Text style={styles.ageDisplay}>{user.age} | {user.ageGroup === '1-5' ? 'Grades 1-5' : user.ageGroup === '6-8' ? 'Grades 6-8' : user.ageGroup === '9-12' ? 'Grades 9-12' : user.ageGroup === '18-24' ? '18-24 Years' : '25+ Years'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.beatPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{user.rank}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        <View style={styles.gemsRow}>
          <View style={styles.gemsContainer}>
            <Gem size={20} color={theme.colors.warning} />
            <Text style={styles.gemsText}>{user.beatGems} BeatGems</Text>
          </View>
        </View>

        <View style={styles.socialStats}>
          <TouchableOpacity style={styles.socialStat}>
            <Text style={styles.socialValue}>{user.followers}</Text>
            <Text style={styles.socialLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialStat}>
            <Text style={styles.socialValue}>{user.following}</Text>
            <Text style={styles.socialLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Pro Upgrade */}
      {!user.isPro && (
        <View style={styles.proUpgrade}>
          <LinearGradient
            colors={theme.colors.gradients.fire}
            style={styles.proCard}
          >
            <Crown size={32} color="white" />
            <Text style={styles.proTitle}>Upgrade to BeatRival Pro</Text>
            <Text style={styles.proDescription}>
              • Ad-free experience{'\n'}
              • Exclusive AR filters{'\n'}
              • 2x BeatPoints earning{'\n'}
              • Pro profile badge
            </Text>
            <GradientButton
              title="Upgrade for $3.99/month"
              onPress={() => {}}
              gradient={['white', 'white']}
              textStyle={styles.proButtonText}
              style={styles.proButton}
            />
          </LinearGradient>
        </View>
      )}

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/achievements')}>
          <Award size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>My Achievements</Text>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementCount}>{user.achievements?.length || 0}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/crew')}>
          <Users size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>My Crew</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/fans')}>
          <Users size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>My Fans</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/messages')}>
          <MessageCircle size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
          <Settings size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
          <HelpCircle size={20} color={theme.colors.text} />
          <Text style={styles.menuText}>Help & FAQ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/live-test')}>
          <Video size={20} color={theme.colors.accent} />
          <Text style={[styles.menuText, { color: theme.colors.accent }]}>🔧 Test Agora Live Stream</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/report')}>
          <Flag size={20} color={theme.colors.warning} />
          <Text style={[styles.menuText, { color: theme.colors.warning }]}>Report Issue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={[styles.menuText, { color: theme.colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  noUserText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: theme.spacing.md,
  },
  proBadge: {
    position: 'absolute',
    top: 80,
    right: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  proText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  displayName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
  },
  username: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  socialStat: {
    alignItems: 'center',
  },
  socialValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  socialLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  proUpgrade: {
    padding: theme.spacing.md,
  },
  proCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  proTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  proDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  menu: {
    padding: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  menuText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ageDisplay: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  gemsRow: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  gemsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  achievementCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  proButtonText: {
    color: theme.colors.primary,
  },
  proButton: {
    marginTop: theme.spacing.md,
  },
});