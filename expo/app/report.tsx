import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { GradientButton } from '@/components/GradientButton';
import { reportReasons } from '@/mocks/data';

export default function ReportScreen() {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for your report.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it and take appropriate action.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <AlertTriangle size={24} color={theme.colors.warning} />
          <Text style={styles.infoTitle}>Help us keep BeatRival safe</Text>
          <Text style={styles.infoText}>
            Report inappropriate content, bugs, or other issues. All reports are reviewed by our team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you reporting?</Text>
          {reportReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.reasonItem,
                selectedReason === reason && styles.reasonItemSelected
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={[
                styles.radioButton,
                selectedReason === reason && styles.radioButtonSelected
              ]} />
              <Text style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Please provide details about the issue..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500 characters</Text>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Submit Report"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            False reports may result in account restrictions. Please only report genuine issues.
          </Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 86, 7, 0.2)',
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reasonItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255, 0, 110, 0.1)',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  reasonText: {
    color: theme.colors.text,
    fontSize: 16,
    flex: 1,
  },
  reasonTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 120,
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    paddingVertical: theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});