import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, AgeGroup } from '@/types';
import { mockUsers } from '@/mocks/data';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  ageVerified: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (ageGroup: AgeGroup, username: string, age: number) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Platform.OS === 'web' ? false : true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  const loadUser = useCallback(async () => {
    // Skip async storage on web during initial render to prevent hydration issues
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('user');
      const onboarded = await AsyncStorage.getItem('onboarded');
      const verified = await AsyncStorage.getItem('ageVerified');
      
      if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
        try {
          const parsedUser = JSON.parse(stored);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            // Ensure achievements array exists
            if (!parsedUser.achievements) {
              parsedUser.achievements = [];
            }
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data structure, clearing storage');
            await AsyncStorage.removeItem('user');
            setUser(null);
          }
        } catch (parseError) {
          console.error('Failed to parse stored user data, clearing corrupted storage:', parseError);
          // Clear all auth-related storage on parse error
          await AsyncStorage.multiRemove(['user', 'onboarded', 'ageVerified']);
          setUser(null);
          setIsOnboarded(false);
          setAgeVerified(false);
        }
      } else {
        // Clear invalid stored data
        if (stored && (stored === 'undefined' || stored === 'null' || stored.trim() === '')) {
          await AsyncStorage.removeItem('user');
        }
        setUser(null);
      }
      
      try {
        setIsOnboarded(onboarded === 'true');
        setAgeVerified(verified === 'true');
      } catch (storageError) {
        console.error('Failed to read onboarding/verification status:', storageError);
        setIsOnboarded(false);
        setAgeVerified(false);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
      setIsOnboarded(false);
      setAgeVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (username: string) => {
    const mockUser = mockUsers.find(u => u.username === username) || mockUsers[0];
    setUser(mockUser);
    
    // Only use AsyncStorage on mobile
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsOnboarded(false);
    setAgeVerified(false);
    
    // Only use AsyncStorage on mobile
    if (Platform.OS !== 'web') {
      await AsyncStorage.multiRemove(['user', 'onboarded', 'ageVerified']);
    }
  }, []);

  const completeOnboarding = useCallback(async (ageGroup: AgeGroup, username: string, age: number) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      displayName: username,
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
      age,
      ageGroup,
      wins: 0,
      losses: 0,
      beatPoints: 0,
      beatGems: 100,
      rank: 0,
      followers: 0,
      following: 0,
      bio: '',
      verified: false,
      isPro: false,
      achievements: [],
      canChangeAgeGroup: age >= 13,
      parentalConsent: [],
    };
    
    setUser(newUser);
    setIsOnboarded(true);
    setAgeVerified(true);
    
    // Only use AsyncStorage on mobile
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('onboarded', 'true');
      await AsyncStorage.setItem('ageVerified', 'true');
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Only use AsyncStorage on mobile
    if (Platform.OS !== 'web') {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isOnboarded,
    ageVerified,
    login,
    logout,
    completeOnboarding,
    updateProfile,
  }), [user, isLoading, isOnboarded, ageVerified, login, logout, completeOnboarding, updateProfile]);
});