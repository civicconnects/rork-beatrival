import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { GradientButton } from '@/components/GradientButton';

export default function ProfileEditScreen() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim() || !username.trim()) {
      Alert.alert('Error', 'Display name and username are required.');
      return;
    }

    if (age && (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120)) {
      Alert.alert('Error', 'Please enter a valid age between 1 and 120.');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        age: age ? Number(age) : undefined,
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Please log in to edit your profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
          <Save size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarText}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="Enter your username"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={30}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>Only lowercase letters, numbers, and underscores</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
            <Text style={styles.helperText}>{bio.length}/200 characters</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButtonLarge}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>* Required fields</Text>
        </View>
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
  saveButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  avatarText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  saveButtonLarge: {
    paddingVertical: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});