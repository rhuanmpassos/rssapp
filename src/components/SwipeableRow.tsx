import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
  };
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}: SwipeableRowProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const currentValueRef = useRef(0);

  // Track value changes
  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentValueRef.current = value;
    });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        translateX.setOffset(currentValueRef.current);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = gestureState.dx;
        const maxSwipe = SCREEN_WIDTH * 0.3;

        if (newValue > 0 && rightAction) {
          translateX.setValue(Math.min(newValue, maxSwipe));
        } else if (newValue < 0 && leftAction) {
          translateX.setValue(Math.max(newValue, -maxSwipe));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();

        if (gestureState.dx > SWIPE_THRESHOLD && rightAction) {
          // Swipe right
          Animated.spring(translateX, {
            toValue: SCREEN_WIDTH * 0.3,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          rightAction.onPress();
        } else if (gestureState.dx < -SWIPE_THRESHOLD && leftAction) {
          // Swipe left
          Animated.spring(translateX, {
            toValue: -SCREEN_WIDTH * 0.3,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          leftAction.onPress();
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const leftActionOpacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH * 0.3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Left Action */}
      {leftAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            {
              backgroundColor: leftAction.color,
              opacity: leftActionOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
              leftAction.onPress();
            }}
          >
            <Ionicons name={leftAction.icon} size={24} color="#FFFFFF" />
            <Animated.Text style={styles.actionLabel}>
              {leftAction.label}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Right Action */}
      {rightAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            {
              backgroundColor: rightAction.color,
              opacity: rightActionOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }).start();
              rightAction.onPress();
            }}
          >
            <Ionicons name={rightAction.icon} size={24} color="#FFFFFF" />
            <Animated.Text style={styles.actionLabel}>
              {rightAction.label}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: 12,
  },
  content: {
    borderRadius: 14,
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

