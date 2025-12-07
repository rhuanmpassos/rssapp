import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';

interface OnboardingTooltipProps {
  visible: boolean;
  title: string;
  description: string;
  onDismiss: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showSkip?: boolean;
}

export function OnboardingTooltip({
  visible,
  title,
  description,
  onDismiss,
  position = 'bottom',
  showSkip = true,
}: OnboardingTooltipProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            transform: [{ scale: scaleAnim }],
          },
          position === 'top' && styles.positionTop,
          position === 'bottom' && styles.positionBottom,
        ]}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        <View style={styles.actions}>
          {showSkip && (
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.skipButton}
            >
              <Text style={[styles.skipText, { color: colors.textTertiary }]}>
                Pular
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.gotItButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.gotItText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  positionTop: {
    marginTop: -100,
  },
  positionBottom: {
    marginTop: 100,
  },
  content: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  gotItButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  gotItText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

