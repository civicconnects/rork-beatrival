import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradient = theme.colors.gradients.primary,
  style,
  textStyle,
  disabled = false,
  loading = false,
  size = 'medium',
}) => {
  const sizeStyles = {
    small: { height: 40, paddingHorizontal: 16 },
    medium: { height: 52, paddingHorizontal: 24 },
    large: { height: 60, paddingHorizontal: 32 },
  };

  const textSizes = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#666', '#444'] as const : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, sizeStyles[size]]}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={[styles.text, textSizes[size], textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});