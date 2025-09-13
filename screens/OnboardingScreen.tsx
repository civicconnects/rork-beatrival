import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { GradientButton } from '@/components/GradientButton';
import { theme } from '@/constants/theme';
import { ageGroups } from '@/mocks/data';
import { AgeGroup } from '@/types';
import { router } from 'expo-router';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [parentConsent, setParentConsent] = useState(false);

  const needsParentConsent = selectedAge && ['1-5', '6-8'].includes(selectedAge);

  const handleAgeSelect = (ageGroup: AgeGroup) => {
    setSelectedAge(ageGroup);
    setStep(2);
  };

  const handleUsernameSubmit = () => {
    if (username.length < 3) {
      Alert.alert('Username too short', 'Please choose a username with at least 3 characters');
      return;
    }
    setStep(3);
  };

  const handleAgeSubmit = () => {
    const ageNum = parseInt(age);
    if (!age || ageNum < 5 || ageNum > 100) {
      Alert.alert('Invalid age', 'Please enter a valid age between 5 and 100');
      return;
    }
    
    if (needsParentConsent) {
      setStep(4);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (selectedAge && username && age) {
      await completeOnboarding(selectedAge, username, parseInt(age));
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={theme.colors.gradients.electric}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.logo}>BeatRival</Text>
              <Text style={styles.tagline}>Your World is the Dance Floor</Text>
            </View>

            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Select Your Age Group</Text>
                <Text style={styles.stepDescription}>
                  This helps us create a safe, age-appropriate experience
                </Text>
                
                <View style={styles.ageGroups}>
                  {ageGroups.map((group) => (
                    <TouchableOpacity
                      key={group.value}
                      style={styles.ageButton}
                      onPress={() => handleAgeSelect(group.value)}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        style={styles.ageButtonGradient}
                      >
                        <Text style={styles.ageButtonText}>{group.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Choose Your Username</Text>
                <Text style={styles.stepDescription}>
                  This is how other dancers will find you
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor={theme.colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <GradientButton
                  title="Continue"
                  onPress={handleUsernameSubmit}
                  disabled={username.length < 3}
                  size="large"
                  style={styles.continueButton}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Enter Your Age</Text>
                <Text style={styles.stepDescription}>
                  We need your exact age for safety and age-appropriate matching
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor={theme.colors.textMuted}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  maxLength={3}
                />
                
                <GradientButton
                  title="Continue"
                  onPress={handleAgeSubmit}
                  disabled={!age || parseInt(age) < 5}
                  size="large"
                  style={styles.continueButton}
                />
              </View>
            )}

            {step === 4 && needsParentConsent && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Parent/Guardian Consent</Text>
                <Text style={styles.stepDescription}>
                  Users under 13 require parent or guardian permission
                </Text>
                
                <View style={styles.consentBox}>
                  <Text style={styles.consentText}>
                    By checking this box, I confirm that I am the parent or guardian
                    and give permission for my child to use BeatRival with restricted
                    features for safety.
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setParentConsent(!parentConsent)}
                  >
                    <View style={[styles.checkboxInner, parentConsent && styles.checkboxChecked]}>
                      {parentConsent && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>I give my consent</Text>
                  </TouchableOpacity>
                </View>
                
                <GradientButton
                  title="Complete Setup"
                  onPress={handleComplete}
                  disabled={!parentConsent}
                  size="large"
                  style={styles.continueButton}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: theme.spacing.sm,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: theme.spacing.xl,
  },
  ageGroups: {
    gap: theme.spacing.md,
  },
  ageButton: {
    marginBottom: theme.spacing.md,
  },
  ageButtonGradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    fontSize: 18,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  continueButton: {
    marginTop: theme.spacing.xl,
  },
  consentBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  consentText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: 'white',
    fontSize: 16,
  },
});