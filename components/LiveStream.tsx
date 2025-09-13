import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { trpc } from '@/lib/trpc';
import { GradientButton } from '@/components/GradientButton';

interface LiveStreamProps {
  channelName: string;
  isHost: boolean;
  onStreamEnd?: () => void;
}

export const LiveStream: React.FC<LiveStreamProps> = ({
  channelName,
  isHost,
  onStreamEnd,
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (Platform.OS === 'web' && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    onStreamEnd?.();
  }, [onStreamEnd]);

  // Get Agora token
  const generateTokenMutation = trpc.agora.generateToken.useMutation({
    onSuccess: (data) => {
      if (data?.appId) {
        console.log('Agora token generated successfully');
        if (Platform.OS === 'web') {
          startWebRTCStream();
        } else {
          // For mobile, we'll use camera view for now
          setIsStreaming(true);
        }
      }
    },
    onError: (error) => {
      const errorMessage = error?.message || 'Unknown error';
      console.error('Failed to generate Agora token:', errorMessage);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to start stream');
      }
    },
  });

  const startWebRTCStream = async () => {
    if (Platform.OS !== 'web') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (error) {
      console.error('Failed to start WebRTC stream:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to access camera and microphone');
      }
    }
  };



  const startStream = () => {
    generateTokenMutation.mutate({
      channelName,
      role: isHost ? 1 : 2, // 1 = host, 2 = audience
    });
  };

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
        {isStreaming ? (
          <View style={styles.webStreamContainer}>
            <video
              ref={(video) => {
                if (video && streamRef.current) {
                  video.srcObject = streamRef.current;
                }
              }}
              autoPlay
              muted
              style={styles.webVideo}
            />
            <GradientButton
              title="Stop Stream"
              onPress={stopStream}
              style={styles.controlButton}
            />
          </View>
        ) : (
          <GradientButton
            title="Start Stream"
            onPress={startStream}
            loading={generateTokenMutation.isPending}
            style={styles.controlButton}
          />
        )}
      </View>
    );
  }

  // Mobile camera view
  return (
    <View style={styles.container}>
      {isStreaming ? (
        <CameraView style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Flip Camera"
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
              style={styles.flipButton}
            />
            <GradientButton
              title="Stop Stream"
              onPress={stopStream}
              style={styles.controlButton}
            />
          </View>
        </CameraView>
      ) : (
        <GradientButton
          title="Start Stream"
          onPress={startStream}
          loading={generateTokenMutation.isPending}
          style={styles.controlButton}
        />
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
    margin: 64,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  flipButton: {
    alignSelf: 'flex-end',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  webVideo: {
    width: '100%',
    height: '80%',
    objectFit: 'cover',
  },
});

