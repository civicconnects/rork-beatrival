import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Search, TrendingUp, Hash } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { hashtags } from '@/mocks/data';
import { BattleCard } from '@/components/BattleCard';
import { useBattles } from '@/hooks/use-battles';
import { router } from 'expo-router';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { battles } = useBattles();
  
  const trendingHashtags = hashtags.slice(0, 8);
  const recentBattles = battles.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dancers, hashtags..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trending Hashtags */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          
          <View style={styles.hashtagGrid}>
            {trendingHashtags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.hashtagCard}>
                <Hash size={16} color={theme.colors.accent} />
                <Text style={styles.hashtagText}>{tag.replace('#', '')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Battles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Battles</Text>
          {recentBattles.map(battle => (
            <BattleCard
              key={battle.id}
              battle={battle}
              onPress={() => router.push(`/battle/${battle.id}`)}
            />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
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
  },
  hashtagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  hashtagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  hashtagText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});