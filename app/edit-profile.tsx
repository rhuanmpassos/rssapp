import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { api } from '../src/services/api';
import { useAuthStore } from '../src/store/authStore';

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || user?.email || 'Usuário');
  const [email, setEmail] = useState(user?.email || '');
  const [editingField, setEditingField] = useState<'name' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      setName(userData.name || userData.email || 'Usuário');
      setEmail(userData.email || '');
      setUser(userData);
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const startEditing = (field: 'name' | 'email', currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = async () => {
    if (!editValue.trim()) {
      Alert.alert('Erro', 'O campo não pode estar vazio');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {};
      if (editingField === 'name') {
        updateData.name = editValue.trim();
      } else if (editingField === 'email') {
        updateData.email = editValue.trim();
      }

      const response = await api.patch('/auth/profile', updateData);
      const updatedUser = response.data;

      if (editingField === 'name') {
        setName(updatedUser.name);
      } else if (editingField === 'email') {
        setEmail(updatedUser.email);
      }

      setUser(updatedUser);
      setEditingField(null);
      setEditValue('');
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível alterar a senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            Alert.prompt(
              'Confirmar exclusão',
              'Digite sua senha para confirmar:',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: async (password) => {
                    if (!password) return;
                    setIsLoading(true);
                    try {
                      await api.delete('/auth/account', {
                        data: { password },
                      });
                      Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso.');
                      router.replace('/(auth)/login');
                    } catch (error: any) {
                      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir a conta');
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Perfil</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {name && name !== 'Usuário'
                  ? name.charAt(0).toUpperCase()
                  : user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : 'U'}
              </Text>
            </View>
          </View>

          {/* Edit Name */}
          {editingField === 'name' ? (
            <View style={[styles.editForm, { backgroundColor: colors.card }]}>
              <Text style={[styles.editTitle, { color: colors.text }]}>Alterar Nome</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Seu nome"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={cancelEditing}
                >
                  <Text style={[styles.editButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.primary }]}
                  onPress={saveField}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.editButtonTextActive}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : editingField === 'email' ? (
            <View style={[styles.editForm, { backgroundColor: colors.card }]}>
              <Text style={[styles.editTitle, { color: colors.text }]}>Alterar Email</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={cancelEditing}
                >
                  <Text style={[styles.editButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: colors.primary }]}
                  onPress={saveField}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.editButtonTextActive}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : !showPasswordForm ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                INFORMAÇÕES
              </Text>
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => startEditing('name', name)}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="person" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.rowLabel, { color: colors.textTertiary }]}>Nome</Text>
                      <Text style={[styles.rowText, { color: colors.text }]}>{name}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: colors.separator }]} />
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => startEditing('email', email)}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="mail" size={18} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.rowLabel, { color: colors.textTertiary }]}>Email</Text>
                      <Text style={[styles.rowText, { color: colors.text }]}>{email}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                SEGURANÇA
              </Text>
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setShowPasswordForm(true)}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIcon, { backgroundColor: '#FFF3E0' }]}>
                      <Ionicons name="key" size={18} color="#FF9500" />
                    </View>
                    <Text style={[styles.rowText, { color: colors.text }]}>Alterar senha</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                ZONA DE PERIGO
              </Text>
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={handleDeleteAccount}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.rowIcon, { backgroundColor: '#FFEBEE' }]}>
                      <Ionicons name="trash" size={18} color={colors.destructive} />
                    </View>
                    <Text style={[styles.rowText, { color: colors.destructive }]}>
                      Excluir conta
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={[styles.passwordForm, { backgroundColor: colors.card }]}>
              <Text style={[styles.passwordTitle, { color: colors.text }]}>
                Alterar Senha
              </Text>

              <View style={styles.passwordField}>
                <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>
                  Senha atual
                </Text>
                <View
                  style={[
                    styles.passwordInput,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.passwordField}>
                <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>
                  Nova senha
                </Text>
                <View
                  style={[
                    styles.passwordInput,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.passwordField}>
                <Text style={[styles.passwordLabel, { color: colors.textSecondary }]}>
                  Confirmar nova senha
                </Text>
                <View
                  style={[
                    styles.passwordInput,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.passwordButtons}>
                <TouchableOpacity
                  style={[styles.passwordButton, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={[styles.passwordButtonText, { color: colors.text }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.passwordButton, { backgroundColor: colors.primary }]}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.passwordButtonTextActive}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 32,
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 600,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  rowText: {
    fontSize: 17,
    fontWeight: '400',
  },
  separator: {
    height: 0.5,
    marginLeft: 60,
  },
  editForm: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 14,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  editInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  editButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  passwordForm: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 14,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  passwordTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  passwordField: {
    marginBottom: 20,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    paddingVertical: 16,
    fontSize: 17,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  passwordButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  passwordButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  passwordButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

