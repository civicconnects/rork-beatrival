import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, TrendingUp, Award } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { mockLeaderboard, ageGroups } from '@/mocks/data';
import { UserAvatar } from '@/components/UserAvatar';
import { AgeGroup } from '@/types';

export default function LeaderboardScreen() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('18-24');

  return (
    <View style={styles.container}>
      {/* Age Group Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ageSelector}
        contentContainerStyle={styles.ageSelectorContent}
      >
        {ageGroups.map((group) => (
          <TouchableOpacity
            key={group.value}
            onPress={() => setSelectedAgeGroup(group.value)}
            style={[
              styles.ageTab,
              selectedAgeGroup === group.value && styles.ageTabActive,
            ]}
          >
            <Text
              style={[
                styles.ageTabText,
                selectedAgeGroup === group.value && styles.ageTabTextActive,
              ]}
            >
              {group.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top 3 */}
        <LinearGradient
          colors={theme.colors.gradients.neon}
          style={styles.topThree}
        >
          <Trophy size={32} color="white" />
          <Text style={styles.topThreeTitle}>Top Dancers</Text>
          
          <View style={styles.podium}>
            {mockLeaderboard.slice(0, 3).map((entry, index) => (
              <View key={entry.user.id} style={[styles.podiumSpot, index === 0 && styles.firstPlace]}>
                <UserAvatar
                  uri={entry.user.avatar}
                  size={index === 0 ? 80 : 64}
                  rank={entry.rank}
                  isPro={entry.user.isPro}
                  verified={entry.user.verified}
                />
                <Text style={styles.podiumName}>{entry.user.username}</Text>
                <Text style={styles.podiumPoints}>{entry.beatPoints} pts</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Rest of Leaderboard */}
        <View style={styles.leaderboardList}>
          {mockLeaderboard.slice(3).map((entry) => (
            <View key={entry.user.id} style={styles.leaderboardItem}>
              <Text style={styles.rank}>#{entry.rank}</Text>
              
              <UserAvatar
                uri={entry.user.avatar}
                size={48}
                isPro={entry.user.isPro}
                verified={entry.user.verified}
              />
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{entry.user.displayName}</Text>
                <Text style={styles.userStats}>
                  {entry.winRate}% Win Rate • {entry.streak} Streak
                </Text>
              </View>
              
              <View style={styles.points}>
                <Text style={styles.pointsValue}>{entry.beatPoints}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  ageSelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  ageSelectorContent: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  ageTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  ageTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  ageTabText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  ageTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  topThree: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  topThreeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'flex-end',
  },
  podiumSpot: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginBottom: theme.spacing.md,
  },
  podiumName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  podiumPoints: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  leaderboardList: {
    padding: theme.spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  rank: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    width: 40,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  userStats: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  points: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  pointsLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
});