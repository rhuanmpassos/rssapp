import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { persuasiveCopy } from '../utils/persuasiveCopy';
import { spacing } from '../theme';

interface CommitmentPromptProps {
  visible: boolean;
  onClose: () => void;
  onCommit: (goal: { type: 'daily' | 'weekly'; target: number }) => void;
}

export function CommitmentPrompt({
  visible,
  onClose,
  onCommit,
}: CommitmentPromptProps) {
  const { colors } = useTheme();
  const [goalType, setGoalType] = useState<'daily' | 'weekly'>('daily');
  const [target, setTarget] = useState(5);

  const handleCommit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCommit({ type: goalType, target });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card
          style={[styles.card, { backgroundColor: colors.card }]}
          padding="lg"
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flag" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Defina sua meta
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Compromissos públicos aumentam a chance de sucesso em 42%
            </Text>
          </View>

          {/* Goal Type Selection */}
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.backgroundSecondary },
                goalType === 'daily' && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => {
                setGoalType('daily');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={goalType === 'daily' ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: goalType === 'daily' ? colors.primary : colors.text },
                ]}
              >
                Diária
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.backgroundSecondary },
                goalType === 'weekly' && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => {
                setGoalType('weekly');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={goalType === 'weekly' ? colors.primary : colors.textTertiary}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: goalType === 'weekly' ? colors.primary : colors.text },
                ]}
              >
                Semanal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Target Selection */}
          <View style={styles.targetContainer}>
            <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
              Quantos artigos por {goalType === 'daily' ? 'dia' : 'semana'}?
            </Text>
            <View style={styles.targetOptions}>
              {[3, 5, 10, 15].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.targetOption,
                    { backgroundColor: colors.backgroundSecondary },
                    target === value && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    setTarget(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.targetText,
                      {
                        color: target === value ? '#FFFFFF' : colors.text,
                        fontWeight: target === value ? '700' : '500',
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Comprometer-me"
              onPress={handleCommit}
              style={styles.commitButton}
            />
          </View>

          <Text style={[styles.footer, { color: colors.textTertiary }]}>
            Você pode alterar sua meta a qualquer momento
          </Text>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    borderRadius: 12,
    gap: spacing.xs,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  targetContainer: {
    marginBottom: spacing.lg,
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  targetOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  targetOption: {
    flex: 1,
    padding: spacing.base,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetText: {
    fontSize: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  commitButton: {
    flex: 1,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

