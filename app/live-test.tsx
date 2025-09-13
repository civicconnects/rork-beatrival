import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { GradientButton } from '@/components/GradientButton';
import { LiveStream } from '@/components/LiveStream';

export default function LiveTestScreen() {
  const [channelName, setChannelName] = useState<string>('test-channel-' + Date.now());
  const [isHost, setIsHost] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const insets = useSafeAreaInsets();

  const startCountdown = () => {
    if (!channelName.trim()) {
      Alert.alert('Error', 'Please enter a channel name');
      return;
    }
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Start actual streaming
      setCountdown(null);
      setIsStreaming(true);
    }
  }, [countdown]);

  const startStream = () => {
    startCountdown();
  };

  const stopStream = () => {
    setIsStreaming(false);
    setCountdown(null);
    setViewerCount(0);
  };

  const handleViewerJoin = (count: number) => {
    setViewerCount(count);
  };

  if (countdown !== null) {
    return (
      <View style={[styles.container, styles.countdownScreen, { paddingTop: insets.top }]}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown === 0 ? 'GO LIVE!' : countdown}</Text>
          <Text style={styles.countdownSubtext}>Get ready to stream...</Text>
        </View>
      </View>
    );
  }

  if (isStreaming) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.streamingHeader}>
          <GradientButton
            title="← Back"
            onPress={stopStream}
            style={styles.backButton}
          />
          <View style={styles.streamInfo}>
            <Text style={styles.channelText}>{channelName}</Text>
            <View style={styles.viewerInfo}>
              <Users size={16} color={theme.colors.textSecondary} />
              <Text style={styles.viewerText}>{viewerCount} viewers</Text>
            </View>
          </View>
        </View>
        
        <LiveStream
          channelName={channelName}
          isHost={isHost}
          onStreamEnd={stopStream}
          onViewerJoin={handleViewerJoin}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <GradientButton
          title="← Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.title}>Agora Live Test</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Video size={24} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Test Live Streaming</Text>
          </View>
          
          <Text style={styles.description}>
            ✅ Real Agora integration with your credentials:
            {"\n"}• App ID: 4a6fd7540b324275bab0f8f82def07aa
            {"\n"}• Certificate: 12a1828565d14960a78234eb4933a46d
            {"\n"}• ✅ Real token generation working
            {"\n"}• 📱 Mobile: Camera + Token ready for Agora SDK
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Channel Name</Text>
            <TextInput
              style={styles.input}
              value={channelName}
              onChangeText={setChannelName}
              placeholder="Enter channel name"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleButtons}>
              <GradientButton
                title="Host (Broadcaster)"
                onPress={() => setIsHost(true)}
                gradient={isHost ? [...theme.colors.gradients.primary] : ['#333', '#333']}
                style={styles.roleButton}
              />
              <GradientButton
                title="Viewer (Audience)"
                onPress={() => setIsHost(false)}
                gradient={!isHost ? [...theme.colors.gradients.primary] : ['#333', '#333']}
                style={styles.roleButton}
              />
            </View>
          </View>

          <GradientButton
            title={countdown !== null ? `Starting in ${countdown === 0 ? 'GO!' : countdown}...` : "Start Live Stream"}
            onPress={startStream}
            disabled={countdown !== null}
            style={styles.startButton}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔧 Technical Info</Text>
          <Text style={styles.infoText}>
            • Web: Uses WebRTC with camera/microphone access
            {"\n"}• Mobile: Uses Expo Camera with Agora token generation
            {"\n"}• Backend: Generates official Agora RTC tokens
            {"\n"}• Token expires in 1 hour for security
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  backButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleContainer: {
    marginBottom: theme.spacing.xl,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  roleButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  startButton: {
    paddingVertical: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  streamingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  streamInfo: {
    alignItems: 'flex-end',
  },
  channelText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  viewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  viewerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  countdownScreen: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  countdownContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  countdownText: {
    color: theme.colors.primary,
    fontSize: 72,
    fontWeight: '900',
    marginBottom: theme.spacing.md,
  },
  countdownSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '500',
  },
});