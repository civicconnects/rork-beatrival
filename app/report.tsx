import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Report Issue</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          This feature will allow you to report bugs, inappropriate content, or other issues to our support team.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});