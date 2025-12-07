import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { ProgressBar } from './ProgressBar';
import { spacing, borderRadius } from '../theme';

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
}

interface DailyChallengeCardProps {
  challenges: DailyChallenge[];
  contentType: 'news' | 'videos';
  onChallengeComplete?: (challenge: DailyChallenge) => void;
  onPress?: () => void;
}

// Desafios específicos para notícias
const NEWS_CHALLENGES: Omit<DailyChallenge, 'progress' | 'completed'>[] = [
  {
    id: 'read_3',
    title: 'Leitor Ativo',
    description: 'Leia 3 artigos hoje',
    icon: 'newspaper',
    target: 3,
    xpReward: 30,
    type: 'read',
  },
  {
    id: 'read_5',
    title: 'Informado',
    description: 'Leia 5 artigos hoje',
    icon: 'book',
    target: 5,
    xpReward: 50,
    type: 'read',
  },
  {
    id: 'explore_feed',
    title: 'Explorador',
    description: 'Adicione um novo site ao seu feed',
    icon: 'compass',
    target: 1,
    xpReward: 25,
    type: 'explore',
  },
  {
    id: 'morning_reader',
    title: 'Leitor Matutino',
    description: 'Leia um artigo pela manhã',
    icon: 'sunny',
    target: 1,
    xpReward: 20,
    type: 'read',
  },
];

// Desafios específicos para vídeos
const VIDEO_CHALLENGES: Omit<DailyChallenge, 'progress' | 'completed'>[] = [
  {
    id: 'watch_2',
    title: 'Espectador',
    description: 'Assista 2 vídeos hoje',
    icon: 'play-circle',
    target: 2,
    xpReward: 30,
    type: 'watch',
  },
  {
    id: 'watch_5',
    title: 'Maratonista',
    description: 'Assista 5 vídeos hoje',
    icon: 'videocam',
    target: 5,
    xpReward: 50,
    type: 'watch',
  },
  {
    id: 'explore_channel',
    title: 'Descobridor',
    description: 'Adicione um novo canal ao seu feed',
    icon: 'logo-youtube',
    target: 1,
    xpReward: 25,
    type: 'explore',
  },
  {
    id: 'night_watcher',
    title: 'Coruja Noturna',
    description: 'Assista um vídeo à noite',
    icon: 'moon',
    target: 1,
    xpReward: 20,
    type: 'watch',
  },
];

export function DailyChallengeCard({
  challenges,
  contentType,
  onChallengeComplete,
  onPress,
}: DailyChallengeCardProps) {
  const { colors } = useTheme();
  const [activeChallenge, setActiveChallenge] = useState<DailyChallenge | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Selecionar desafio ativo (o primeiro não completado)
  useEffect(() => {
    const pending = challenges.find(c => !c.completed);
    setActiveChallenge(pending || null);
  }, [challenges]);

  // Animação de pulso quando próximo de completar
  useEffect(() => {
    if (activeChallenge && activeChallenge.progress > 0) {
      const progressPercent = activeChallenge.progress / activeChallenge.target;

      if (progressPercent >= 0.7 && progressPercent < 1) {
        // Pulsar quando próximo de completar
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }

    return () => {
      pulseAnim.setValue(1);
    };
  }, [activeChallenge]);

  // Detectar quando desafio é completado
  useEffect(() => {
    if (activeChallenge && activeChallenge.progress >= activeChallenge.target && !activeChallenge.completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onChallengeComplete?.(activeChallenge);
    }
  }, [activeChallenge?.progress]);

  if (!activeChallenge) {
    // Todos os desafios completados
    return (
      <Card style={[styles.container, { backgroundColor: colors.card }]} padding="md">
        <View style={styles.completedContainer}>
          <View style={[styles.completedIcon, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="checkmark-circle" size={32} color={colors.secondary} />
          </View>
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            {contentType === 'news' ? '🎉 Desafios de hoje completos!' : '🎉 Desafios de vídeo completos!'}
          </Text>
          <Text style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
            Volte amanhã para novos desafios
          </Text>
        </View>
      </Card>
    );
  }

  const progress = (activeChallenge.progress / activeChallenge.target) * 100;
  const isAlmostDone = progress >= 70 && progress < 100;

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Card style={[styles.container, { backgroundColor: colors.card }]} padding="md">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={activeChallenge.icon} size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.label, { color: colors.textTertiary }]}>
                  {contentType === 'news' ? '📰 Desafio do Dia' : '🎬 Desafio de Vídeo'}
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>
                  {activeChallenge.title}
                </Text>
              </View>
            </View>
            <View style={[styles.xpBadge, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.xpText, { color: colors.secondary }]}>
                +{activeChallenge.xpReward} XP
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {activeChallenge.description}
          </Text>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <ProgressBar
              current={activeChallenge.progress}
              target={activeChallenge.target}
              height={10}
              color={isAlmostDone ? colors.secondary : colors.primary}
            />
            <View style={styles.progressLabels}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {activeChallenge.progress}/{activeChallenge.target}
              </Text>
              {isAlmostDone && (
                <Text style={[styles.almostText, { color: colors.secondary }]}>
                  🎯 Quase lá!
                </Text>
              )}
            </View>
          </View>

          {/* Remaining challenges indicator */}
          {challenges.length > 1 && (
            <View style={styles.remainingContainer}>
              <View style={styles.dots}>
                {challenges.map((c, idx) => (
                  <View
                    key={c.id}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: c.completed
                          ? colors.secondary
                          : c.id === activeChallenge.id
                            ? colors.primary
                            : colors.backgroundSecondary,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.remainingText, { color: colors.textTertiary }]}>
                {challenges.filter(c => !c.completed).length} restantes
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Helper para gerar desafios diários baseados no tipo de conteúdo
export function generateDailyChallenges(contentType: 'news' | 'videos'): DailyChallenge[] {
  const templates = contentType === 'news' ? NEWS_CHALLENGES : VIDEO_CHALLENGES;

  // Selecionar 2 desafios aleatórios para o dia
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);

  return selected.map(template => ({
    ...template,
    progress: 0,
    completed: false,
  }));
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  almostText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  completedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
