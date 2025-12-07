import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';
import { getElevation, animation, componentTokens } from '../theme/design-system';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  onPress,
  icon = 'add',
  label,
  position = 'bottom-right',
}: FABProps) {
  const { theme, isDark } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  // Animação de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animation.normal,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const positionStyles = {
    'bottom-right': { bottom: spacing.xl, right: spacing.base },
    'bottom-left': { bottom: spacing.xl, left: spacing.base },
    'top-right': { top: spacing.xl, right: spacing.base },
    'top-left': { top: spacing.xl, left: spacing.base },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyles[position],
        {
          transform: [{ scale }, { translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isDark ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            getElevation('xl', isDark),
          ]}
        >
          <Ionicons
            name={icon}
            size={componentTokens.fab.iconSize}
            color="#FFFFFF"
          />
        </LinearGradient>
      </TouchableOpacity>
      {label && (
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.labelContainer,
            { backgroundColor: theme.card.background },
            getElevation('md', isDark),
          ]}
        >
          <Text style={[styles.label, { color: theme.text.primary }]}>
            {label}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

