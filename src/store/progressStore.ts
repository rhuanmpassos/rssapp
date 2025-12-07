import { create } from 'zustand';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  target: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  type: 'read' | 'watch' | 'explore' | 'streak';
  contentType: 'news' | 'videos' | 'any';
}

export interface UserProgress {
  totalSubscriptions: number;
  totalItemsRead: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  level: number;
  experience: number;
  achievements: Achievement[];
  totalTimeSpent: number; // in minutes
  dailyChallenges: DailyChallenge[];
  lastChallengeDate: string | null;
}

interface ProgressState {
  progress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  pendingCelebration: Achievement | null;

  // Actions
  fetchProgress: () => Promise<void>;
  incrementItemsRead: (type: 'news' | 'video') => Promise<void>;
  checkStreak: () => Promise<void>;
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>;
  resetProgress: () => void;

  // New Actions
  refreshDailyChallenges: () => void;
  updateChallengeProgress: (type: string, amount?: number) => void;
  dismissCelebration: () => void;
  checkStreakWarning: () => boolean; // Returns true if warning should be shown
}

const PROGRESS_KEY = 'user_progress';
const STREAK_KEY = 'user_streak';
const LAST_ACTIVE_KEY = 'last_active_date';

// ... (Existing CONSTANTS like ACHIEVEMENTS remain same, omitted for brevity but should be preserved in real file)
// Re-declaring ACHIEVEMENTS here for the purpose of the tool call context, 
// in a real scenario replace_file_content would merge context.
// Ideally I should not delete them. I will try to keep the file structure.

// Achievement definitions
const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_step',
    name: 'Primeiro Passo',
    description: 'Adicione sua primeira subscription',
    icon: 'footsteps',
    rarity: 'common',
    target: 1,
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Adicione 5 sites ou canais',
    icon: 'compass',
    rarity: 'common',
    target: 5,
  },
  {
    id: 'curator',
    name: 'Curador',
    description: 'Adicione 10 sites ou canais',
    icon: 'library',
    rarity: 'rare',
    target: 10,
  },
  {
    id: 'collector',
    name: 'Colecionador',
    description: 'Adicione 25 sites ou canais',
    icon: 'archive',
    rarity: 'epic',
    target: 25,
  },
  {
    id: 'master_curator',
    name: 'Mestre Curador',
    description: 'Adicione 50 sites ou canais',
    icon: 'trophy',
    rarity: 'legendary',
    target: 50,
  },
  {
    id: 'reader',
    name: 'Leitor',
    description: 'Leia 10 artigos ou vídeos',
    icon: 'book',
    rarity: 'common',
    target: 10,
  },
  {
    id: 'avid_reader',
    name: 'Leitor Ávido',
    description: 'Leia 50 artigos ou vídeos',
    icon: 'library',
    rarity: 'rare',
    target: 50,
  },
  {
    id: 'bookworm',
    name: 'Viciado em Leitura',
    description: 'Leia 100 artigos ou vídeos',
    icon: 'school',
    rarity: 'epic',
    target: 100,
  },
  {
    id: 'dedicated',
    name: 'Dedicado',
    description: 'Mantenha uma sequência de 3 dias',
    icon: 'flame',
    rarity: 'common',
    target: 3,
  },
  {
    id: 'committed',
    name: 'Comprometido',
    description: 'Mantenha uma sequência de 7 dias',
    icon: 'flame',
    rarity: 'rare',
    target: 7,
  },
  {
    id: 'loyal',
    name: 'Fiel',
    description: 'Mantenha uma sequência de 30 dias',
    icon: 'flame',
    rarity: 'epic',
    target: 30,
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Abra o app antes das 8h por 3 dias',
    icon: 'sunny',
    rarity: 'common',
    target: 3,
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Abra o app após 23h por 3 dias',
    icon: 'moon',
    rarity: 'common',
    target: 3,
  },
];

// Challenge Templates
const CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'id' | 'progress' | 'completed'>[] = [
  { title: 'Leitor Ativo', description: 'Leia 3 artigos hoje', icon: 'newspaper', target: 3, xpReward: 30, type: 'read', contentType: 'news' },
  { title: 'Informado', description: 'Leia 5 artigos hoje', icon: 'book', target: 5, xpReward: 50, type: 'read', contentType: 'news' },
  { title: 'Explorador', description: 'Adicione um novo site', icon: 'compass', target: 1, xpReward: 25, type: 'explore', contentType: 'news' },
  { title: 'Espectador', description: 'Assista 2 vídeos', icon: 'play-circle', target: 2, xpReward: 30, type: 'watch', contentType: 'videos' },
  { title: 'Maratonista', description: 'Assista 5 vídeos', icon: 'videocam', target: 5, xpReward: 50, type: 'watch', contentType: 'videos' },
  { title: 'Descobridor', description: 'Adicione um canal', icon: 'logo-youtube', target: 1, xpReward: 25, type: 'explore', contentType: 'videos' },
];

function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,
  isLoading: false,
  error: null,
  pendingCelebration: null,

  fetchProgress: async () => {
    try {
      set({ isLoading: true, error: null });

      // Try local storage first to be faster
      const localProgress = await AsyncStorage.getItem(PROGRESS_KEY);

      if (localProgress) {
        const parsed = JSON.parse(localProgress);
        // Ensure dailyChallenges exists for migration
        if (!parsed.dailyChallenges) parsed.dailyChallenges = [];
        set({ progress: parsed, isLoading: false });

        // Check if challenges need refresh
        get().refreshDailyChallenges();
      } else {
        // Initialize new progress
        const newProgress: UserProgress = {
          totalSubscriptions: 0,
          totalItemsRead: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          level: 1,
          experience: 0,
          achievements: ACHIEVEMENTS.map((ach) => ({
            ...ach,
            unlockedAt: null,
            progress: 0,
          })),
          totalTimeSpent: 0,
          dailyChallenges: [],
          lastChallengeDate: null,
        };

        // Generate initial challenges
        const today = new Date().toDateString();
        const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
        newProgress.dailyChallenges = shuffled.slice(0, 3).map((t, i) => ({
          ...t,
          id: `challenge_${Date.now()}_${i}`,
          progress: 0,
          completed: false,
        }));
        newProgress.lastChallengeDate = today;

        await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
        set({ progress: newProgress, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch progress',
        isLoading: false,
      });
    }
  },

  incrementItemsRead: async (type: 'news' | 'video') => {
    const { progress } = get();
    if (!progress) return;

    const newProgress = {
      ...progress,
      totalItemsRead: progress.totalItemsRead + 1,
      experience: progress.experience + 10,
    };

    newProgress.level = calculateLevel(newProgress.experience);

    // Update challenges
    const challengeType = type === 'news' ? 'read' : 'watch';
    get().updateChallengeProgress(challengeType, 1);

    // Check reading achievements
    // ... (Reading achievement logic)
    const readingAchievements = ['reader', 'avid_reader', 'bookworm'];
    readingAchievements.forEach((achId) => {
      const achievement = newProgress.achievements.find((a) => a.id === achId);
      if (achievement && !achievement.unlockedAt) {
        achievement.progress = Math.min(newProgress.totalItemsRead, achievement.target);
        if (achievement.progress >= achievement.target) {
          achievement.unlockedAt = new Date();
          get().unlockAchievement(achId);
        }
      }
    });

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    set({ progress: newProgress });
  },

  checkStreak: async () => {
    const { progress } = get();
    if (!progress) return;

    const today = new Date().toDateString();
    const lastActive = progress.lastActiveDate
      ? new Date(progress.lastActiveDate).toDateString()
      : null;

    let newStreak = progress.currentStreak;
    let newLongestStreak = progress.longestStreak;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastActive === yesterdayStr) {
      newStreak = progress.currentStreak + 1;
      if (newStreak > newLongestStreak) newLongestStreak = newStreak;
    } else if (lastActive !== today) {
      // Logic for streak warning/reset can happen here or externally
      // If we want forgiving streak (24h grace), we can implement it here
      newStreak = 1;
    }

    const newProgress = {
      ...progress,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today,
      experience: progress.experience + 5,
    };

    newProgress.level = calculateLevel(newProgress.experience);

    // Check streak achievements
    const streakAchievements = ['dedicated', 'committed', 'loyal'];
    streakAchievements.forEach((achId) => {
      const achievement = newProgress.achievements.find((a) => a.id === achId);
      if (achievement && !achievement.unlockedAt) {
        achievement.progress = Math.min(newStreak, achievement.target);
        if (achievement.progress >= achievement.target) {
          achievement.unlockedAt = new Date();
          get().unlockAchievement(achId);
        }
      }
    });

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    set({ progress: newProgress });
    get().refreshDailyChallenges();
  },

  unlockAchievement: (achievementId: string) => {
    const { progress } = get();
    if (!progress) return;

    const achievement = progress.achievements.find((a) => a.id === achievementId);
    if (!achievement) return;

    const xpBonus = { common: 25, rare: 50, epic: 100, legendary: 250 };
    const bonus = xpBonus[achievement.rarity];

    const newProgress = {
      ...progress,
      experience: progress.experience + bonus,
    };
    newProgress.level = calculateLevel(newProgress.experience);

    set({
      progress: newProgress,
      pendingCelebration: achievement
    });
  },

  updateProgress: async (updates: Partial<UserProgress>) => {
    const { progress } = get();
    if (!progress) return;

    const newProgress = { ...progress, ...updates };
    if (updates.experience !== undefined) {
      newProgress.level = calculateLevel(newProgress.experience);
    }

    // Check subscription achievements if updating subscriptions
    if (updates.totalSubscriptions !== undefined) {
      const subsAch = ['first_step', 'explorer', 'curator', 'collector', 'master_curator'];
      subsAch.forEach(achId => {
        const achievement = newProgress.achievements.find(a => a.id === achId);
        if (achievement && !achievement.unlockedAt) {
          achievement.progress = Math.min(newProgress.totalSubscriptions, achievement.target);
          if (achievement.progress >= achievement.target) {
            achievement.unlockedAt = new Date();
            get().unlockAchievement(achId);
          }
        }
      });
      // Also update explore challenges
      get().updateChallengeProgress('explore', 1);
    }

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    set({ progress: newProgress });
  },

  resetProgress: async () => {
    await AsyncStorage.removeItem(PROGRESS_KEY);
    set({ progress: null });
  },

  refreshDailyChallenges: () => {
    const { progress } = get();
    if (!progress) return;

    const today = new Date().toDateString();
    if (progress.lastChallengeDate !== today) {
      // New day, new challenges
      const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
      const newChallenges = shuffled.slice(0, 3).map((t, i) => ({
        ...t,
        id: `challenge_${Date.now()}_${i}`,
        progress: 0,
        completed: false,
      }));

      const newProgress = {
        ...progress,
        dailyChallenges: newChallenges,
        lastChallengeDate: today,
      };

      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      set({ progress: newProgress });
    }
  },

  updateChallengeProgress: (type: string, amount = 1) => {
    const { progress } = get();
    if (!progress) return;

    let xpGained = 0;
    const updatedChallenges = progress.dailyChallenges.map(challenge => {
      if (!challenge.completed && challenge.type === type) {
        const newProgress = Math.min(challenge.progress + amount, challenge.target);
        if (newProgress >= challenge.target && !challenge.completed) {
          xpGained += challenge.xpReward;
          return { ...challenge, progress: newProgress, completed: true };
        }
        return { ...challenge, progress: newProgress };
      }
      return challenge;
    });

    if (xpGained > 0) {
      const newProgress = {
        ...progress,
        dailyChallenges: updatedChallenges,
        experience: progress.experience + xpGained,
      };
      newProgress.level = calculateLevel(newProgress.experience);
      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      set({ progress: newProgress });
    } else {
      // Just save challenges if no XP gained
      const newProgress = { ...progress, dailyChallenges: updatedChallenges };
      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      set({ progress: newProgress });
    }
  },

  dismissCelebration: () => {
    set({ pendingCelebration: null });
  },

  checkStreakWarning: () => {
    const { progress } = get();
    if (!progress || progress.currentStreak < 3) return false;

    const today = new Date().toDateString();
    const lastActive = progress.lastActiveDate
      ? new Date(progress.lastActiveDate).toDateString()
      : null;

    // Warning if not active today and it's late (e.g. after 6 PM)
    const hour = new Date().getHours();
    return lastActive !== today && hour >= 18;
  },
}));

