import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MessageCircle, 
  X, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Bot,
  HelpCircle 
} from 'lucide-react-native';
import { useAIAssistant, QUICK_PROMPTS } from '@/hooks/use-ai-assistant';
import { theme } from '@/constants/theme';
import { ChatMessage } from '@/types';



export function AIAssistant() {
  const {
    isOpen,
    messages,
    isTyping,
    openChat,
    closeChat,
    sendMessage,
    provideFeedback,
  } = useAIAssistant();

  const [inputText, setInputText] = useState<string>('');
  const [showQuickPrompts, setShowQuickPrompts] = useState<boolean>(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isOpen, slideAnim]);

  useEffect(() => {
    if (!isOpen && messages.length === 0) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(pulse, 3000);
        });
      };
      pulse();
    }
  }, [isOpen, messages.length, pulseAnim]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const message = inputText.trim();
    setInputText('');
    setShowQuickPrompts(false);
    
    await sendMessage(message);
  };

  const handleQuickPrompt = async (prompt: string) => {
    setShowQuickPrompts(false);
    await sendMessage(prompt);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Bot size={16} color={theme.colors.primary} />
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
            {message.content}
          </Text>
          
          {!isUser && (
            <View style={styles.feedbackContainer}>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  message.feedback === 'positive' && styles.feedbackButtonActive
                ]}
                onPress={() => provideFeedback(message.id, 'positive')}
                testID={`feedback-positive-${message.id}`}
              >
                <ThumbsUp 
                  size={12} 
                  color={message.feedback === 'positive' ? theme.colors.success : theme.colors.textMuted} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  message.feedback === 'negative' && styles.feedbackButtonActive
                ]}
                onPress={() => provideFeedback(message.id, 'negative')}
                testID={`feedback-negative-${message.id}`}
              >
                <ThumbsDown 
                  size={12} 
                  color={message.feedback === 'negative' ? theme.colors.error : theme.colors.textMuted} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer]}>
      <View style={styles.botAvatar}>
        <Bot size={16} color={theme.colors.primary} />
      </View>
      <View style={[styles.messageBubble, styles.assistantBubble]}>
        <Text style={styles.typingText}>Andre is typing...</Text>
      </View>
    </View>
  );

  if (!isOpen) {
    return (
      <Animated.View 
        style={[
          styles.floatingButton,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={openChat}
          style={styles.floatingButtonInner}
          testID="ai-assistant-open"
        >
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={styles.floatingButtonGradient}
          >
            <MessageCircle size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.chatContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [400, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={theme.colors.gradients.surface}
        style={styles.chatWindow}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.andreAvatar}>
              <Bot size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Andre - Your Help Assistant</Text>
              <Text style={styles.headerSubtitle}>AI Assistant for BeatRival</Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={closeChat}
            style={styles.closeButton}
            testID="ai-assistant-close"
          >
            <X size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <HelpCircle size={12} color={theme.colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Andre here! I&apos;m an AI assistant for BeatRival. My responses are based on our pre-approved guidelines. 
            My advice does not constitute professional legal, financial, or medical opinion. 
            For important matters, please contact support.
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && renderTypingIndicator()}
          
          {/* Quick Prompts */}
          {showQuickPrompts && messages.length <= 1 && (
            <View style={styles.quickPromptsContainer}>
              <Text style={styles.quickPromptsTitle}>Quick questions:</Text>
              {QUICK_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.quickPromptButton}
                  onPress={() => handleQuickPrompt(prompt)}
                  testID={`quick-prompt-${prompt.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Andre anything about BeatRival..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            maxLength={500}
            testID="ai-assistant-input"
          />
          
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            disabled={!inputText.trim()}
            testID="ai-assistant-send"
          >
            <Send size={16} color={inputText.trim() ? theme.colors.primary : theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 90,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonInner: {
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 90,
    right: 20,
    zIndex: 1000,
  },
  chatWindow: {
    width: 350,
    maxWidth: '90%',
    height: 500,
    maxHeight: '60%',
    borderRadius: theme.borderRadius.xl,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  andreAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  disclaimerText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    flex: 1,
    lineHeight: 14,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: theme.colors.text,
  },
  typingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  feedbackContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  feedbackButton: {
    padding: 4,
    borderRadius: 4,
  },
  feedbackButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  quickPromptsContainer: {
    marginTop: theme.spacing.md,
  },
  quickPromptsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  quickPromptButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickPromptText: {
    fontSize: 13,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    maxHeight: 80,
    minHeight: 40,
  },
  sendButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});