import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { ChatMessage, AIAssistantState } from '@/types';

interface AIAssistantActions {
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  provideFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  clearChat: () => void;
}

type AIAssistantContextType = AIAssistantState & AIAssistantActions;

const KNOWLEDGE_BASE = {
  app_features: {
    battles: "BeatRival allows you to challenge other dancers to live battles. You can create challenges, accept them, and compete in real-time with voting from spectators.",
    age_groups: "We have age-based groups: 1-5, 6-8, 9-12, 18-24, and 25+. Users under 13 need parental consent for certain features.",
    crews: "You can create or join crews to compete in team battles. Crew creation requires a Pro subscription.",
    leaderboard: "Check your ranking against other dancers in your age group. Earn BeatPoints by winning battles.",
    profile: "Your profile shows your wins, losses, BeatPoints, achievements, and more. You can customize it with virtual items."
  },
  safety: {
    reporting: "You can report inappropriate content by tapping the report button. All reports are reviewed by our moderation team.",
    age_restrictions: "Users under 13 can only view content from their own age group unless parents grant specific consent.",
    content_policy: "We have zero tolerance for nudity, profanity, violence, or harassment. All content is moderated."
  },
  monetization: {
    pro_subscription: "BeatRival Pro ($3.99/month) gives you ad-free experience, exclusive features, and increased BeatPoint earnings.",
    beat_gems: "Earn BeatGems by winning battles or purchase them to buy virtual items and enter tournaments.",
    virtual_items: "Customize your profile with filters, badges, backgrounds, and emotes using BeatGems."
  },
  getting_started: {
    first_battle: "To start your first battle: 1) Tap 'New Challenge' 2) Choose your opponent or make it open 3) Set hashtags and time limit 4) Send the challenge!",
    profile_setup: "Complete your profile by adding a bio, selecting your age group, and uploading an avatar.",
    finding_opponents: "Use the Discover tab to find other dancers in your age group or search by hashtags."
  }
};

const QUICK_PROMPTS = [
  "How do I start a battle?",
  "What are BeatPoints?",
  "How do crews work?",
  "What's BeatRival Pro?"
];

const PROHIBITED_TOPICS = [
  'legal advice',
  'medical advice',
  'financial advice',
  'health advice',
  'investment advice',
  'tax advice'
];

export const [AIAssistantProvider, useAIAssistant] = createContextHook<AIAssistantContextType>(() => {
  const [state, setState] = useState<AIAssistantState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });

  const openChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
    
    // Add welcome message if it's a new session
    if (state.messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "Hello! I'm Andre, your AI assistant for BeatRival. How can I help you today?",
        timestamp: new Date()
      };
      setState(prev => ({ 
        ...prev, 
        messages: [welcomeMessage],
        isOpen: true 
      }));
    }
  }, [state.messages.length]);

  const closeChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const generateResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for prohibited topics
    const isProhibited = PROHIBITED_TOPICS.some(topic => 
      lowerMessage.includes(topic.replace(' advice', ''))
    );
    
    if (isProhibited) {
      return "I'm not able to provide advice on that topic. For concerns in this area, please consult a qualified professional or contact our human support team.";
    }

    // Battle-related questions
    if (lowerMessage.includes('battle') || lowerMessage.includes('challenge') || lowerMessage.includes('compete')) {
      if (lowerMessage.includes('start') || lowerMessage.includes('create') || lowerMessage.includes('how')) {
        return KNOWLEDGE_BASE.getting_started.first_battle;
      }
      return KNOWLEDGE_BASE.app_features.battles;
    }

    // Age group questions
    if (lowerMessage.includes('age') || lowerMessage.includes('group') || lowerMessage.includes('under 13')) {
      return KNOWLEDGE_BASE.app_features.age_groups;
    }

    // Crew questions
    if (lowerMessage.includes('crew') || lowerMessage.includes('team')) {
      return KNOWLEDGE_BASE.app_features.crews;
    }

    // Points and ranking
    if (lowerMessage.includes('point') || lowerMessage.includes('rank') || lowerMessage.includes('leaderboard')) {
      if (lowerMessage.includes('beatpoint')) {
        return "BeatPoints are earned by winning battles and determine your ranking on the leaderboard. The more battles you win, the higher you climb!";
      }
      return KNOWLEDGE_BASE.app_features.leaderboard;
    }

    // Pro subscription
    if (lowerMessage.includes('pro') || lowerMessage.includes('subscription') || lowerMessage.includes('premium')) {
      return KNOWLEDGE_BASE.monetization.pro_subscription;
    }

    // BeatGems
    if (lowerMessage.includes('gem') || lowerMessage.includes('currency') || lowerMessage.includes('buy')) {
      return KNOWLEDGE_BASE.monetization.beat_gems;
    }

    // Safety and reporting
    if (lowerMessage.includes('report') || lowerMessage.includes('inappropriate') || lowerMessage.includes('safety')) {
      return KNOWLEDGE_BASE.safety.reporting;
    }

    // Profile questions
    if (lowerMessage.includes('profile') || lowerMessage.includes('avatar') || lowerMessage.includes('bio')) {
      return KNOWLEDGE_BASE.getting_started.profile_setup;
    }

    // Finding opponents
    if (lowerMessage.includes('find') || lowerMessage.includes('discover') || lowerMessage.includes('opponent')) {
      return KNOWLEDGE_BASE.getting_started.finding_opponents;
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm here to help you with BeatRival. You can ask me about battles, crews, rankings, or any other features. What would you like to know?";
    }

    // Default response
    return "I'd be happy to help! You can ask me about:\n\n• Starting battles and challenges\n• Age groups and safety features\n• Crews and team battles\n• BeatPoints and rankings\n• BeatRival Pro subscription\n• Profile setup and customization\n\nWhat specific topic interests you?";
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage],
      isTyping: true 
    }));

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responseContent = generateResponse(content);
    
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, assistantMessage],
      isTyping: false 
    }));
  }, [generateResponse]);

  const provideFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }, []);

  return useMemo(() => ({
    ...state,
    openChat,
    closeChat,
    sendMessage,
    provideFeedback,
    clearChat
  }), [state, openChat, closeChat, sendMessage, provideFeedback, clearChat]);
});

export { QUICK_PROMPTS };
export type { AIAssistantContextType };