import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { persuasiveCopy } from '../utils/persuasiveCopy';
import { spacing } from '../theme';

interface UrgencyIndicatorProps {
  type: 'newContent' | 'streakWarning' | 'milestoneNear';
  count?: number;
  days?: number;
  remaining?: number;
  onPress?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function UrgencyIndicator({
  type,
  count,
  days,
  remaining,
  onPress,
  dismissible = false,
  onDismiss,
}: UrgencyIndicatorProps) {
  const { colors } = useTheme();

  const getMessage = () => {
    switch (type) {
      case 'newContent':
        return persuasiveCopy.urgency.newContent(count || 0);
      case 'streakWarning':
        return persuasiveCopy.urgency.streakWarning(days || 0);
      case 'milestoneNear':
        return persuasiveCopy.urgency.milestoneNear(remaining || 0);
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'newContent':
        return 'notifications';
      case 'streakWarning':
        return 'flame';
      case 'milestoneNear':
        return 'trophy';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'newContent':
        return colors.primary;
      case 'streakWarning':
        return colors.destructive || '#EF4444';
      case 'milestoneNear':
        return colors.secondary;
      default:
        return colors.primary;
    }
  };

  const handlePress = async () => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleDismiss = async () => {
    if (onDismiss) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDismiss();
    }
  };

  const iconColor = getColor();
  const bgColor = type === 'streakWarning' 
    ? colors.destructiveLight || '#FEE2E2'
    : type === 'milestoneNear'
    ? colors.secondaryLight || '#D1FAE5'
    : colors.primaryLight;

  return (
    <Card
      style={[styles.container, { backgroundColor: bgColor }]}
      onPress={handlePress}
      padding="sm"
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={getIcon()} size={20} color="#FFFFFF" />
        </View>
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {getMessage()}
        </Text>
        {dismissible && onDismiss && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  dismissButton: {
    padding: spacing.xs,
  },
});

