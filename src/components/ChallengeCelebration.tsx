import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';
import { DailyChallenge } from '../store/progressStore';

interface ChallengeCelebrationProps {
  challenge: DailyChallenge | null;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

// Confetti piece with realistic physics: shoots up, slows, then falls
const ConfettiPiece = ({
  index,
  color,
  startDelay,
}: {
  index: number;
  color: string;
  startDelay: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Random starting position at bottom center
  const startX = (Math.random() - 0.5) * 150; // Wider at start
  const spreadX = (Math.random() - 0.5) * width * 1.3; // Much wider spread across screen

  // Random peak height (how high it goes)
  const peakHeight = -(height * 0.4 + Math.random() * height * 0.3); // -40% to -70% of screen

  // Random fall distance (where it ends up)
  const fallTo = height * 0.3 + Math.random() * height * 0.4; // Falls to 30-70% of screen

  useEffect(() => {
    const delay = startDelay + Math.random() * 150;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Y movement: shoot up fast, then fall slow
        Animated.sequence([
          // Shoot up (fast, decelerating)
          Animated.timing(translateY, {
            toValue: peakHeight,
            duration: 600,
            useNativeDriver: true,
            // Decelerate at the top
          }),
          // Fall down (slower, with gravity feel)
          Animated.timing(translateY, {
            toValue: fallTo,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Horizontal spread
        Animated.sequence([
          // Initial narrow spread
          Animated.timing(translateX, {
            toValue: startX + spreadX * 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          // Continue spreading as it falls
          Animated.timing(translateX, {
            toValue: spreadX,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Continuous rotation
        Animated.timing(rotate, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4),
          duration: 2600,
          useNativeDriver: true,
        }),
        // Fade out gradually during fall
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shapes = ['square', 'circle', 'rectangle'];
  const shape = shapes[index % shapes.length];

  return (
    <Animated.View
      style={[
        styles.confetti,
        shape === 'circle' && styles.confettiCircle,
        shape === 'rectangle' && styles.confettiRectangle,
        {
          backgroundColor: color,
          bottom: 0, // Start from bottom
          left: width / 2,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateInterpolate },
          ],
          opacity,
        },
      ]}
    />
  );
};

export function ChallengeCelebration({
  challenge,
  onDismiss,
}: ChallengeCelebrationProps) {
  const { colors, isDark, theme } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Animation values matching CustomDialog
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (challenge) {
      // Start confetti immediately
      setShowConfetti(true);

      // Haptics
      const playHaptics = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await new Promise(r => setTimeout(r, 150));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      };
      playHaptics();

      // Show card after confetti starts (match CustomDialog animation)
      const cardTimer = setTimeout(() => {
        setShowCard(true);
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // NO auto-dismiss - user must tap to close

      return () => {
        clearTimeout(cardTimer);
      };
    } else {
      // Reset animations when dismissed
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      setShowCard(false);
      setShowConfetti(false);
    }
  }, [challenge]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
      setShowConfetti(false);
      setShowCard(false);
    });
  };

  if (!challenge) return null;

  const confettiColors = [
    colors.primary,
    colors.secondary,
    '#F59E0B', // Yellow
    '#EF4444', // Red  
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EC4899', // Pink
  ];

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'read': return 'newspaper';
      case 'watch': return 'play-circle';
      case 'explore': return 'compass';
      case 'streak': return 'flame';
      default: return 'star';
    }
  };

  return (
    <Modal transparent visible={!!challenge} animationType="none" statusBarTranslucent>
      {/* Backdrop with blur - matches CustomDialog */}
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Confetti from bottom - in FRONT of dialog */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              index={i}
              startDelay={0}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </View>
      )}

      {/* Card - matches CustomDialog animation */}
      <View style={styles.cardContainer}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: theme.card.background,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons
                name={getChallengeIcon(challenge.type) as any}
                size={48}
                color={colors.primary}
              />
            </View>

            {/* Content */}
            <Text style={[styles.title, { color: theme.text.primary }]}>
              🎉 Missão Concluída!
            </Text>

            <Text style={[styles.challengeName, { color: colors.primary }]}>
              {challenge.title}
            </Text>

            <Text style={[styles.description, { color: theme.text.secondary }]}>
              {challenge.description}
            </Text>

            {/* XP Banner */}
            <View style={[styles.xpBanner, { backgroundColor: colors.primary }]}>
              <Ionicons name="star" size={18} color="#FFFFFF" />
              <Text style={styles.xpText}>+{challenge.xpReward} XP</Text>
            </View>

            {/* OK Button - matches CustomDialog style */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 100, // In front of dialog
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  confettiCircle: {
    borderRadius: 5,
  },
  confettiRectangle: {
    width: 6,
    height: 14,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  challengeName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
