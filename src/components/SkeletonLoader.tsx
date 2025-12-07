import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundSecondary,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  showButton = false,
}: SkeletonCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        {showAvatar && (
          <SkeletonLoader width={48} height={48} borderRadius={24} />
        )}
        <View style={styles.cardContent}>
          <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
      </View>
      {lines > 0 && (
        <View style={styles.cardBody}>
          {Array.from({ length: lines }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width={index === lines - 1 ? '70%' : '100%'}
              height={12}
              style={{ marginBottom: 8 }}
            />
          ))}
        </View>
      )}
      {showButton && (
        <View style={styles.cardFooter}>
          <SkeletonLoader width={100} height={36} borderRadius={8} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardBody: {
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
});

