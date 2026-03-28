import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { theme } from '@/constants/theme';

interface UserAvatarProps {
  uri: string;
  size?: number;
  rank?: number;
  isPro?: boolean;
  verified?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  size = 48,
  rank,
  isPro,
  verified,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
          isPro && styles.proBorder,
        ]}
      />
      {rank && rank <= 3 && (
        <View style={[styles.rankBadge, { top: -4, right: -4 }]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      {verified && (
        <View style={[styles.verifiedBadge, { bottom: -2, right: -2 }]}>
          <Text style={styles.verifiedText}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: theme.colors.surface,
  },
  proBorder: {
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  rankBadge: {
    position: 'absolute',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});