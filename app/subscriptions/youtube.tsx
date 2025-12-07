import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
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

interface YouTubeChannel {
  id: string;
  channelId: string;
  title: string;
  thumbnailUrl: string | null;
  lastCheckedAt: string | null;
  isCustomFeed?: boolean;
  subscriptionId?: string;
  feedId?: string;
  rssUrl?: string;
  _count?: { videos: number };
}

export default function YouTubeScreen() {
  const { colors, isDark } = useTheme();
  const { showError, showSuccess, showConfirm } = useGlobalDialog();
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = async () => {
    try {
      // Use /youtube/channels endpoint which includes both regular and custom YouTube feeds
      const response = await api.get('/youtube/channels');
      setChannels(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status && error.response.status !== 401) {
        showError('Erro', 'Não foi possível carregar os canais');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadChannels();
  };

  const handleDelete = (channel: YouTubeChannel) => {
    // For custom feeds, use subscriptionId; for regular channels, find subscription by channelId
    const subscriptionId = channel.isCustomFeed ? channel.subscriptionId : channel.id;

    showConfirm(
      'Excluir Canal',
      `Deseja realmente excluir "${channel.title}"?`,
      async () => {
        try {
          if (channel.isCustomFeed && channel.subscriptionId) {
            await api.delete(`/subscriptions/${channel.subscriptionId}`);
          } else {
            // For regular YouTube channels, find and delete the subscription
            const response = await api.get('/subscriptions?type=youtube');
            const subscription = response.data.data?.find(
              (sub: any) => sub.channel?.id === channel.id || sub.channelId === channel.id
            );
            if (subscription) {
              await api.delete(`/subscriptions/${subscription.id}`);
            }
          }
          setChannels(channels.filter((c) => c.id !== channel.id));
          showSuccess('Sucesso', 'Canal removido com sucesso');
        } catch (error: any) {
          console.error('Error deleting channel:', error);
          showError('Erro', 'Não foi possível excluir o canal');
        }
      },
      {
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        confirmStyle: 'destructive',
      }
    );
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
          Canais YouTube
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
      ) : channels.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.youtube}
              colors={[colors.youtube]}
              progressViewOffset={20}
            />
          }
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
            <Ionicons name="logo-youtube" size={48} color={colors.youtube} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhum canal cadastrado
          </Text>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
            Adicione canais para ver os últimos vídeos
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.youtube }]}
            onPress={() => router.push('/add-subscription?type=youtube')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Canal</Text>
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
              tintColor={colors.youtube}
              colors={[colors.youtube]}
              progressViewOffset={20}
            />
          }
        >
          {channels.map((channel) => (
            <SwipeableRow
              key={channel.id}
              leftAction={{
                icon: 'trash',
                label: 'Excluir',
                color: colors.destructive,
                onPress: () => handleDelete(channel),
              }}
            >
              <View style={[styles.channelCard, { backgroundColor: colors.card }]}>
                <View style={styles.channelHeader}>
                  <View style={styles.channelInfo}>
                    {channel.thumbnailUrl ? (
                      <Image
                        source={{ uri: channel.thumbnailUrl }}
                        style={styles.thumbnail}
                      />
                    ) : (
                      <View style={[styles.thumbnailPlaceholder, { backgroundColor: '#FFE5E5' }]}>
                        <Ionicons name="logo-youtube" size={24} color={colors.youtube} />
                      </View>
                    )}
                    <View style={styles.channelText}>
                      <Text
                        style={[styles.channelTitle, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {channel.title || 'Canal desconhecido'}
                      </Text>
                      <Text
                        style={[styles.channelId, { color: colors.textTertiary }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {channel.isCustomFeed ? 'Feed customizado' : channel.channelId}
                      </Text>
                    </View>
                  </View>
                  {channel._count && (
                    <View style={styles.videoCount}>
                      <Text style={[styles.videoCountText, { color: colors.textSecondary }]}>
                        {channel._count.videos} vídeos
                      </Text>
                    </View>
                  )}
                </View>

                <View style={[styles.separator, { backgroundColor: colors.separator }]} />

                <View style={styles.channelActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(channel)}
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
  channelCard: {
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
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  channelText: {
    flex: 1,
    minWidth: 0,
  },
  channelTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  channelId: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  separator: {
    height: 0.5,
    marginVertical: 12,
  },
  channelActions: {
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
  videoCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  videoCountText: {
    fontSize: 13,
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
    shadowColor: '#FF0000',
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

