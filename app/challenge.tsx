import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Hash, Clock, Users, Music, Activity } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useBattles } from '@/hooks/use-battles';
import { GradientButton } from '@/components/GradientButton';
import { hashtags } from '@/mocks/data';

export default function ChallengeScreen() {
  const { user } = useAuth();
  const { createChallenge } = useBattles();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(120);
  const [challengeType, setChallengeType] = useState<'open' | 'user'>('open');
  const [battleType, setBattleType] = useState<'dance' | 'sing'>('dance');

  const handleCreateChallenge = () => {
    if (!user) return;
    
    if (selectedHashtags.length === 0) {
      Alert.alert('Add Hashtags', 'Please select at least one hashtag for your challenge');
      return;
    }

    createChallenge({
      from: user,
      type: challengeType,
      battleType,
      hashtags: selectedHashtags,
      timeLimit,
    });

    Alert.alert(
      'Challenge Created!',
      'Your challenge is now live. Other dancers can accept it!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Battle Type - Dance or Sing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battle Type</Text>
          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={[styles.typeOption, battleType === 'dance' && styles.typeOptionActive]}
              onPress={() => setBattleType('dance')}
            >
              <Activity size={20} color={battleType === 'dance' ? 'white' : theme.colors.textMuted} />
              <Text style={[styles.typeText, battleType === 'dance' && styles.typeTextActive]}>
                Dance Battle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeOption, battleType === 'sing' && styles.typeOptionActive]}
              onPress={() => setBattleType('sing')}
            >
              <Music size={20} color={battleType === 'sing' ? 'white' : theme.colors.textMuted} />
              <Text style={[styles.typeText, battleType === 'sing' && styles.typeTextActive]}>
                Singing Battle
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenge Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Type</Text>
          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={[styles.typeOption, challengeType === 'open' && styles.typeOptionActive]}
              onPress={() => setChallengeType('open')}
            >
              <Users size={20} color={challengeType === 'open' ? 'white' : theme.colors.textMuted} />
              <Text style={[styles.typeText, challengeType === 'open' && styles.typeTextActive]}>
                Open Challenge
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeOption, challengeType === 'user' && styles.typeOptionActive]}
              onPress={() => setChallengeType('user')}
            >
              <Users size={20} color={challengeType === 'user' ? 'white' : theme.colors.textMuted} />
              <Text style={[styles.typeText, challengeType === 'user' && styles.typeTextActive]}>
                Specific User
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Limit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battle Duration</Text>
          <View style={styles.timeOptions}>
            {[60, 90, 120, 180].map(seconds => (
              <TouchableOpacity
                key={seconds}
                style={[styles.timeOption, timeLimit === seconds && styles.timeOptionActive]}
                onPress={() => setTimeLimit(seconds)}
              >
                <Clock size={16} color={timeLimit === seconds ? 'white' : theme.colors.textMuted} />
                <Text style={[styles.timeText, timeLimit === seconds && styles.timeTextActive]}>
                  {seconds / 60}min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hashtags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Hashtags</Text>
          <View style={styles.hashtagGrid}>
            {hashtags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.hashtagChip,
                  selectedHashtags.includes(tag) && styles.hashtagChipActive
                ]}
                onPress={() => toggleHashtag(tag)}
              >
                <Hash size={14} color={selectedHashtags.includes(tag) ? 'white' : theme.colors.textMuted} />
                <Text style={[
                  styles.hashtagText,
                  selectedHashtags.includes(tag) && styles.hashtagTextActive
                ]}>
                  {tag.replace('#', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={styles.preview}
        >
          <Text style={styles.previewTitle}>Challenge Preview</Text>
          <View style={styles.previewDetails}>
            <Text style={styles.previewText}>Battle: {battleType === 'dance' ? '💃 Dance' : '🎤 Singing'}</Text>
            <Text style={styles.previewText}>Type: {challengeType === 'open' ? 'Open to All' : 'User Challenge'}</Text>
            <Text style={styles.previewText}>Duration: {timeLimit / 60} minutes</Text>
            <Text style={styles.previewText}>
              Hashtags: {selectedHashtags.length > 0 ? selectedHashtags.join(' ') : 'None selected'}
            </Text>
          </View>
        </LinearGradient>

        <GradientButton
          title="Create Challenge"
          onPress={handleCreateChallenge}
          size="large"
          style={styles.createButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  typeTextActive: {
    color: 'white',
  },
  timeOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  timeOptionActive: {
    backgroundColor: theme.colors.secondary,
  },
  timeText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  timeTextActive: {
    color: 'white',
  },
  hashtagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  hashtagChipActive: {
    backgroundColor: theme.colors.accent,
  },
  hashtagText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  hashtagTextActive: {
    color: 'white',
  },
  preview: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  previewTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  previewDetails: {
    gap: theme.spacing.sm,
  },
  previewText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  createButton: {
    marginBottom: theme.spacing.xxl,
  },
});