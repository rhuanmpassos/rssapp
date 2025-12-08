import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { ProgressBar } from './ProgressBar';
import { persuasiveCopy } from '../utils/persuasiveCopy';
import { spacing } from '../theme';

interface ProgressMotivatorProps {
  streak: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievements?: Array<{
    id: string;
    name: string;
    progress: number;
    target: number;
    unlocked: boolean;
  }>;
  onPress?: () => void;
}

export function ProgressMotivator({
  streak,
  level,
  experience,
  nextLevelExp,
  achievements = [],
  onPress,
}: ProgressMotivatorProps) {
  const { colors } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const progress = (experience / nextLevelExp) * 100;
  const nextAchievement = achievements.find((a) => !a.unlocked && a.progress > 0);

  useEffect(() => {
    if (showCelebration) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowCelebration(false));
    }
  }, [showCelebration]);

  const getStreakMessage = () => {
    if (streak === 0) return 'Comece sua sequência hoje!';
    return persuasiveCopy.progress.streak.current(streak);
  };

  const getMotivationalMessage = () => {
    if (nextAchievement) {
      const remaining = nextAchievement.target - nextAchievement.progress;
      if (remaining <= 3) {
        return persuasiveCopy.urgency.milestoneNear(remaining);
      }
    }
    if (progress > 80) {
      return `Quase no nível ${level + 1}! Continue assim`;
    }
    return null;
  };

  return (
    <Card
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      padding="base"
    >
      {/* Streak Section */}
      {streak > 0 && (
        <View style={styles.streakSection}>
          <View style={[styles.streakIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="flame" size={24} color={colors.primary} />
          </View>
          <View style={styles.streakContent}>
            <Text style={[styles.streakNumber, { color: colors.primary }]}>
              {streak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              dias seguidos
            </Text>
          </View>
          <Text style={[styles.streakMessage, { color: colors.text }]}>
            {getStreakMessage()}
          </Text>
        </View>
      )}

      {/* Level Progress */}
      <View style={styles.levelSection}>
        <View style={styles.levelHeader}>
          <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>
            {persuasiveCopy.progress.level.current(level)}
          </Text>
          <Text style={[styles.expLabel, { color: colors.textTertiary }]}>
            {experience}/{nextLevelExp} XP
          </Text>
        </View>
        <ProgressBar
          current={experience}
          target={nextLevelExp}
          height={8}
          color={colors.primary}
        />
      </View>

      {/* Next Achievement */}
      {nextAchievement && (
        <View style={styles.achievementSection}>
          <View style={styles.achievementHeader}>
            <Ionicons name="trophy-outline" size={16} color={colors.secondary} />
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              Próxima conquista
            </Text>
          </View>
          <Text style={[styles.achievementName, { color: colors.textSecondary }]}>
            {nextAchievement.name}
          </Text>
          <ProgressBar
            current={nextAchievement.progress}
            target={nextAchievement.target}
            height={6}
            color={colors.secondary}
          />
          <Text style={[styles.achievementProgress, { color: colors.textTertiary }]}>
            {persuasiveCopy.progress.achievements.progress(
              nextAchievement.progress,
              nextAchievement.target
            )}
          </Text>
        </View>
      )}

      {/* Motivational Message */}
      {getMotivationalMessage() && (
        <View style={[styles.motivationBanner, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.motivationText, { color: colors.primary }]}>
            {getMotivationalMessage()}
          </Text>
        </View>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <Animated.View
          style={[
            styles.celebration,
            { backgroundColor: colors.primary },
            { opacity: fadeAnim },
          ]}
        >
          <Ionicons name="trophy" size={32} color="#FFFFFF" />
          <Text style={styles.celebrationText}>Conquista Desbloqueada!</Text>
        </Animated.View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  streakMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  levelSection: {
    marginBottom: spacing.base,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  expLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  achievementSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  achievementProgress: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  motivationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  motivationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  celebration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  celebrationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
});

