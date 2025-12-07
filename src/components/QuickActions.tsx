import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../theme';

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface QuickActionsProps {
  visible: boolean;
  onClose: () => void;
  actions: QuickAction[];
}

export function QuickActions({ visible, onClose, actions }: QuickActionsProps) {
  const { colors } = useTheme();

  const handleAction = async (action: QuickAction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.container, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionItem,
                index < actions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.separator,
                },
              ]}
              onPress={() => handleAction(action)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: action.destructive
                      ? colors.destructive + '20'
                      : (action.color || colors.primary) + '20',
                  },
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={22}
                  color={
                    action.destructive
                      ? colors.destructive
                      : action.color || colors.primary
                  }
                />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: action.destructive
                      ? colors.destructive
                      : colors.text,
                  },
                ]}
              >
                {action.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
});

