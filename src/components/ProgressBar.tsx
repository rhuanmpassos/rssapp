import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  current,
  target,
  label,
  showPercentage = false,
  color,
  height = 8,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((current / target) * 100, 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [current, target, percentage]);

  const progressColor = color || colors.primary;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && (
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.textTertiary }]}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.backgroundSecondary,
            height,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor: progressColor,
              height,
              borderRadius: height / 2,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {target > 0 && (
        <View style={styles.footer}>
          <Text style={[styles.count, { color: colors.textTertiary }]}>
            {current} / {target}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  footer: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  count: {
    fontSize: 11,
    fontWeight: '500',
  },
});


