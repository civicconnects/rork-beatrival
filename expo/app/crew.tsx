import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Crown, UserPlus, Settings } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { mockCrews } from '@/mocks/data';

import { GradientButton } from '@/components/GradientButton';

export default function CrewScreen() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDescription, setCrewDescription] = useState('');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noUserText}>Please log in to view crew information</Text>
      </SafeAreaView>
    );
  }

  const userCrew = mockCrews.find(crew => crew.id === user.crewId);
  const isCrewLeader = userCrew?.leaderId === user.id;

  const handleCreateCrew = () => {
    if (!crewName.trim()) return;
    
    // In a real app, this would create the crew on the server
    console.log('Creating crew:', { name: crewName, description: crewDescription });
    setShowCreateForm(false);
    setCrewName('');
    setCrewDescription('');
  };

  const handleLeaveCrew = () => {
    // In a real app, this would remove user from crew
    console.log('Leaving crew');
  };

  const handleInviteMember = () => {
    // In a real app, this would open invite flow
    console.log('Inviting member');
  };

  if (showCreateForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCreateForm(false)} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Crew</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.createForm}>
            <Text style={styles.formLabel}>Crew Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter crew name"
              placeholderTextColor={theme.colors.textMuted}
              value={crewName}
              onChangeText={setCrewName}
            />

            <Text style={styles.formLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your crew..."
              placeholderTextColor={theme.colors.textMuted}
              value={crewDescription}
              onChangeText={setCrewDescription}
              multiline
              numberOfLines={4}
            />

            <GradientButton
              title="Create Crew"
              onPress={handleCreateCrew}
              disabled={!crewName.trim()}
              size="large"
              style={styles.createButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Crew</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {userCrew ? (
          <>
            {/* Crew Header */}
            <LinearGradient
              colors={theme.colors.gradients.electric}
              style={styles.crewHeader}
            >
              <Image source={{ uri: userCrew.avatar }} style={styles.crewAvatar} />
              <Text style={styles.crewName}>{userCrew.name}</Text>
              {userCrew.description && (
                <Text style={styles.crewDescription}>{userCrew.description}</Text>
              )}
              
              <View style={styles.crewStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userCrew.wins}</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userCrew.losses}</Text>
                  <Text style={styles.statLabel}>Losses</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userCrew.beatPoints}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Crew Actions */}
            {isCrewLeader && (
              <View style={styles.leaderActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleInviteMember}>
                  <UserPlus size={20} color={theme.colors.primary} />
                  <Text style={styles.actionText}>Invite Members</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Settings size={20} color={theme.colors.text} />
                  <Text style={styles.actionText}>Crew Settings</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Members List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Members ({userCrew.members.length})</Text>
              <View style={styles.membersList}>
                {userCrew.members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.displayName}</Text>
                        {member.id === userCrew.leaderId && (
                          <Crown size={16} color={theme.colors.warning} />
                        )}
                      </View>
                      <Text style={styles.memberUsername}>@{member.username}</Text>
                      <Text style={styles.memberStats}>
                        {member.wins}W • {member.losses}L • {member.beatPoints} pts
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Fans List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fans ({userCrew.fans.length})</Text>
              <View style={styles.fansList}>
                {userCrew.fans.map((fan) => (
                  <View key={fan.id} style={styles.fanItem}>
                    <Image source={{ uri: fan.avatar }} style={styles.fanAvatar} />
                    <Text style={styles.fanName}>{fan.displayName}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Leave Crew */}
            {!isCrewLeader && (
              <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveCrew}>
                <Text style={styles.leaveButtonText}>Leave Crew</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* No Crew State */
          <View style={styles.noCrew}>
            <Text style={styles.noCrewIcon}>👥</Text>
            <Text style={styles.noCrewTitle}>You&apos;re Not in a Crew</Text>
            <Text style={styles.noCrewDescription}>
              Create your own crew or join an existing one to compete in crew battles!
            </Text>
            
            <GradientButton
              title="Create New Crew"
              onPress={() => setShowCreateForm(true)}
              size="large"
              style={styles.createCrewButton}
            />
            
            <TouchableOpacity style={styles.joinCrewButton}>
              <Text style={styles.joinCrewText}>Browse Crews to Join</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  crewHeader: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  crewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    marginBottom: theme.spacing.md,
  },
  crewName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
  },
  crewDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  crewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  leaderActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  membersList: {
    gap: theme.spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  memberName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  memberUsername: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  memberStats: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  fansList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  fanItem: {
    alignItems: 'center',
    width: 80,
  },
  fanAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: theme.spacing.sm,
  },
  fanName: {
    color: theme.colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  leaveButton: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noCrew: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noCrewIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  noCrewTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  noCrewDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  createCrewButton: {
    marginBottom: theme.spacing.md,
  },
  joinCrewButton: {
    padding: theme.spacing.md,
  },
  joinCrewText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  createForm: {
    padding: theme.spacing.lg,
  },
  formLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: theme.spacing.xl,
  },
  noUserText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});