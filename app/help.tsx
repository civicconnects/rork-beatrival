import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I start a battle?',
    answer: 'Tap the Battle tab, then choose "Challenge User" or "Open Challenge". Select your opponent, set a time limit, add hashtags, and send the challenge!',
    category: 'Battles',
  },
  {
    id: '2',
    question: 'What are BeatGems and how do I earn them?',
    answer: 'BeatGems are our virtual currency. Earn them by winning battles, daily login streaks, and completing challenges. Use them to buy filters, badges, and enter exclusive tournaments.',
    category: 'BeatGems',
  },
  {
    id: '3',
    question: 'How do age groups work?',
    answer: 'Age groups ensure fair and safe competition. Users are matched with others in their age group: Grades 1-5, 6-8, 9-12, 18-24, and 25+. Users 13+ can change their age group freely.',
    category: 'Safety',
  },
  {
    id: '4',
    question: 'Can I create my own crew?',
    answer: 'Yes! Go to Profile > My Crew > Create New Crew. As a crew leader, you can invite members and compete in crew battles.',
    category: 'Crews',
  },
  {
    id: '5',
    question: 'What happens if I report inappropriate content?',
    answer: 'All reports are reviewed by our moderation team within 24 hours. We take safety seriously and will take appropriate action against violations.',
    category: 'Safety',
  },
  {
    id: '6',
    question: 'How do I upgrade to BeatRival Pro?',
    answer: 'Tap the Pro upgrade card on your profile. Pro includes ad-free experience, exclusive filters, 2x BeatPoints earning, and a Pro badge.',
    category: 'Pro Features',
  },
  {
    id: '7',
    question: 'Why can\'t I send direct messages?',
    answer: 'Direct messaging is restricted for users under 13 for safety. Parents can grant access through the parent dashboard.',
    category: 'Safety',
  },
  {
    id: '8',
    question: 'How are battles judged?',
    answer: 'Battles are judged by spectators and participants through voting. In the future, we\'ll introduce AI judging for more objective scoring.',
    category: 'Battles',
  },
];

const categories = ['All', 'Battles', 'Safety', 'Crews', 'BeatGems', 'Pro Features'];

export default function HelpScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQ = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeDescription}>
            Find answers to common questions about BeatRival. If you can&apos;t find what you&apos;re looking for, contact our support team.
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        <View style={styles.faqList}>
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  {isExpanded ? (
                    <ChevronDown size={20} color={theme.colors.primary} />
                  ) : (
                    <ChevronRight size={20} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is here to help you with any questions or issues.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Resources */}
        <View style={styles.safetySection}>
          <Text style={styles.safetyTitle}>🛡️ Safety Resources</Text>
          <View style={styles.safetyLinks}>
            <TouchableOpacity style={styles.safetyLink}>
              <Text style={styles.safetyLinkText}>Community Guidelines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.safetyLink}>
              <Text style={styles.safetyLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.safetyLink}>
              <Text style={styles.safetyLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.safetyLink}>
              <Text style={styles.safetyLinkText}>Parent Dashboard</Text>
            </TouchableOpacity>
          </View>
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
  welcomeSection: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  welcomeTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoryFilter: {
    marginBottom: theme.spacing.lg,
  },
  categoryFilterContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  faqList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  faqItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  faqQuestionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  faqAnswer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  faqAnswerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  contactSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  contactTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  contactDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  safetySection: {
    margin: theme.spacing.lg,
    marginTop: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  safetyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  safetyLinks: {
    gap: theme.spacing.sm,
  },
  safetyLink: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  safetyLinkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});