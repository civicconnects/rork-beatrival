import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Eye, ThumbsUp } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useBattles } from '@/hooks/use-battles';
import { GradientButton } from '@/components/GradientButton';

export default function BattleScreen() {
  const { id } = useLocalSearchParams();
  const { battles, vote } = useBattles();
  const [timeLeft, setTimeLeft] = useState(180);
  const [hasVoted, setHasVoted] = useState(false);
  
  const battle = battles.find(b => b.id === id);

  useEffect(() => {
    if (battle?.status === 'lobby') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [battle?.status]);

  if (!battle) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Battle not found</Text>
      </View>
    );
  }

  const handleVote = (side: 'challenger' | 'opponent') => {
    vote(battle.id, side);
    setHasVoted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.viewers}>
          <Eye size={16} color={theme.colors.textSecondary} />
          <Text style={styles.viewerCount}>{battle.viewers} watching</Text>
        </View>
      </View>

      {/* Battle Status */}
      {battle.status === 'lobby' && (
        <LinearGradient
          colors={theme.colors.gradients.fire}
          style={styles.lobbyContainer}
        >
          <Text style={styles.lobbyTitle}>Battle Starting In</Text>
          <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
          <Text style={styles.lobbyHint}>Get ready! Warm up and prepare your music!</Text>
        </LinearGradient>
      )}

      {battle.status === 'live' && (
        <View style={styles.liveContainer}>
          <View style={styles.liveHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE BATTLE</Text>
            </View>
          </View>
          <Text style={styles.liveMessage}>Recording in progress...</Text>
        </View>
      )}

      {/* Fighters */}
      <View style={styles.fighters}>
        <View style={styles.fighter}>
          <Image source={{ uri: battle.challenger.avatar }} style={styles.avatar} />
          <Text style={styles.fighterName}>{battle.challenger.displayName}</Text>
          <Text style={styles.fighterUsername}>@{battle.challenger.username}</Text>
          {battle.status === 'voting' && (
            <Text style={styles.voteCount}>{battle.votes.challenger} votes</Text>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
        </View>

        <View style={styles.fighter}>
          <Image source={{ uri: battle.opponent.avatar }} style={styles.avatar} />
          <Text style={styles.fighterName}>{battle.opponent.displayName}</Text>
          <Text style={styles.fighterUsername}>@{battle.opponent.username}</Text>
          {battle.status === 'voting' && (
            <Text style={styles.voteCount}>{battle.votes.opponent} votes</Text>
          )}
        </View>
      </View>

      {/* Voting */}
      {battle.status === 'voting' && !hasVoted && (
        <View style={styles.votingContainer}>
          <Text style={styles.votingTitle}>Cast Your Vote!</Text>
          <View style={styles.voteButtons}>
            <GradientButton
              title={battle.challenger.username}
              onPress={() => handleVote('challenger')}
              gradient={theme.colors.gradients.electric}
              style={styles.voteButton}
            />
            <GradientButton
              title={battle.opponent.username}
              onPress={() => handleVote('opponent')}
              gradient={theme.colors.gradients.fire}
              style={styles.voteButton}
            />
          </View>
        </View>
      )}

      {hasVoted && (
        <View style={styles.votedContainer}>
          <ThumbsUp size={32} color={theme.colors.success} />
          <Text style={styles.votedText}>Thanks for voting!</Text>
        </View>
      )}

      {/* Hashtags */}
      <View style={styles.hashtags}>
        {battle.hashtags.map((tag, index) => (
          <Text key={index} style={styles.hashtag}>{tag}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerCount: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
  lobbyContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  lobbyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  countdown: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    marginBottom: theme.spacing.md,
  },
  lobbyHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  liveContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  liveHeader: {
    marginBottom: theme.spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  liveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  liveMessage: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  fighters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.xl,
  },
  fighter: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  fighterName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  fighterUsername: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  voteCount: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  vsContainer: {
    justifyContent: 'center',
  },
  vs: {
    color: theme.colors.textMuted,
    fontSize: 24,
    fontWeight: '900',
  },
  votingContainer: {
    padding: theme.spacing.xl,
  },
  votingTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  voteButton: {
    flex: 1,
  },
  votedContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  votedText: {
    color: theme.colors.success,
    fontSize: 18,
    fontWeight: '600',
    marginTop: theme.spacing.md,
  },
  hashtags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  hashtag: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});