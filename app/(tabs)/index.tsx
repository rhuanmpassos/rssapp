import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useFeedStore, FeedItem } from '../../src/store/feedStore';
import { FeedCard } from '../../src/components/FeedCard';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { SearchBar } from '../../src/components/SearchBar';
import { SkeletonCard } from '../../src/components/SkeletonLoader';
import { QuickActions } from '../../src/components/QuickActions';
import { EmptyState } from '../../src/components/EmptyState';

import { UrgencyIndicator } from '../../src/components/UrgencyIndicator';
import { persuasiveCopy, getContextualCopy } from '../../src/utils/persuasiveCopy';
import { api } from '../../src/services/api';
import { useProgressStore } from '../../src/store/progressStore';
import { useDebounce } from '../../src/hooks/useDebounce';
import { FolderChips } from '../../src/components/FolderChips';
import { SmartSuggestions } from '../../src/components/SmartSuggestions';
import { DailyChallengeCard } from '../../src/components/DailyChallengeCard';
import { AchievementCelebration } from '../../src/components/AchievementCelebration';
import { StreakWarningModal } from '../../src/components/StreakWarningModal';
import { persuasiveHaptics } from '../../src/utils/persuasiveHaptics';

export default function FeedScreen() {
  const { colors, isDark } = useTheme();
  // Usar selectors específicos para evitar re-renders desnecessários
  const feedItems = useFeedStore((state) => state.feedItems);
  const isLoadingItems = useFeedStore((state) => state.isLoadingItems);
  const subscriptions = useFeedStore((state) => state.subscriptions);
  const fetchAllItems = useFeedStore((state) => state.fetchAllItems);
  const refreshFeeds = useFeedStore((state) => state.refreshFeeds);
  const fetchSubscriptions = useFeedStore((state) => state.fetchSubscriptions);
  const progress = useProgressStore((state) => state.progress);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showStreakWarning, setShowStreakWarning] = useState(false);
  const dismissCelebration = useProgressStore((state) => state.dismissCelebration);
  const pendingCelebration = useProgressStore((state) => state.pendingCelebration);

  // Load data on mount and focus
  useFocusEffect(
    useCallback(() => {
      refreshFeeds();
      // Verificar streak diário (gatilho comportamental)
      useProgressStore.getState().checkStreak();
      useProgressStore.getState().fetchProgress();

      // Check for streak warning
      const shouldWarn = useProgressStore.getState().checkStreakWarning();
      if (shouldWarn) setShowStreakWarning(true);

      // Refresh folders will be handled by FolderChips component
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await persuasiveHaptics.refreshRelease();
    await refreshFeeds();
    await persuasiveHaptics.anticipationDelay(100);
    await persuasiveHaptics.contentLoaded();
    setRefreshing(false);
  }, [refreshFeeds]);

  // Filter items by search query and folder (usando debounce)
  const filteredItems = React.useMemo(() => {
    let filtered = feedItems;

    // CRITICAL: Filter out YouTube videos (they should only appear in YouTube tab)
    filtered = filtered.filter((item) => {
      try {
        const url = new URL(item.url);
        const hostname = url.hostname.toLowerCase();
        // Exclude youtube.com and youtu.be URLs
        return !hostname.includes('youtube.com') && !hostname.includes('youtu.be');
      } catch {
        // If URL parsing fails, keep the item
        return true;
      }
    });

    // Filter by folder (if selected)
    if (selectedFolderId) {
      // Filter by subscriptions that belong to the selected folder
      const folderSubscriptions = subscriptions
        .filter((sub) => sub.folder?.id === selectedFolderId)
        .map((sub) => sub.feed?.id)
        .filter(Boolean);

      filtered = filtered.filter((item) =>
        folderSubscriptions.includes(item.feedId)
      );
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.excerpt?.toLowerCase().includes(query)
      );
    }

    // CRITICAL: Deduplicate items by ID (fixes duplicate key warning)
    const seen = new Set<string>();
    filtered = filtered.filter((item) => {
      if (seen.has(item.id)) {
        return false; // Skip duplicate
      }
      seen.add(item.id);
      return true;
    });

    return filtered;
  }, [feedItems, debouncedSearchQuery, selectedFolderId, subscriptions]);

  const handleAddSite = () => {
    router.push('/add-subscription?type=site');
  };

  const handleItemLongPress = (item: FeedItem) => {
    setSelectedItem(item);
    setShowQuickActions(true);
  };

  const quickActions = selectedItem
    ? [
      {
        icon: 'bookmark-outline' as const,
        label: 'Salvar para depois',
        onPress: () => {
          // TODO: Implement save functionality
          console.log('Save:', selectedItem.id);
        },
      },
      {
        icon: 'share-outline' as const,
        label: 'Compartilhar',
        onPress: () => {
          // TODO: Implement share functionality
          console.log('Share:', selectedItem.url);
        },
      },
      {
        icon: 'checkmark-circle-outline' as const,
        label: 'Marcar como lido',
        onPress: () => {
          // TODO: Implement mark as read
          console.log('Mark as read:', selectedItem.id);
        },
      },
    ]
    : [];

  const renderItem = React.useCallback(
    ({ item }: { item: FeedItem }) => (
      <TouchableOpacity
        onLongPress={() => handleItemLongPress(item)}
        activeOpacity={0.7}
      >
        <FeedCard item={item} />
      </TouchableOpacity>
    ),
    []
  );

  const keyExtractor = React.useCallback((item: FeedItem) => item.id, []);

  const getItemLayout = React.useCallback(
    (_: any, index: number) => ({
      length: 280, // Altura aproximada do card (200 thumbnail + 80 conteúdo)
      offset: 280 * index,
      index,
    }),
    []
  );

  const renderEmpty = () => {
    if (isLoadingItems) {
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} lines={3} showAvatar />
          ))}
        </View>
      );
    }

    // Se há busca ativa e não encontrou resultados
    if (debouncedSearchQuery && filteredItems.length === 0) {
      const copy = persuasiveCopy.emptyStates.noSearchResults;
      return (
        <EmptyState
          icon="search-outline"
          title={copy.title}
          description={copy.description}
          actionLabel={copy.cta}
          onAction={() => setSearchQuery('')}
        />
      );
    }

    // Sempre mostrar EmptyState com SmartSuggestions quando não há items
    // (seja porque não tem subscriptions ou porque ainda não carregou items)
    const copy = subscriptions.length === 0
      ? persuasiveCopy.emptyStates.noSubscriptions
      : persuasiveCopy.emptyStates.noItems;

    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="newspaper-outline"
          title={copy.title}
          description={copy.description}
          actionLabel={subscriptions.length === 0 ? copy.cta : undefined}
          onAction={subscriptions.length === 0 ? handleAddSite : undefined}
        />
        <SmartSuggestions
          suggestions={[]}
          onSelect={async (suggestion) => {
            try {
              if (suggestion.type === 'site' && suggestion.url) {
                // Se for RSS customizado, usar a URL do RSS diretamente
                // Se for site normal, o backend fará descoberta automática
                await api.post('/subscriptions/site', { url: suggestion.url });
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await refreshFeeds();
              }
            } catch (error) {
              console.error('Error adding suggestion:', error);
              Alert.alert('Erro', 'Não foi possível adicionar o feed');
            }
          }}
          title={subscriptions.length === 0 ? "Feeds RSS Disponíveis" : "Adicionar mais feeds"}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar artigos..."
      />

      {/* Folder Chips */}
      <FolderChips
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        type="site"
      />

      {/* Feed List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={[
          styles.listContent,
          filteredItems.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          progress && subscriptions.length > 0 && !debouncedSearchQuery ? (
            <View style={styles.behavioralHeader}>
              {/* Saudação Contextual */}
              <View style={styles.greetingContainer}>
                <Text style={[styles.greeting, { color: colors.text }]}>
                  {getContextualCopy.timeOfDay().greeting}
                </Text>
                <Text style={[styles.greetingSuggestion, { color: colors.textSecondary }]}>
                  {getContextualCopy.timeOfDay().suggestion}
                </Text>
              </View>

              {/* Desafios Diários de Notícias */}
              {progress.dailyChallenges && progress.dailyChallenges.length > 0 && (
                <DailyChallengeCard
                  challenges={progress.dailyChallenges.filter(c => c.contentType === 'news' || c.contentType === 'any')}
                  contentType="news"
                  onPress={() => router.push('/profile')}
                />
              )}

              {/* Indicador de Urgência para novo conteúdo */}
              {feedItems.length > 0 && (
                <UrgencyIndicator
                  type="newContent"
                  count={feedItems.filter(item => {
                    const publishedDate = new Date(item.publishedAt || '');
                    const now = new Date();
                    const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
                    return hoursDiff < 24;
                  }).length}
                  dismissible
                  onPress={() => {/* scroll to top */ }}
                />
              )}


            </View>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        // Optimized scroll parameters
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={21}
        updateCellsBatchingPeriod={50}
        onEndReachedThreshold={0.5}
      />

      {/* FAB */}
      {subscriptions.length > 0 && (
        <FloatingActionButton
          onPress={handleAddSite}
          icon="add"
          position="bottom-right"
        />
      )}

      {/* Quick Actions Modal */}
      <QuickActions
        visible={showQuickActions}
        onClose={() => {
          setShowQuickActions(false);
          setSelectedItem(null);
        }}
        actions={quickActions}
      />

      {/* Persuasive Overlays */}
      <AchievementCelebration
        achievement={pendingCelebration}
        onDismiss={dismissCelebration}
      />

      <StreakWarningModal
        visible={showStreakWarning}
        streakDays={progress?.currentStreak || 0}
        onKeepStreak={() => {
          setShowStreakWarning(false);
          // Scroll to top or trigger engagement
          fetchAllItems();
        }}
        onDismiss={() => setShowStreakWarning(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  behavioralHeader: {
    marginBottom: 16,
  },
  greetingContainer: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  greetingSuggestion: {
    fontSize: 14,
    marginTop: 4,
  },
});

