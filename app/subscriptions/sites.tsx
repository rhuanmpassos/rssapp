import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useGlobalDialog } from '../../src/contexts/DialogContext';
import { api } from '../../src/services/api';
import { SkeletonCard } from '../../src/components/SkeletonLoader';
import { SwipeableRow } from '../../src/components/SwipeableRow';

interface SiteSubscription {
  id: string;
  target: string;
  enabled: boolean;
  createdAt: string;
  feed: {
    id: string;
    title: string | null;
    siteDomain: string;
    faviconUrl: string | null;
    status: string;
  } | null;
}

export default function SitesScreen() {
  const { colors, isDark } = useTheme();
  const { showError, showSuccess, showConfirm } = useGlobalDialog();
  const [sites, setSites] = useState<SiteSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSites = async () => {
    try {
      const response = await api.get('/subscriptions?type=site');
      setSites(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status && error.response.status !== 401) {
        showError('Erro', 'Não foi possível carregar os sites');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadSites();
  };

  const handleDelete = (site: SiteSubscription) => {
    showConfirm(
      'Excluir Site',
      `Deseja realmente excluir "${site.feed?.title || site.target}"?`,
      async () => {
        try {
          await api.delete(`/subscriptions/${site.id}`);
          setSites(sites.filter((s) => s.id !== site.id));
          showSuccess('Sucesso', 'Site removido com sucesso');
        } catch (error: any) {
          console.error('Error deleting site:', error);
          showError('Erro', 'Não foi possível excluir o site');
        }
      },
      {
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        confirmStyle: 'destructive',
      }
    );
  };

  const handleToggle = async (site: SiteSubscription, newValue: boolean) => {
    try {
      await api.patch(`/subscriptions/${site.id}/toggle`);
      // Estado já foi atualizado otimisticamente, apenas recarregar para garantir sincronização
      await loadSites();
    } catch (error: any) {
      console.error('Error toggling site:', error);
      // Reverter mudança otimista em caso de erro
      setSites((prevSites) =>
        prevSites.map((s) =>
          s.id === site.id ? { ...s, enabled: !newValue } : s
        )
      );
      showError('Erro', 'Não foi possível alterar o status');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Sites Cadastrados
        </Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} lines={2} showAvatar />
          ))}
        </ScrollView>
      ) : sites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="globe-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhum site cadastrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            Adicione sites para começar a receber notícias
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-subscription?type=site')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Site</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressViewOffset={20}
            />
          }
        >
          {sites.map((site) => (
            <SwipeableRow
              key={site.id}
              leftAction={{
                icon: 'trash',
                label: 'Excluir',
                color: colors.destructive,
                onPress: () => handleDelete(site),
              }}
              rightAction={{
                icon: site.enabled ? 'eye-off' : 'eye',
                label: site.enabled ? 'Desativar' : 'Ativar',
                color: site.enabled ? colors.textTertiary : colors.primary,
                onPress: () => handleToggle(site, !site.enabled),
              }}
            >
              <View style={[styles.siteCard, { backgroundColor: colors.card }]}>
                <View style={styles.siteHeader}>
                  <View style={styles.siteInfo}>
                    {site.feed?.faviconUrl ? (
                      <View style={styles.faviconContainer}>
                        <Ionicons name="globe" size={20} color={colors.primary} />
                      </View>
                    ) : (
                      <View style={[styles.faviconPlaceholder, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="globe" size={20} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.siteText}>
                      <Text
                        style={[styles.siteTitle, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {site.feed?.title || site.target}
                      </Text>
                      <Text
                        style={[styles.siteDomain, { color: colors.textTertiary }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {site.feed?.siteDomain || new URL(site.target).hostname}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={site.enabled}
                    onValueChange={async (value) => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Otimistic update usando função de atualização
                      setSites((prevSites) =>
                        prevSites.map((s) =>
                          s.id === site.id ? { ...s, enabled: value } : s
                        )
                      );
                      // Chamar API
                      handleToggle(site, value);
                    }}
                    trackColor={{ false: colors.systemGray4 || '#E5E5EA', true: colors.primary }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={colors.systemGray4 || '#E5E5EA'}
                  />
                </View>

                <View style={[styles.separator, { backgroundColor: colors.separator }]} />

                <View style={styles.siteActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(site)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                    <Text style={[styles.actionText, { color: colors.destructive }]}>
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  siteCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  siteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  faviconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faviconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  siteText: {
    flex: 1,
    minWidth: 0,
  },
  siteTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  siteDomain: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  separator: {
    height: 0.5,
    marginVertical: 12,
  },
  siteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

