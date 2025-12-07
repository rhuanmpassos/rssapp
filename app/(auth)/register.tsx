import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useGlobalDialog } from '../../src/contexts/DialogContext';
import { useAuthStore } from '../../src/store/authStore';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showError, showSuccess } = useGlobalDialog();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | null>(null);

  const validateField = (field: keyof ValidationErrors, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          return 'Nome é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Nome deve ter no mínimo 2 caracteres';
        }
        if (value.trim().length > 100) {
          return 'Nome deve ter no máximo 100 caracteres';
        }
        return undefined;

      case 'email':
        if (!value.trim()) {
          return 'Email é obrigatório';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Email inválido';
        }
        return undefined;

      case 'password':
        if (!value) {
          return 'Senha é obrigatória';
        }
        if (value.length < 8) {
          return 'Senha deve ter no mínimo 8 caracteres';
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
        if (!passwordRegex.test(value)) {
          return 'Senha deve conter pelo menos uma letra e um número';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) {
          return 'Confirmação de senha é obrigatória';
        }
        if (value !== password) {
          return 'As senhas não coincidem';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateField('name', name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateField('email', email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateField('password', password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await register(email.trim(), password, name.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showSuccess('Sucesso', 'Conta criada com sucesso!', () => {
        router.replace('/(tabs)');
      });
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error.response?.data?.message || error.message || 'Não foi possível criar a conta';
      showError('Erro', errorMessage);
    }
  };

  const handleToggleTheme = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleFieldChange = (field: keyof ValidationErrors, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }

    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        // Clear confirmPassword error if passwords match
        if (errors.confirmPassword && value === confirmPassword) {
          setErrors({ ...errors, confirmPassword: undefined });
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={handleToggleTheme}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: colors.text }]}>
                Criar conta
              </Text>
              <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
                Preencha os dados para começar
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Nome
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.name
                        ? colors.destructive
                        : focusedField === 'name'
                          ? colors.primary
                          : colors.border,
                      borderWidth: errors.name || focusedField === 'name' ? 2 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={errors.name
                      ? colors.destructive
                      : focusedField === 'name'
                        ? colors.primary
                        : colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Seu nome completo"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={(value) => handleFieldChange('name', value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.name && (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Email
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.email
                        ? colors.destructive
                        : focusedField === 'email'
                          ? colors.primary
                          : colors.border,
                      borderWidth: errors.email || focusedField === 'email' ? 2 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={errors.email
                      ? colors.destructive
                      : focusedField === 'email'
                        ? colors.primary
                        : colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={(value) => handleFieldChange('email', value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Senha
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.password
                        ? colors.destructive
                        : focusedField === 'password'
                          ? colors.primary
                          : colors.border,
                      borderWidth: errors.password || focusedField === 'password' ? 2 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={errors.password
                      ? colors.destructive
                      : focusedField === 'password'
                        ? colors.primary
                        : colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={(value) => handleFieldChange('password', value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPassword(!showPassword);
                    }}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Confirmar senha
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: errors.confirmPassword
                        ? colors.destructive
                        : focusedField === 'confirmPassword'
                          ? colors.primary
                          : colors.border,
                      borderWidth: errors.confirmPassword || focusedField === 'confirmPassword' ? 2 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={errors.confirmPassword
                      ? colors.destructive
                      : focusedField === 'confirmPassword'
                        ? colors.primary
                        : colors.textTertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Repita a senha"
                    placeholderTextColor={colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Criando conta...</Text>
                ) : (
                  <Text style={styles.buttonText}>Criar conta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 32,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 17,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});

