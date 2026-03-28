import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { X, SwitchCamera, Zap, Users, Hash, Music, Activity } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { useBattles } from '@/hooks/use-battles';

type BattleType = 'dancing' | 'singing';

export default function RecordScreen() {
  // All hooks must be called in the same order every time - NEVER conditionally
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [battleType, setBattleType] = useState<BattleType>('dancing');
  const [isGoingLive, setIsGoingLive] = useState(false);
  const cameraRef = useRef<any>(null);
  
  // Move permission hook after other state hooks to maintain consistent order
  const [permission, requestPermission] = useCameraPermissions();
  
  // Context hooks should come after state hooks
  const { user } = useAuth();
  const { createChallenge } = useBattles();

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isGoingLive) {
      // Start actual recording (not for live streaming)
      setCountdown(null);
      setIsRecording(true);
      Alert.alert(
        'Recording Started',
        'Environmental audio will be captured. Make sure your music is playing!',
        [{ text: 'OK' }]
      );
      
      setTimeout(() => {
        setIsRecording(false);
        Alert.alert('Recording Complete', 'Your battle video has been saved!');
      }, 5000);
    }
  }, [countdown, isGoingLive]);

  const startRecording = () => {
    if (isRecording || countdown !== null) return;
    startCountdown();
  };

  const createOpenChallenge = useCallback((type: BattleType) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create challenges');
      return;
    }
    
    if (isRecording || countdown !== null || isGoingLive) return;
    
    setBattleType(type);
    setIsGoingLive(true);
    // Start countdown before going live
    setCountdown(3);
  }, [user, isRecording, countdown, isGoingLive]);

  // Handle countdown completion for live streaming
  useEffect(() => {
    if (isGoingLive && countdown === 0) {
      // Small delay then navigate
      const timer = setTimeout(() => {
        setCountdown(null);
        setIsGoingLive(false);
        // Navigate to live streaming with battle type
        router.push({
          pathname: '/live-test',
          params: {
            isHost: 'true',
            battleType: battleType,
            channelName: `battle-${battleType}-${Date.now()}`,
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isGoingLive, countdown, battleType]);

  // Handle permission states - moved after all hooks to avoid conditional hook calls
  const renderPermissionScreen = () => {
    if (!permission) {
      return <View style={styles.container} />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>We need camera permission to record battles</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Check for permission issues first
  const permissionScreen = renderPermissionScreen();
  if (permissionScreen) {
    return permissionScreen;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <SwitchCamera size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Challenge Options */}
          {!isRecording && !countdown && (
            <View style={styles.challengeOptions}>
              <Text style={styles.sectionTitle}>Go Live - Choose Battle Type:</Text>
              
              <TouchableOpacity
                style={styles.challengeOption}
                onPress={() => createOpenChallenge('dancing')}
              >
                <LinearGradient
                  colors={theme.colors.gradients.fire}
                  style={styles.challengeGradient}
                >
                  <Activity size={20} color="white" />
                  <Text style={styles.challengeText}>Dancing Battle</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.challengeOption}
                onPress={() => createOpenChallenge('singing')}
              >
                <LinearGradient
                  colors={['#3A86FF', '#06FFB4']}
                  style={styles.challengeGradient}
                >
                  <Music size={20} color="white" />
                  <Text style={styles.challengeText}>Singing Battle</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.challengeOption}
                onPress={() => router.push('/challenge')}
              >
                <LinearGradient
                  colors={theme.colors.gradients.electric}
                  style={styles.challengeGradient}
                >
                  <Users size={20} color="white" />
                  <Text style={styles.challengeText}>Challenge User</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Countdown */}
          {countdown !== null && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown === 0 ? (isGoingLive ? 'LIVE!' : 'GO!') : countdown}</Text>
              {isGoingLive && (
                <Text style={styles.countdownSubtext}>{battleType === 'singing' ? '🎤 Singing Battle' : '💃 Dancing Battle'}</Text>
              )}
            </View>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>RECORDING</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.recordButton, (isRecording || countdown !== null) && styles.recordingButton]}
              onPress={startRecording}
              disabled={isRecording || countdown !== null}
            >
              <View style={styles.recordButtonInner} />
            </TouchableOpacity>
            
            <Text style={styles.hint}>
              {countdown !== null ? 'Get ready...' : isRecording ? 'Recording environmental audio...' : 'Tap to start practice recording'}
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeOptions: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  challengeOption: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  challengeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  challengeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.9)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  countdownText: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900' as const,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countdownSubtext: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomControls: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordingButton: {
    borderColor: theme.colors.error,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.error,
  },
  hint: {
    color: 'white',
    fontSize: 14,
    marginTop: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  permissionText: {
    color: theme.colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});