import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Zap } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { useBattles } from '@/hooks/use-battles';
import { BattleCard } from '@/components/BattleCard';
import { theme } from '@/constants/theme';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function HomeScreen() {
  const { user, isOnboarded } = useAuth();
  const { battles, challenges } = useBattles();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  const liveBattles = battles.filter(b => b.status === 'live');
  const votingBattles = battles.filter(b => b.status === 'voting');
  const pendingChallenges = challenges.filter(c => c.status === 'pending');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{user?.displayName}!</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user?.wins || 0}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user?.beatPoints || 0}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>#{user?.rank || 0}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.challengeButton}
            onPress={() => router.push('/challenge')}
          >
            <Plus size={20} color="white" />
            <Text style={styles.challengeButtonText}>New Challenge</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Pending Challenges */}
        {pendingChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Pending Challenges</Text>
            </View>
            {pendingChallenges.map(challenge => (
              <TouchableOpacity
                key={challenge.id}
                style={styles.challengeCard}
                onPress={() => router.push('/challenge')}
              >
                <Text style={styles.challengeFrom}>
                  {challenge.from.displayName} challenged you!
                </Text>
                <View style={styles.challengeTags}>
                  {challenge.hashtags.map((tag, index) => (
                    <Text key={`${challenge.id}-${tag}-${index}`} style={styles.challengeTag}>{tag}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Live Battles */}
        {liveBattles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 Live Now</Text>
            {liveBattles.map(battle => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onPress={() => router.push(`/battle/${battle.id}`)}
              />
            ))}
          </View>
        )}

        {/* Voting Battles */}
        {votingBattles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗳️ Vote Now</Text>
            {votingBattles.map(battle => (
              <BattleCard
                key={battle.id}
                battle={battle}
                onPress={() => router.push(`/battle/${battle.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  welcomeCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
  },
  welcomeContent: {
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  username: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  challengeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  challengeCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  challengeFrom: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  challengeTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  challengeTag: {
    color: theme.colors.accent,
    fontSize: 12,
  },
});