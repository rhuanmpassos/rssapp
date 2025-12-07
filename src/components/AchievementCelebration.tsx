import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../theme';
import { Achievement } from '../store/progressStore';

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

// Simple particle component
const Particle = ({ delay, angle, color }: { delay: number; angle: number; color: string }) => {
  const distance = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    distance.value = withDelay(
      delay,
      withTiming(150, { duration: 1000, easing: Easing.out(Easing.quad) })
    );
    opacity.value = withDelay(
      delay + 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const rad = (angle * Math.PI) / 180;
    const x = distance.value * Math.cos(rad);
    const y = distance.value * Math.sin(rad);

    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color },
        style,
      ]}
    />
  );
};

export function AchievementCelebration({
  achievement,
  onDismiss,
}: AchievementCelebrationProps) {
  const { colors, isDark } = useTheme();
  const [showParticles, setShowParticles] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (achievement) {
      setShowParticles(true);

      // Haptics pattern for celebration
      const playHaptics = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      };
      playHaptics();

      // Main animation
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15 });

      // Glow pulsing
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 })
        ),
        -1,
        true
      );

      // Dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleDismiss = () => {
    scale.value = withTiming(0.8, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
        runOnJS(setShowParticles)(false);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.5 }],
  }));

  if (!achievement) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#F59E0B'; // Gold
      case 'epic': return '#8B5CF6';      // Purple
      case 'rare': return '#3B82F6';      // Blue
      default: return '#10B981';          // Green
    }
  };

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <Modal transparent visible={!!achievement} animationType="none">
      <View style={styles.overlay}>
        <View style={styles.backdrop} />

        {/* Confetti/Particles */}
        {showParticles && (
          <View style={styles.particlesContainer}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Particle
                key={i}
                delay={0}
                angle={i * 30}
                color={i % 2 === 0 ? rarityColor : colors.primary}
              />
            ))}
          </View>
        )}

        <Animated.View style={[styles.card, { backgroundColor: colors.card }, animatedStyle]}>
          {/* Background Glow */}
          <Animated.View
            style={[
              styles.glow,
              { backgroundColor: rarityColor },
              glowStyle
            ]}
          />

          {/* Achievement Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${rarityColor}20` }]}>
            <Ionicons name="trophy" size={48} color={rarityColor} />
          </View>

          {/* Text Content */}
          <Text style={[styles.title, { color: colors.text }]}>
            Conquista Desbloqueada!
          </Text>

          <Text style={[styles.achievementName, { color: rarityColor }]}>
            {achievement.name}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {achievement.description}
          </Text>

          {/* XP Banner */}
          <View style={[styles.xpBanner, { backgroundColor: rarityColor }]}>
            <Text style={styles.xpText}>
              +{achievement.rarity === 'legendary' ? 250 :
                achievement.rarity === 'epic' ? 100 :
                  achievement.rarity === 'rare' ? 50 : 25} XP
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  particlesContainer: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    width: width * 0.8,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 2,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    borderRadius: 100,
    zIndex: -1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  achievementName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  xpBanner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
