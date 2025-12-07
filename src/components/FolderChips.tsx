import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import * as Haptics from 'expo-haptics';

export interface Folder {
  id: string;
  name: string;
  color?: string | null;
  _count?: {
    subscriptions: number;
  };
}

interface FolderChipsProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  type?: 'site' | 'youtube';
}

export function FolderChips({
  selectedFolderId,
  onSelectFolder,
  type = 'site',
}: FolderChipsProps) {
  const { colors, isDark } = useTheme();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadFolders();
  }, []);

  // Refresh folders when screen is focused (to show newly created folders)
  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [])
  );

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/folders');
      setFolders(response.data || []);
    } catch (error: any) {
      // Se for erro 401, o usuário não está autenticado - não mostrar erro
      if (error.response?.status === 401) {
        // Usuário não autenticado - não há pastas para mostrar
        setFolders([]);
      } else {
        console.error('Error loading folders:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Erro', 'Digite um nome para a pasta');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post('/folders', {
        name: newFolderName.trim(),
      });
      setFolders([...folders, response.data]);
      setNewFolderName('');
      setShowCreateModal(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível criar a pasta'
      );
    }
  };

  const handleSelectFolder = (folderId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFolder(folderId);
  };

  // Não mostrar nada apenas se estiver carregando pela primeira vez
  // Se já carregou (mesmo que com erro), mostrar o componente
  if (isLoading && folders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {/* All items chip */}
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedFolderId === null
                    ? colors.primary
                    : isDark
                    ? colors.card
                    : colors.border,
              },
            ]}
            onPress={() => handleSelectFolder(null)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedFolderId === null
                      ? '#fff'
                      : colors.text,
                },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {/* Folder chips */}
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedFolderId === folder.id
                      ? colors.primary
                      : isDark
                      ? colors.card
                      : colors.border,
                },
              ]}
              onPress={() => handleSelectFolder(folder.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedFolderId === folder.id
                        ? '#fff'
                        : colors.text,
                  },
                ]}
              >
                {folder.name}
              </Text>
              {folder._count && folder._count.subscriptions > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        selectedFolderId === folder.id
                          ? 'rgba(255,255,255,0.3)'
                          : colors.primary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          selectedFolderId === folder.id
                            ? '#fff'
                            : colors.primary,
                      },
                    ]}
                  >
                    {folder._count.subscriptions}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fixed Add folder button - always visible on the right */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[
              styles.fixedAddButton,
              {
                backgroundColor: isDark ? colors.card : colors.border,
                borderColor: colors.primary,
                borderWidth: 1,
                borderStyle: 'dashed',
                shadowColor: colors.text,
              },
            ]}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={[styles.fixedAddButtonText, { color: colors.primary }]}>
              Nova
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Nova Pasta
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.background : colors.border,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Nome da pasta (ex: Esportes, Culinária)"
              placeholderTextColor={colors.text + '80'}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewFolderName('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreateFolder}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Criar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  chipsWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginRight: 70, // Space for fixed button
  },
  scrollContent: {
    paddingLeft: 12,
    paddingRight: 0, // No padding on right - let last chip be cut off
    gap: 4,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fixedButtonContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  fixedAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    minWidth: 70,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedAddButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

