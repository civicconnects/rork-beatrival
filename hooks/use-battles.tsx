import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Battle, Challenge } from '@/types';
import { mockBattles, mockChallenges } from '@/mocks/data';

interface BattleState {
  battles: Battle[];
  challenges: Challenge[];
  activeBattle: Battle | null;
  createChallenge: (challenge: Partial<Challenge>) => void;
  acceptChallenge: (challengeId: string) => void;
  declineChallenge: (challengeId: string) => void;
  startBattle: (challengeId: string) => void;
  endBattle: (battleId: string) => void;
  vote: (battleId: string, side: 'challenger' | 'opponent') => void;
}

export const [BattleProvider, useBattles] = createContextHook<BattleState>(() => {
  const [battles, setBattles] = useState<Battle[]>(mockBattles);
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);

  const createChallenge = (challenge: Partial<Challenge>) => {
    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: challenge.from!,
      to: challenge.to,
      type: challenge.type || 'open',
      battleType: challenge.battleType || 'dance',
      hashtags: challenge.hashtags || [],
      timeLimit: challenge.timeLimit || 120,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
    };
    setChallenges([newChallenge, ...challenges]);
  };

  const acceptChallenge = (challengeId: string) => {
    setChallenges(challenges.map(c => 
      c.id === challengeId ? { ...c, status: 'accepted' as const } : c
    ));
  };

  const declineChallenge = (challengeId: string) => {
    setChallenges(challenges.map(c => 
      c.id === challengeId ? { ...c, status: 'declined' as const } : c
    ));
  };

  const startBattle = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const newBattle: Battle = {
      id: `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      challenger: challenge.from,
      opponent: challenge.to || challenge.from,
      battleType: challenge.battleType,
      status: 'lobby',
      startTime: new Date(),
      hashtags: challenge.hashtags,
      votes: { challenger: 0, opponent: 0 },
      viewers: 0,
      duration: challenge.timeLimit,
    };

    setBattles([newBattle, ...battles]);
    setActiveBattle(newBattle);
  };

  const endBattle = (battleId: string) => {
    setBattles(battles.map(b => 
      b.id === battleId ? { ...b, status: 'completed' as const, endTime: new Date() } : b
    ));
    setActiveBattle(null);
  };

  const vote = (battleId: string, side: 'challenger' | 'opponent') => {
    setBattles(battles.map(b => {
      if (b.id === battleId) {
        return {
          ...b,
          votes: {
            ...b.votes,
            [side]: b.votes[side] + 1,
          }
        };
      }
      return b;
    }));
  };

  return {
    battles,
    challenges,
    activeBattle,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    startBattle,
    endBattle,
    vote,
  };
});