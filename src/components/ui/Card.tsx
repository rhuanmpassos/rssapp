import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius } from '../../theme';
import { getElevation, interactionStates, animation } from '../../theme/design-system';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  padding = 'md',
  elevated = true,
  elevation: elevationLevel = 'md',
}: CardProps) {
  const { theme, isDark } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Entrance animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.xl;
      default:
        return spacing.base;
    }
  };

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: interactionStates.pressed.scale,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePress = async () => {
    if (!onPress) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const cardStyle: ViewStyle = {
    backgroundColor: theme.card.background,
    borderRadius: borderRadius.xl,
    padding: getPadding(),
    ...(elevated && elevationLevel !== 'none' && getElevation(elevationLevel, isDark)),
    ...(elevated && isDark && {
      borderWidth: 1,
      borderColor: theme.border.light,
    }),
  };

  if (onPress) {
    return (
      <Animated.View
        style={[
          cardStyle,
          { transform: [{ scale }], opacity },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <Animated.View style={[cardStyle, { opacity }, style]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({});



