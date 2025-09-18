import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Alert, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { trpc } from '@/lib/trpc';
import { GradientButton } from '@/components/GradientButton';

// Type definitions for Agora SDK - simplified to avoid conflicts
interface AgoraClient {
  join(appId: string, channel: string, token: string, uid: number): Promise<any>;
  leave(): Promise<void>;
  publish(tracks: any[]): Promise<void>;
  subscribe(user: any, mediaType: string): Promise<void>;
  setClientRole(role: string): Promise<void>;
  on(event: string, callback: (...args: any[]) => void): void;
  remoteUsers: any[];
}

interface AgoraSDK {
  createClient(config: { mode: string; codec: string }): AgoraClient;
  createMicrophoneAudioTrack(): Promise<any>;
  createCameraVideoTrack(config?: any): Promise<any>;
}

// Lazy load AgoraRTC only when needed on web platform
let AgoraRTC: AgoraSDK | null = null;

const loadAgoraSDK = async (): Promise<AgoraSDK | null> => {
  if (Platform.OS === 'web' && !AgoraRTC) {
    try {
      const agoraModule = await import('agora-rtc-sdk-ng');
      AgoraRTC = agoraModule.default as unknown as AgoraSDK;
      console.log('✅ Agora SDK loaded successfully');
      return AgoraRTC;
    } catch (error) {
      console.warn('Failed to load Agora SDK on web:', error);
      return null;
    }
  }
  return AgoraRTC;
};

interface LiveStreamProps {
  channelName: string;
  isHost: boolean;
  battleType?: 'dancing' | 'singing';
  onStreamEnd?: () => void;
  onViewerJoin?: (viewerCount: number) => void;
}

export const LiveStream: React.FC<LiveStreamProps> = ({
  channelName,
  isHost,
  battleType = 'dancing',
  onStreamEnd,
  onViewerJoin,
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isStreamingInternal, setIsStreamingInternal] = useState<boolean>(false);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [agoraToken, setAgoraToken] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  // Remove unused state variables
  // const [agoraAppId, setAgoraAppId] = useState<string | null>(null);
  // const [agoraUid, setAgoraUid] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const agoraClientRef = useRef<AgoraClient | null>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  
  // Backend mutations with error handling
  const createStreamMutation = trpc.streams.create.useMutation({
    onError: (error) => {
      console.error('Failed to create stream:', error);
    }
  });
  const endStreamMutation = trpc.streams.end.useMutation({
    onError: (error) => {
      console.error('Failed to end stream:', error);
    }
  });
  const joinStreamMutation = trpc.streams.join.useMutation({
    onError: (error) => {
      console.error('Failed to join stream:', error);
    }
  });

  const stopStream = useCallback(async () => {
    // Stop Agora streaming
    if (Platform.OS === 'web' && agoraClientRef.current) {
      try {
        // Stop local tracks
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.close();
          localAudioTrackRef.current = null;
        }
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.close();
          localVideoTrackRef.current = null;
        }
        
        // Leave channel
        await agoraClientRef.current.leave();
        console.log('✅ Left Agora channel');
        agoraClientRef.current = null;
      } catch (error) {
        console.error('Error stopping Agora stream:', error);
      }
    }
    
    // Fallback: stop regular WebRTC stream
    if (Platform.OS === 'web' && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Notify backend that stream has ended
    if (isHost && isStreamingInternal) {
      try {
        await endStreamMutation.mutateAsync({ channelName });
        console.log('✅ Stream ended in backend');
      } catch (error) {
        console.error('Failed to end stream in backend:', error);
      }
    }
    
    setIsStreamingInternal(false);
    setViewerCount(0);
    setAgoraToken(null);
    setHasStarted(false);
    onStreamEnd?.();
  }, [channelName, isHost, isStreamingInternal, onStreamEnd, endStreamMutation]);

  // Get Agora token with comprehensive error handling
  const generateTokenMutation = trpc.agora.generateToken.useMutation({
    onSuccess: (data) => {
      try {
        if (data?.token && data?.appId) {
          console.log('✅ Real Agora token generated successfully:', {
            appId: data.appId,
            channelName: data.channelName,
            uid: data.uid,
            role: data.role === 1 ? 'PUBLISHER (Host)' : 'SUBSCRIBER (Viewer)',
            expireTime: new Date(data.expireTime * 1000).toISOString(),
            tokenLength: data.token.length
          });
          setAgoraToken(data.token);
          // setAgoraAppId(data.appId);
          // setAgoraUid(data.uid);
          
          // Register stream in backend
          if (isHost) {
            createStreamMutation.mutate({
              channelName: data.channelName,
              hostId: data.uid.toString(),
              hostName: `User ${data.uid}`,
              battleType,
              title: `Live ${battleType} battle`,
            }, {
              onSuccess: () => {
                console.log('✅ Stream registered in backend');
              },
              onError: (error) => {
                console.error('Failed to register stream:', error);
              }
            });
          } else {
            // Viewer joining stream
            joinStreamMutation.mutate({ channelName }, {
              onSuccess: (result) => {
                if (result.success && result.stream) {
                  setViewerCount(result.stream.viewerCount || 0);
                  console.log('✅ Joined stream, current viewers:', result.stream.viewerCount);
                }
              }
            });
          }
          
          if (Platform.OS === 'web') {
            startAgoraStream(data.appId, data.token, data.uid);
          } else {
            // For mobile, we'll use camera view with Agora token ready
            setIsStreamingInternal(true);
            
            // Log that we're ready for Agora SDK integration
            console.log('📱 Mobile: Camera ready, Agora token available for SDK integration');
            console.log('🔧 Next step: Integrate Agora React Native SDK for real streaming');
          }
        } else {
          console.error('❌ Invalid token response:', data);
          setHasStarted(false);
          setIsStreamingInternal(false);
          
          if (Platform.OS !== 'web') {
            Alert.alert('Stream Error', 'Invalid response from server. Please try again.');
          }
        }
      } catch (error) {
        console.error('❌ Error processing token response:', error);
        setHasStarted(false);
        setIsStreamingInternal(false);
        
        if (Platform.OS !== 'web') {
          Alert.alert('Stream Error', 'Failed to process server response. Please try again.');
        }
      }
    },
    onError: (error: any) => {
      try {
        let errorMessage = 'Unknown error';
        
        // Handle different error types
        if (error?.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }
        
        // Check for common error patterns
        if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
          errorMessage = 'Server communication error. Please check your connection.';
          console.error('❌ JSON Parse Error - Server might be returning HTML instead of JSON');
        } else if (errorMessage.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (errorMessage.includes('EXPO_PUBLIC_RORK_API_BASE_URL')) {
          errorMessage = 'Configuration error. Please contact support.';
        }
        
        console.error('❌ Failed to generate Agora token:', errorMessage, error);
        
        // Always use console.error to avoid blocking and web compatibility issues
        console.error('Stream Error:', errorMessage);
        console.error('Full error object:', error);
        
        // Reset state on error to prevent infinite loops
        setHasStarted(false);
        setIsStreamingInternal(false);
        
        // Only show alert on mobile platforms
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Stream Error', 
            `Failed to start stream: ${errorMessage}\n\nPlease check your internet connection and try again.`,
            [{ text: 'OK', onPress: () => stopStream() }]
          );
        }
      } catch (alertError) {
        console.error('❌ Error showing alert:', alertError);
        stopStream();
      }
    },
  });

  const startAgoraStream = async (appId: string, token: string, uid: number) => {
    if (Platform.OS !== 'web') {
      console.log('Not on web platform, skipping Agora SDK');
      return;
    }

    // Load Agora SDK dynamically
    const agora = await loadAgoraSDK();
    if (!agora) {
      console.log('Agora SDK not available');
      return;
    }

    try {
      console.log('🚀 Starting Agora Web SDK stream...');
      
      // Create Agora client
      const client = agora.createClient({ 
        mode: 'live', 
        codec: 'vp8' 
      });
      agoraClientRef.current = client;
      
      // Set client role
      if (isHost) {
        await client.setClientRole('host');
        console.log('✅ Set role to host');
      } else {
        await client.setClientRole('audience');
        console.log('✅ Set role to audience');
      }
      
      // Set up event listeners
      client.on('user-published', async (user: any, mediaType: string) => {
        console.log('👤 User published:', user.uid, mediaType);
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          const remoteVideoContainer = document.getElementById('remote-video');
          if (remoteVideoContainer && user.videoTrack) {
            user.videoTrack.play(remoteVideoContainer);
          }
        }
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
      });
      
      client.on('user-unpublished', (user: any) => {
        console.log('👤 User unpublished:', user.uid);
      });
      
      client.on('user-joined', (user: any) => {
        console.log('👤 User joined:', user.uid);
        setViewerCount(prev => prev + 1);
      });
      
      client.on('user-left', (user: any) => {
        console.log('👤 User left:', user.uid);
        setViewerCount(prev => Math.max(0, prev - 1));
      });
      
      // Join channel
      await client.join(appId, channelName, token, uid);
      console.log('✅ Joined Agora channel:', channelName);
      
      if (isHost) {
        // Create local tracks
        const audioTrack = await agora.createMicrophoneAudioTrack();
        const videoTrack = await agora.createCameraVideoTrack({
          encoderConfig: {
            width: 1280,
            height: 720,
            frameRate: 30,
            bitrateMin: 1000,
            bitrateMax: 3000,
          }
        });
        
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        
        // Play local video
        const localVideoContainer = document.getElementById('local-video');
        if (localVideoContainer) {
          videoTrack.play(localVideoContainer);
        }
        
        // Publish tracks
        await client.publish([audioTrack, videoTrack]);
        console.log('✅ Published local tracks');
      }
      
      setIsStreamingInternal(true);
      
      // Simulate viewer count updates for demo
      const interval = setInterval(() => {
        if (!isHost) {
          const newCount = Math.floor(Math.random() * 50) + 1;
          setViewerCount(newCount);
          onViewerJoin?.(newCount);
        }
      }, 5000);
      
      return () => clearInterval(interval);
      
    } catch (error) {
      console.error('❌ Failed to start Agora stream:', error);
      
      // Only show alert on mobile platforms
      if (Platform.OS !== 'web') {
        Alert.alert('Stream Error', `Failed to start Agora stream: ${error}`);
      }
    }
  };



  const startStream = useCallback(() => {
    if (hasStarted || generateTokenMutation.isPending) {
      console.log('⚠️ Stream already started or pending, preventing duplicate start');
      return;
    }
    
    console.log('🎬 Starting stream with params:', {
      channelName,
      role: isHost ? 'host (1)' : 'audience (2)',
      isHost
    });
    
    setHasStarted(true);
    generateTokenMutation.mutate({
      channelName,
      role: isHost ? 1 : 2, // 1 = host, 2 = audience
    });
  }, [hasStarted, generateTokenMutation, channelName, isHost]);

  // Auto-start stream when component mounts (called from parent after countdown)
  useEffect(() => {
    // Only auto-start if we haven't started yet and we're not showing the start screen
    const timer = setTimeout(() => {
      if (!hasStarted && !generateTokenMutation.isPending) {
        console.log('🚀 Auto-starting stream for channel:', channelName);
        console.log('🔍 Debug info:', {
          hasStarted,
          isPending: generateTokenMutation.isPending,
          channelName,
          isHost,
          platform: Platform.OS
        });
        startStream();
      }
    }, 500); // Increased delay to prevent race conditions
    
    return () => clearTimeout(timer);
  }, [hasStarted, generateTokenMutation.isPending, channelName, isHost, startStream]); // Include all dependencies

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <GradientButton
          title="Grant Camera Permission"
          onPress={requestPermission}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {isStreamingInternal ? (
          <View style={styles.webStreamContainer}>
            <View style={styles.streamHeader}>
              <Text style={styles.channelName}>Channel: {channelName}</Text>
              <Text style={styles.viewerCount}>👥 {viewerCount} viewers</Text>
              {agoraToken && (
                <Text style={styles.tokenStatus}>🟢 Connected to Agora</Text>
              )}
            </View>
            {isHost ? (
              <div id="local-video" style={styles.webVideo as any} />
            ) : (
              <div id="remote-video" style={styles.webVideo as any} />
            )}
            <View style={styles.streamControls}>
              <GradientButton
                title="Stop Stream"
                onPress={stopStream}
                style={styles.controlButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.startContainer}>
            <Text style={styles.startTitle}>Connecting to stream...</Text>
            <Text style={styles.startSubtitle}>Channel: {channelName}</Text>
            {generateTokenMutation.isPending && (
              <Text style={styles.loadingText}>Generating token...</Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Mobile camera view
  return (
    <View style={styles.container}>
      {isStreamingInternal ? (
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.mobileHeader}>
            <Text style={styles.mobileChannelName}>{channelName}</Text>
            <Text style={styles.mobileViewerCount}>👥 {viewerCount}</Text>
            {agoraToken && (
              <Text style={styles.mobileTokenStatus}>🟢 Live</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Flip"
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              style={styles.flipButton}
            />
            <GradientButton
              title="End Stream"
              onPress={stopStream}
              style={styles.controlButton}
            />
          </View>
        </CameraView>
      ) : (
        <View style={styles.startContainer}>
          <Text style={styles.startTitle}>Connecting to stream...</Text>
          <Text style={styles.startSubtitle}>Channel: {channelName}</Text>
          {generateTokenMutation.isPending && (
            <Text style={styles.loadingText}>Generating token...</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  flipButton: {
    alignSelf: 'flex-end',
    minWidth: 80,
  },
  controlButton: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    alignSelf: 'center',
    marginTop: 100,
  },
  webStreamContainer: {
    flex: 1,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  channelName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewerCount: {
    color: '#fff',
    fontSize: 14,
  },
  tokenStatus: {
    color: '#4ade80',
    fontSize: 12,
  },
  webVideo: {
    flex: 1,
    width: '100%',
    objectFit: 'cover',
  },
  streamControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  startSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center' as const,
  },
  loadingText: {
    color: '#4ade80',
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 16,
  },
  mobileHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1,
  },
  mobileChannelName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  mobileViewerCount: {
    color: '#fff',
    fontSize: 12,
  },
  mobileTokenStatus: {
    color: '#4ade80',
    fontSize: 10,
  },
});

