import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function FansScreen() {
  const { user } = useAuth();

  const mockFans = [
    {
      id: '1',
      displayName: 'DanceKing23',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      followedAt: new Date('2024-01-15'),
    },
    {
      id: '2', 
      displayName: 'RhythmQueen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      followedAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      displayName: 'BreakMaster',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      followedAt: new Date('2024-01-08'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Fans</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <Users size={32} color={theme.colors.primary} />
          <Text style={styles.statsNumber}>{user?.followers || 0}</Text>
          <Text style={styles.statsLabel}>Total Fans</Text>
        </View>

        <View style={styles.fansList}>
          <Text style={styles.sectionTitle}>Recent Fans</Text>
          {mockFans.map((fan) => (
            <View key={fan.id} style={styles.fanItem}>
              <View style={styles.fanAvatar}>
                <Text style={styles.fanAvatarText}>{fan.displayName[0]}</Text>
              </View>
              <View style={styles.fanInfo}>
                <Text style={styles.fanName}>{fan.displayName}</Text>
                <Text style={styles.fanDate}>
                  Followed on {fan.followedAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {mockFans.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Fans Yet</Text>
            <Text style={styles.emptyDescription}>
              Start battling and creating amazing content to gain fans!
            </Text>
          </View>
        )}
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
    padding: theme.spacing.md,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsNumber: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: theme.spacing.sm,
  },
  statsLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  fansList: {
    gap: theme.spacing.sm,
  },
  fanItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fanAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  fanAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  fanInfo: {
    flex: 1,
  },
  fanName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  fanDate: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});