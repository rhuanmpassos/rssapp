import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import * as Haptics from 'expo-haptics';
import { Folder } from './FolderChips';

interface FolderSelectorProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderSelector({
  selectedFolderId,
  onSelectFolder,
}: FolderSelectorProps) {
  const { colors, isDark } = useTheme();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (showModal) {
      loadFolders();
    }
  }, [showModal]);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/folders');
      setFolders(response.data || []);
    } catch (error) {
      console.error('Error loading folders:', error);
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
    setShowModal(false);
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: isDark ? colors.card : colors.border,
            borderColor: selectedFolderId ? colors.primary : colors.border,
            borderWidth: selectedFolderId ? 2 : 1,
          },
        ]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons
          name="folder-outline"
          size={20}
          color={selectedFolderId ? colors.primary : colors.textTertiary}
        />
        <Text
          style={[
            styles.selectorText,
            {
              color: selectedFolderId ? colors.primary : colors.text,
            },
          ]}
        >
          {selectedFolder
            ? selectedFolder.name
            : 'Selecionar pasta (opcional)'}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Folder Selection Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Selecionar Pasta
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Folder List */}
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.folderItem,
                    {
                      backgroundColor:
                        selectedFolderId === item.id
                          ? colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelectFolder(item.id)}
                >
                  <View style={styles.folderItemLeft}>
                    <Ionicons
                      name={
                        selectedFolderId === item.id
                          ? 'folder'
                          : 'folder-outline'
                      }
                      size={24}
                      color={
                        selectedFolderId === item.id
                          ? colors.primary
                          : colors.text
                      }
                    />
                    <View style={styles.folderItemText}>
                      <Text
                        style={[
                          styles.folderItemName,
                          {
                            color:
                              selectedFolderId === item.id
                                ? colors.primary
                                : colors.text,
                            fontWeight:
                              selectedFolderId === item.id ? '600' : '400',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item._count && item._count.subscriptions > 0 && (
                        <Text
                          style={[
                            styles.folderItemCount,
                            { color: colors.textTertiary },
                          ]}
                        >
                          {item._count.subscriptions} subscription
                          {item._count.subscriptions !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedFolderId === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="folder-outline"
                      size={48}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.emptyText, { color: colors.textTertiary }]}
                    >
                      Nenhuma pasta criada ainda
                    </Text>
                  </View>
                ) : null
              }
              ListHeaderComponent={
                <>
                  {/* None option */}
                  <TouchableOpacity
                    style={[
                      styles.folderItem,
                      {
                        backgroundColor:
                          selectedFolderId === null
                            ? colors.primary + '20'
                            : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectFolder(null)}
                  >
                    <View style={styles.folderItemLeft}>
                      <Ionicons
                        name={selectedFolderId === null ? 'apps' : 'apps-outline'}
                        size={24}
                        color={
                          selectedFolderId === null ? colors.primary : colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.folderItemName,
                          {
                            color:
                              selectedFolderId === null
                                ? colors.primary
                                : colors.text,
                            fontWeight:
                              selectedFolderId === null ? '600' : '400',
                          },
                        ]}
                      >
                        Sem pasta
                      </Text>
                    </View>
                    {selectedFolderId === null && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </>
              }
            />

            {/* Create Folder Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Nova Pasta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.createModalOverlay}>
          <View
            style={[styles.createModalContent, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.createModalTitle, { color: colors.text }]}>
              Nova Pasta
            </Text>
            <TextInput
              style={[
                styles.createInput,
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
            <View style={styles.createModalButtons}>
              <TouchableOpacity
                style={[
                  styles.createModalButton,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewFolderName('');
                }}
              >
                <Text
                  style={[styles.createModalButtonText, { color: colors.text }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createModalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreateFolder}
              >
                <Text style={[styles.createModalButtonText, { color: '#fff' }]}>
                  Criar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  folderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  folderItemText: {
    flex: 1,
  },
  folderItemName: {
    fontSize: 16,
  },
  folderItemCount: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  createModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  createInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  createModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

