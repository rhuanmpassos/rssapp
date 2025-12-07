import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';
import { persuasiveCopy } from '../utils/persuasiveCopy';

interface StreakWarningModalProps {
  visible: boolean;
  streakDays: number;
  onKeepStreak: () => void;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export function StreakWarningModal({
  visible,
  streakDays,
  onKeepStreak,
  onDismiss,
}: StreakWarningModalProps) {
  const { colors, isDark } = useTheme();

  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic warning
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Animate modal in
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);

      // Animate icon (shake effect)
      iconRotation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-10, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
      iconRotation.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />

        <Animated.View style={[styles.content, { backgroundColor: colors.card }, animatedStyle]}>
          {/* Warning Icon area */}
          <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
            <Animated.View style={iconStyle}>
              <Ionicons name="flame" size={48} color="#EF4444" />
            </Animated.View>
            <View style={styles.badgeContainer}>
              <Ionicons name="warning" size={20} color="#EF4444" />
            </View>
          </View>

          {/* Text Content */}
          <Text style={[styles.title, { color: colors.text }]}>
            Cuidado! Seu streak está em risco
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {persuasiveCopy.urgency.streakWarning(streakDays)}
          </Text>

          <View style={[styles.statBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{streakDays} Dias</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Conquistados com esforço</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onKeepStreak}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Manter minha sequência</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onDismiss}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.textTertiary }]}>
                Arriscar perder
              </Text>
            </TouchableOpacity>
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
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  statBox: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
