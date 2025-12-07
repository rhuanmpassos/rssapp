import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, borderRadius } from '../../theme';
import { getElevation, interactionStates, animation } from '../../theme/design-system';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { colors, theme, isDark } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: interactionStates.pressed.scale,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(opacity, {
        toValue: interactionStates.pressed.opacity,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
      Animated.timing(opacity, {
        toValue: disabled ? interactionStates.disabled.opacity : 1,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: 14,
        };
      case 'lg':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing['2xl'],
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          fontSize: 16,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.primaryLight,
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size="small"
          style={{ marginRight: icon ? spacing.sm : 0 }}
        />
      ) : (
        icon && iconPosition === 'left' && (
          <>{icon}</>
        )
      )}
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
            marginLeft: icon && iconPosition === 'left' ? spacing.sm : 0,
            marginRight: icon && iconPosition === 'right' ? spacing.sm : 0,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {!loading && icon && iconPosition === 'right' && <>{icon}</>}
    </>
  );

  const buttonStyle: ViewStyle = {
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    backgroundColor: variantStyles.backgroundColor,
    borderColor: variantStyles.borderColor,
    borderWidth: variant === 'outline' ? 2 : 0,
    width: fullWidth ? '100%' : undefined,
    minHeight: 44, // Apple HIG minimum touch target
  };

  const animatedStyle = {
    transform: [{ scale }],
    opacity: disabled ? interactionStates.disabled.opacity : opacity,
  };

  if (variant === 'primary' && !disabled && !loading) {
    return (
      <Animated.View
        style={[
          styles.base,
          fullWidth && styles.fullWidth,
          animatedStyle,
          style,
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
        >
          <LinearGradient
            colors={isDark ? ['#6366F1', '#8B5CF6'] : ['#4F46E5', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              {
                paddingVertical: sizeStyles.paddingVertical,
                paddingHorizontal: sizeStyles.paddingHorizontal,
              },
              getElevation('md', isDark),
            ]}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.base,
        buttonStyle,
        animatedStyle,
        variant !== 'ghost' && getElevation('sm', isDark),
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={styles.touchable}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  touchable: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});



