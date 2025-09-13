import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Video, Users, Music, Plus, ArrowLeft } from 'lucide-react-native';

export default function LiveStreamsScreen() {
  const router = useRouter();
  
  const streamsQuery = trpc.streams.list.useQuery();

  const joinStream = (channelName: string) => {
    router.push({
      pathname: '/live-test',
      params: { 
        channelName,
        isHost: 'false'
      }
    });
  };

  const streams = streamsQuery.data?.streams || [];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#0f0f1e']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Live Battles</Text>
            <Text style={styles.subtitle}>Join the action!</Text>
          </View>
          <TouchableOpacity
            style={styles.goLiveButton}
            onPress={() => router.push('/live-test')}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.goLiveText}>Go Live</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {streams.length === 0 ? (
            <View style={styles.emptyState}>
              <Video size={64} color="#666" />
              <Text style={styles.emptyTitle}>No Live Streams</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to go live!
              </Text>
            </View>
          ) : (
            streams.map((stream) => (
              <TouchableOpacity
                key={stream.id}
                style={styles.streamCard}
                onPress={() => joinStream(stream.channelName)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ff4757']}
                  style={styles.liveIndicator}
                >
                  <Text style={styles.liveText}>LIVE</Text>
                </LinearGradient>

                <View style={styles.streamInfo}>
                  <View style={styles.streamHeader}>
                    {stream.battleType === 'singing' ? (
                      <Music size={20} color="#fff" />
                    ) : (
                      <Video size={20} color="#fff" />
                    )}
                    <Text style={styles.battleType}>
                      {stream.battleType.toUpperCase()} BATTLE
                    </Text>
                  </View>
                  
                  <Text style={styles.streamTitle}>{stream.title}</Text>
                  <Text style={styles.hostName}>Host: {stream.hostName}</Text>
                  
                  <View style={styles.streamFooter}>
                    <View style={styles.viewerCount}>
                      <Users size={16} color="#999" />
                      <Text style={styles.viewerText}>
                        {stream.viewerCount} watching
                      </Text>
                    </View>
                    
                    <Text style={styles.startTime}>
                      Started {getTimeAgo(stream.startedAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  goLiveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  streamCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamInfo: {
    flex: 1,
  },
  streamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  battleType: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  hostName: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  streamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 4,
  },
  startTime: {
    color: '#666',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
});