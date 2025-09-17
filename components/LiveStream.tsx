import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Alert, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { trpc } from '@/lib/trpc';
import { GradientButton } from '@/components/GradientButton';
import AgoraRTC from 'agora-rtc-sdk-ng';

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
  const [agoraAppId, setAgoraAppId] = useState<string | null>(null);
  const [agoraUid, setAgoraUid] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  
  // Backend mutations
  const createStreamMutation = trpc.streams.create.useMutation();
  const endStreamMutation = trpc.streams.end.useMutation();
  const joinStreamMutation = trpc.streams.join.useMutation();

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

  // Get Agora token
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
          setAgoraAppId(data.appId);
          setAgoraUid(data.uid);
          
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
          Alert.alert('Stream Error', 'Invalid response from server. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error processing token response:', error);
        Alert.alert('Stream Error', 'Failed to process server response. Please try again.');
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
        
        // Check if it's a JSON parse error
        if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
          errorMessage = 'Server communication error. Please check your connection.';
          console.error('❌ JSON Parse Error - Server might be returning HTML instead of JSON');
        }
        
        console.error('❌ Failed to generate Agora token:', errorMessage, error);
        Alert.alert(
          'Stream Error', 
          `Failed to start stream: ${errorMessage}\n\nPlease check your internet connection and try again.`,
          [{ text: 'OK', onPress: () => stopStream() }]
        );
      } catch (alertError) {
        console.error('❌ Error showing alert:', alertError);
        stopStream();
      }
    },
  });

  const startAgoraStream = async (appId: string, token: string, uid: number) => {
    if (Platform.OS !== 'web') return;

    try {
      console.log('🚀 Starting Agora Web SDK stream...');
      
      // Create Agora client
      const client = AgoraRTC.createClient({ 
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
      client.on('user-published', async (user, mediaType) => {
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
      
      client.on('user-unpublished', (user) => {
        console.log('👤 User unpublished:', user.uid);
      });
      
      client.on('user-joined', (user) => {
        console.log('👤 User joined:', user.uid);
        setViewerCount(prev => prev + 1);
      });
      
      client.on('user-left', (user) => {
        console.log('👤 User left:', user.uid);
        setViewerCount(prev => Math.max(0, prev - 1));
      });
      
      // Join channel
      await client.join(appId, channelName, token, uid);
      console.log('✅ Joined Agora channel:', channelName);
      
      if (isHost) {
        // Create local tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
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
      Alert.alert('Stream Error', `Failed to start Agora stream: ${error}`);
    }
  };



  const startStream = () => {
    if (hasStarted) {
      console.log('⚠️ Stream already started, preventing duplicate start');
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
  };

  // Auto-start stream when component mounts (called from parent after countdown)
  useEffect(() => {
    // Only auto-start if we haven't started yet and we're not showing the start screen
    const timer = setTimeout(() => {
      if (!hasStarted && !generateTokenMutation.isPending) {
        console.log('🚀 Auto-starting stream for channel:', channelName);
        startStream();
      }
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  startSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingText: {
    color: '#4ade80',
    fontSize: 14,
    textAlign: 'center',
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
    fontWeight: 'bold',
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

