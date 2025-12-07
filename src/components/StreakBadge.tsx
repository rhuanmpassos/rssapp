import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function StreakBadge({
  streak,
  size = 'medium',
  showLabel = true,
}: StreakBadgeProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    small: { icon: 16, fontSize: 12, padding: 6, gap: 4 },
    medium: { icon: 20, fontSize: 14, padding: 8, gap: 6 },
    large: { icon: 24, fontSize: 18, padding: 12, gap: 8 },
  };

  const currentSize = sizeStyles[size];

  if (streak === 0) {
    return null;
  }

  // Determine streak intensity
  const getStreakColor = () => {
    if (streak >= 30) return '#F59E0B'; // Gold
    if (streak >= 7) return '#EF4444'; // Red
    if (streak >= 3) return '#F97316'; // Orange
    return '#FBBF24'; // Yellow
  };

  const streakColor = getStreakColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: streakColor + '20',
          borderColor: streakColor,
          padding: currentSize.padding,
          gap: currentSize.gap,
        },
      ]}
    >
      <Ionicons name="flame" size={currentSize.icon} color={streakColor} />
      <Text
        style={[
          styles.streakText,
          {
            color: streakColor,
            fontSize: currentSize.fontSize,
            fontWeight: streak >= 7 ? '700' : '600',
          },
        ]}
      >
        {streak}
      </Text>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textTertiary,
              fontSize: currentSize.fontSize - 2,
            },
          ]}
        >
          {streak === 1 ? 'dia' : 'dias'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
  },
  streakText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  label: {
    marginLeft: 2,
  },
});

