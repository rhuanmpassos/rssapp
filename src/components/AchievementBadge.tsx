import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Achievement } from '../store/progressStore';
import * as Haptics from 'expo-haptics';

interface AchievementBadgeProps {
  achievement: Achievement;
  showNotification?: boolean;
  onClose?: () => void;
}

const RARITY_COLORS = {
  common: '#94A3B8',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const RARITY_ICONS = {
  common: 'star-outline',
  rare: 'star',
  epic: 'diamond-outline',
  legendary: 'trophy',
};

export function AchievementBadge({
  achievement,
  showNotification = false,
  onClose,
}: AchievementBadgeProps) {
  const { colors } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [showModal, setShowModal] = useState(showNotification);

  useEffect(() => {
    if (showNotification && achievement.unlockedAt) {
      setShowModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  }, [showNotification, achievement.unlockedAt]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose?.();
    });
  };

  const rarityColor = RARITY_COLORS[achievement.rarity];
  const rarityIcon = RARITY_ICONS[achievement.rarity] as keyof typeof Ionicons.glyphMap;

  if (!achievement.unlockedAt && !showNotification) {
    // Show locked state
    return (
      <View style={[styles.badge, styles.lockedBadge, { borderColor: colors.border }]}>
        <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <>
      {/* Badge Display */}
      <View
        style={[
          styles.badge,
          { backgroundColor: rarityColor + '20', borderColor: rarityColor },
        ]}
      >
        <Ionicons name={rarityIcon} size={16} color={rarityColor} />
      </View>

      {/* Achievement Unlocked Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: rarityColor + '20' },
              ]}
            >
              <Ionicons name={rarityIcon} size={64} color={rarityColor} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Conquista Desbloqueada!
            </Text>

            <Text style={[styles.achievementName, { color: rarityColor }]}>
              {achievement.name}
            </Text>

            <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
              {achievement.description}
            </Text>

            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});


