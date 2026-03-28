import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Eye, Trophy, Music, Activity } from 'lucide-react-native';
import { Battle } from '@/types';
import { theme } from '@/constants/theme';

interface BattleCardProps {
  battle: Battle;
  onPress: () => void;
}

export const BattleCard: React.FC<BattleCardProps> = ({ battle, onPress }) => {
  const isLive = battle.status === 'live';
  const isVoting = battle.status === 'voting';
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={isLive ? theme.colors.gradients.fire : ['#2A2A2A', '#1A1A1A']}
        style={styles.container}
      >
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <View style={styles.battleType}>
              {battle.battleType === 'sing' ? (
                <Music size={14} color={theme.colors.accent} />
              ) : (
                <Activity size={14} color={theme.colors.accent} />
              )}
              <Text style={styles.battleTypeText}>
                {battle.battleType === 'sing' ? 'Singing' : 'Dance'}
              </Text>
            </View>
            <View style={styles.hashtags}>
              {battle.hashtags.slice(0, 2).map((tag, index) => (
                <Text key={`${battle.id}-tag-${index}-${tag}`} style={styles.hashtag}>{tag}</Text>
              ))}
            </View>
          </View>
          <View style={styles.viewers}>
            <Eye size={14} color={theme.colors.textSecondary} />
            <Text style={styles.viewerCount}>{battle.viewers}</Text>
          </View>
        </View>

        <View style={styles.fighters}>
          <View style={styles.fighter}>
            <Image source={{ uri: battle.challenger.avatar }} style={styles.avatar} />
            <Text style={styles.username} numberOfLines={1}>
              {battle.challenger.username}
            </Text>
            {battle.challenger.verified && <Trophy size={12} color={theme.colors.warning} />}
          </View>
          
          <View style={styles.vs}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          
          <View style={styles.fighter}>
            <Image source={{ uri: battle.opponent.avatar }} style={styles.avatar} />
            <Text style={styles.username} numberOfLines={1}>
              {battle.opponent.username}
            </Text>
            {battle.opponent.verified && <Trophy size={12} color={theme.colors.warning} />}
          </View>
        </View>

        {isVoting && (
          <View style={styles.votes}>
            <View style={styles.voteBar}>
              <LinearGradient
                colors={theme.colors.gradients.electric}
                style={[
                  styles.voteProgress,
                  {
                    width: `${(battle.votes.challenger / (battle.votes.challenger + battle.votes.opponent)) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.voteCount}>
              <Text style={styles.voteText}>{battle.votes.challenger}</Text>
              <Text style={styles.voteText}>{battle.votes.opponent}</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  liveIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  leftHeader: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  battleType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  battleTypeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hashtags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  hashtag: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerCount: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  fighters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fighter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  username: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  vs: {
    paddingHorizontal: theme.spacing.md,
  },
  vsText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  votes: {
    marginTop: theme.spacing.md,
  },
  voteBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  voteProgress: {
    height: '100%',
    borderRadius: 2,
  },
  voteCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  voteText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
});