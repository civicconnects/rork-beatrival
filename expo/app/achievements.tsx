import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { Achievement } from '@/types';

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return theme.colors.textMuted;
    case 'rare': return theme.colors.accent;
    case 'epic': return theme.colors.secondary;
    case 'legendary': return theme.colors.warning;
    default: return theme.colors.textMuted;
  }
};

const getRarityGradient = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return ['#808080', '#606060'] as const;
    case 'rare': return [theme.colors.accent, '#E85D04'] as const;
    case 'epic': return [theme.colors.secondary, '#6A4C93'] as const;
    case 'legendary': return [theme.colors.warning, '#F77F00'] as const;
    default: return ['#808080', '#606060'] as const;
  }
};

export default function AchievementsScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noUserText}>Please log in to view achievements</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            You&apos;ve unlocked {user.achievements.length} achievements!
          </Text>
        </View>

        <View style={styles.achievementsList}>
          {user.achievements.map((achievement) => (
            <LinearGradient
              key={achievement.id}
              colors={getRarityGradient(achievement.rarity)}
              style={styles.achievementCard}
            >
              <View style={styles.achievementContent}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={[styles.achievementRarity, { color: getRarityColor(achievement.rarity) }]}>
                      {achievement.rarity.toUpperCase()}
                    </Text>
                    <Text style={styles.achievementDate}>
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          ))}
        </View>

        {user.achievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>No Achievements Yet</Text>
            <Text style={styles.emptyDescription}>
              Start battling to unlock your first achievement!
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
  summary: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  summaryText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementsList: {
    gap: theme.spacing.md,
  },
  achievementCard: {
    borderRadius: theme.borderRadius.lg,
    padding: 2,
  },
  achievementContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: theme.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  achievementDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementRarity: {
    fontSize: 12,
    fontWeight: '700',
  },
  achievementDate: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  noUserText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});