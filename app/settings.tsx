import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { useGlobalDialog } from '../src/contexts/DialogContext';
import { api } from '../src/services/api';
import { useAuthStore } from '../src/store/authStore';
import { useBookmarkStore } from '../src/store/bookmarkStore';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  showChevron,
}: SettingRowProps) {
  const { colors } = useTheme();

  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.rowText, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.textTertiary }]}>
            {value}
          </Text>
        )}
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.systemGray4, true: colors.secondary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.systemGray4}
          />
        )}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View>{content}</View>;
}

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showConfirm } = useGlobalDialog();
  const [notifications, setNotifications] = React.useState(true);
  const [sitesCount, setSitesCount] = useState(0);
  const [youtubeCount, setYoutubeCount] = useState(0);
  const { logout, user } = useAuthStore();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const bookmarksCount = bookmarks.length;

  useEffect(() => {
    loadCounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  const loadCounts = async () => {
    try {
      const [sitesRes, youtubeRes] = await Promise.all([
        api.get('/subscriptions?type=site&limit=1'),
        api.get('/youtube/channels?limit=1'), // Use /youtube/channels to include custom YouTube feeds
      ]);
      setSitesCount(sitesRes.data.meta?.total || 0);
      setYoutubeCount(youtubeRes.data.meta?.total || 0);
    } catch (error: any) {
      // Silently fail - counts are not critical
      // Only log non-network errors (like auth errors)
      if (error.response?.status && error.response.status !== 401) {
        console.log('Error loading counts:', error.response?.status);
      }
      // Network errors are expected if backend is not running
    }
  };

  const handleLogout = async () => {
    showConfirm(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      {
        confirmText: 'Sair',
        cancelText: 'Cancelar',
        confirmStyle: 'destructive',
      }
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => router.push('/edit-profile' as any)}
            activeOpacity={0.6}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || user?.email || 'Usuário'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textTertiary }]}>
                Ver perfil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          PREFERÊNCIAS
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="moon"
            iconColor="#FFFFFF"
            iconBg="#6366F1"
            title="Modo escuro"
            hasSwitch
            switchValue={isDark}
            onSwitchChange={toggleTheme}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <SettingRow
            icon="notifications"
            iconColor="#FFFFFF"
            iconBg="#10B981"
            title="Notificações"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
        </View>

        {/* Feed Settings */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          CONTEÚDO
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="bookmark"
            iconColor="#FFFFFF"
            iconBg="#8B5CF6"
            title="Favoritos"
            value={bookmarksCount.toString()}
            showChevron
            onPress={() => router.push('/bookmarks' as any)}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <SettingRow
            icon="globe"
            iconColor="#FFFFFF"
            iconBg="#007AFF"
            title="Sites Cadastrados"
            value={sitesCount.toString()}
            showChevron
            onPress={() => router.push('/subscriptions/sites')}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <SettingRow
            icon="logo-youtube"
            iconColor="#FFFFFF"
            iconBg="#FF0000"
            title="Canais YouTube"
            value={youtubeCount.toString()}
            showChevron
            onPress={() => router.push('/subscriptions/youtube')}
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          SOBRE
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SettingRow
            icon="information-circle"
            iconColor="#FFFFFF"
            iconBg="#8E8E93"
            title="Versão"
            value="1.0.0"
          />
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <SettingRow
            icon="document-text"
            iconColor="#FFFFFF"
            iconBg="#34C759"
            title="Termos de Uso"
            showChevron
            onPress={() => { }}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <SettingRow
            icon="shield-checkmark"
            iconColor="#FFFFFF"
            iconBg="#007AFF"
            title="Privacidade"
            showChevron
            onPress={() => { }}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card }]}
            onPress={handleLogout}
            activeOpacity={0.6}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.textTertiary} />
            <Text style={[styles.logoutText, { color: colors.textTertiary }]}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          RSS Aggregator © 2024
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingBottom: 100,
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 14,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 32,
    marginBottom: 8,
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 600,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  settingIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    fontSize: 17,
    fontWeight: '400',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowValue: {
    fontSize: 15,
    marginRight: 4,
  },
  separator: {
    height: 0.5,
    marginLeft: 60,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 48,
    marginBottom: 24,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },
});
