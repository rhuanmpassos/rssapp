import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useProgressStore } from '../../src/store/progressStore';
import { ProgressMotivator } from '../../src/components/ProgressMotivator';
import { DailyChallengeCard } from '../../src/components/DailyChallengeCard';
import { AchievementBadge } from '../../src/components/AchievementBadge';
import { StreakBadge } from '../../src/components/StreakBadge';

export default function ProgressScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    progress,
    fetchProgress,
    refreshDailyChallenges,
    isLoading
  } = useProgressStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');

  useFocusEffect(
    React.useCallback(() => {
      fetchProgress();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    refreshDailyChallenges();
    setRefreshing(false);
  };

  if (!progress) return null;

  const nextLevelExp = Math.pow(progress.level, 2) * 100;

  // Sort achievements: Unlocked first (newest to oldest), then Locked (by rarity)
  const sortedAchievements = [...progress.achievements].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    // Both locked, sort by progress percentage
    const progressA = Math.min(a.progress / a.target, 1);
    const progressB = Math.min(b.progress / b.target, 1);
    return progressB - progressA;
  });

  // Map achievements for ProgressMotivator which expects 'unlocked' boolean
  const motivatorAchievements = progress.achievements.map(a => ({
    ...a,
    unlocked: !!a.unlockedAt
  }));

  // Filter challenges
  const newsChallenges = progress.dailyChallenges.filter(c => c.contentType === 'news' || c.contentType === 'any');
  const videoChallenges = progress.dailyChallenges.filter(c => c.contentType === 'videos');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header with Settings */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Progresso</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Progress Card */}
        <View style={styles.section}>
          <ProgressMotivator
            streak={progress.currentStreak}
            level={progress.level}
            experience={progress.experience}
            nextLevelExp={nextLevelExp}
            achievements={motivatorAchievements}
          />
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'challenges' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
            ]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'challenges' ? colors.text : colors.textTertiary }
            ]}>
              Desafios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'achievements' && { backgroundColor: colors.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'achievements' ? colors.text : colors.textTertiary }
            ]}>
              Conquistas ({progress.achievements.filter(a => a.unlockedAt).length}/{progress.achievements.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'challenges' ? (
          <View style={styles.section}>
            {/* News Challenges */}
            {newsChallenges.length > 0 && (
              <View style={styles.challengeGroup}>
                <DailyChallengeCard
                  challenges={newsChallenges}
                  contentType="news"
                />
              </View>
            )}

            {/* Video Challenges */}
            {videoChallenges.length > 0 && (
              <View style={styles.challengeGroup}>
                <DailyChallengeCard
                  challenges={videoChallenges}
                  contentType="videos"
                />
              </View>
            )}

            <Text style={[styles.infoText, { color: colors.textTertiary }]}>
              Novos desafios disponíveis todos os dias à meia-noite.
            </Text>
          </View>
        ) : (
          <View style={styles.achievementsGrid}>
            {sortedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementWrapper}>
                <AchievementBadge achievement={achievement} />
                <Text
                  style={[styles.achievementName, { color: achievement.unlockedAt ? colors.text : colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {achievement.name}
                </Text>
                {!achievement.unlockedAt && (
                  <Text style={[styles.achievementProgress, { color: colors.textTertiary }]}>
                    {Math.round((Math.min(achievement.progress, achievement.target) / achievement.target) * 100)}%
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  challengeGroup: {
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  achievementWrapper: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 24,
  },
  achievementName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  achievementProgress: {
    fontSize: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
