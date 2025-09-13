export type AgeGroup = '1-5' | '6-8' | '9-12' | '18-24' | '25+';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  age: number;
  ageGroup: AgeGroup;
  wins: number;
  losses: number;
  beatPoints: number;
  beatGems: number;
  rank: number;
  followers: number;
  following: number;
  bio: string;
  verified: boolean;
  isPro: boolean;
  crewId?: string;
  achievements: Achievement[];
  canChangeAgeGroup: boolean;
  parentalConsent: ParentalConsent[];
}

export interface Crew {
  id: string;
  name: string;
  leaderId: string;
  members: User[];
  fans: User[];
  createdAt: Date;
  avatar?: string;
  description?: string;
  wins: number;
  losses: number;
  beatPoints: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ParentalConsent {
  id: string;
  childUserId: string;
  parentEmail: string;
  consentType: 'age_group_change' | 'view_older_content' | 'dm_access';
  targetAgeGroup?: AgeGroup;
  granted: boolean;
  grantedAt?: Date;
  expiresAt?: Date;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: Date;
  read: boolean;
  filtered: boolean;
}

export interface CrewBattle {
  id: string;
  crew1: Crew;
  crew2: Crew;
  status: 'pending' | 'lobby' | 'live' | 'voting' | 'completed';
  startTime: Date;
  endTime?: Date;
  hashtags: string[];
  rounds: CrewBattleRound[];
  votes: {
    crew1: number;
    crew2: number;
  };
  winner?: string;
  viewers: number;
}

export interface Battle {
  id: string;
  challenger: User;
  opponent: User;
  status: 'pending' | 'lobby' | 'live' | 'voting' | 'completed';
  startTime: Date;
  endTime?: Date;
  hashtags: string[];
  videoUrl?: string;
  challengerVideo?: string;
  opponentVideo?: string;
  votes: {
    challenger: number;
    opponent: number;
  };
  winner?: string;
  viewers: number;
  duration: number;
}

export interface Challenge {
  id: string;
  from: User;
  to?: User;
  type: 'user' | 'open' | 'group';
  hashtags: string[];
  timeLimit: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  beatPoints: number;
  winRate: number;
  streak: number;
}

export interface CrewBattleRound {
  id: string;
  roundNumber: number;
  crew1Participants: User[];
  crew2Participants: User[];
  winner?: string;
  votes: {
    crew1: number;
    crew2: number;
  };
}

export interface Notification {
  id: string;
  type: 'challenge' | 'battle_start' | 'battle_result' | 'follow' | 'message' | 'crew_invite' | 'crew_battle';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'message' | 'video' | 'crew';
  targetId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

export interface VirtualItem {
  id: string;
  name: string;
  description: string;
  type: 'filter' | 'badge' | 'emote' | 'background';
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

export interface AIAssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  sessionId: string;
}