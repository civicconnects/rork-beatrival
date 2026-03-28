import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Flag } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';
import { mockDirectMessages, mockUsers } from '@/mocks/data';
import { DirectMessage } from '@/types';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages] = useState<DirectMessage[]>(mockDirectMessages);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noUserText}>Please log in to view messages</Text>
      </SafeAreaView>
    );
  }

  // Check if user is under 13 and doesn't have DM access
  const canUseDMs = user.age >= 13 || (user.parentalConsent && user.parentalConsent.some(
    consent => consent.consentType === 'dm_access' && consent.granted
  ));

  if (!canUseDMs) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.restrictedAccess}>
          <Text style={styles.restrictedIcon}>🔒</Text>
          <Text style={styles.restrictedTitle}>Messages Restricted</Text>
          <Text style={styles.restrictedDescription}>
            Direct messaging is restricted for users under 13. 
            A parent or guardian can grant access from the parent dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(message);
    return acc;
  }, {} as Record<string, DirectMessage[]>);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, this would send to the server
    Alert.alert('Message Sent', 'Your message has been sent and will be reviewed for safety.');
    setNewMessage('');
  };

  const handleReportMessage = (messageId: string) => {
    Alert.alert(
      'Report Message',
      'This message will be reported to our moderation team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {
          // In a real app, this would report to the server
          Alert.alert('Reported', 'Thank you for helping keep BeatRival safe.');
        }}
      ]
    );
  };

  if (selectedConversation) {
    const conversationMessages = conversations[selectedConversation] || [];
    const otherUser = mockUsers.find(u => u.id === selectedConversation);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{otherUser?.displayName}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.messagesContainer}>
          {conversationMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageItem,
                message.senderId === user.id ? styles.sentMessage : styles.receivedMessage
              ]}
            >
              <Text style={styles.messageContent}>{message.content}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.messageTime}>
                  {message.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {message.senderId !== user.id && (
                  <TouchableOpacity onPress={() => handleReportMessage(message.id)}>
                    <Flag size={14} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.messageInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textMuted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Send size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyText}>
            🛡️ All messages are filtered for safety. Inappropriate content will be removed.
          </Text>
        </View>

        <View style={styles.conversationsList}>
          {Object.entries(conversations).map(([userId, userMessages]) => {
            const otherUser = mockUsers.find(u => u.id === userId);
            const lastMessage = userMessages[userMessages.length - 1];
            const unreadCount = userMessages.filter(m => !m.read && m.senderId !== user.id).length;
            
            return (
              <TouchableOpacity
                key={userId}
                style={styles.conversationItem}
                onPress={() => setSelectedConversation(userId)}
              >
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>{otherUser?.displayName}</Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {lastMessage.content}
                  </Text>
                </View>
                <View style={styles.conversationMeta}>
                  <Text style={styles.messageTime}>
                    {lastMessage.sentAt.toLocaleDateString()}
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {Object.keys(conversations).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyDescription}>
              Start a conversation with other dancers!
            </Text>
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
    padding: theme.spacing.md,
  },
  safetyNotice: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  safetyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  conversationsList: {
    gap: theme.spacing.sm,
  },
  conversationItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  lastMessage: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  messageTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  messagesContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  messageItem: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    borderBottomRightRadius: 4,
    padding: theme.spacing.md,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    padding: theme.spacing.md,
  },
  messageContent: {
    color: 'white',
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    padding: theme.spacing.sm,
  },
  restrictedAccess: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  restrictedIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  restrictedTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  restrictedDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  noUserText: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
  },
});