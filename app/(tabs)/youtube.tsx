import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useYouTubeStore, YouTubeVideo } from '../../src/store/youtubeStore';
import { VideoCard } from '../../src/components/VideoCard';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { SearchBar } from '../../src/components/SearchBar';
import { SkeletonCard } from '../../src/components/SkeletonLoader';
import { QuickActions } from '../../src/components/QuickActions';
import { EmptyState } from '../../src/components/EmptyState';
import { ChannelChips } from '../../src/components/ChannelChips';

import { UrgencyIndicator } from '../../src/components/UrgencyIndicator';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useProgressStore } from '../../src/store/progressStore';
import { getContextualCopy } from '../../src/utils/persuasiveCopy';
import { DailyChallengeCard } from '../../src/components/DailyChallengeCard';
import { AchievementCelebration } from '../../src/components/AchievementCelebration';
import { StreakWarningModal } from '../../src/components/StreakWarningModal';
import { persuasiveHaptics } from '../../src/utils/persuasiveHaptics';

export default function YouTubeScreen() {
  const { colors, isDark } = useTheme();

  // Selectors
  const videos = useYouTubeStore((state) => state.videos);
  const channels = useYouTubeStore((state) => state.channels);
  const isLoadingVideos = useYouTubeStore((state) => state.isLoadingVideos);
  const fetchAllVideos = useYouTubeStore((state) => state.fetchAllVideos);
  const fetchChannels = useYouTubeStore((state) => state.fetchChannels);

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [showStreakWarning, setShowStreakWarning] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Progress Store
  const progress = useProgressStore((state) => state.progress);
  const dismissCelebration = useProgressStore((state) => state.dismissCelebration);
  const pendingCelebration = useProgressStore((state) => state.pendingCelebration);

  // Load data on mount and focus
  useFocusEffect(
    useCallback(() => {
      fetchChannels();
      fetchAllVideos();

      // Update progress and check streak
      useProgressStore.getState().checkStreak();
      useProgressStore.getState().fetchProgress();

      // Check for streak warning
      const shouldWarn = useProgressStore.getState().checkStreakWarning();
      if (shouldWarn) setShowStreakWarning(true);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await persuasiveHaptics.refreshRelease();
    await fetchChannels();
    await fetchAllVideos();
    await persuasiveHaptics.anticipationDelay(100);
    await persuasiveHaptics.contentLoaded();
    setRefreshing(false);
  }, [fetchChannels, fetchAllVideos]);

  // Count live videos (ONLY videoType === 'live' or isLive === true)
  const liveVideos = React.useMemo(() => {
    return videos.filter((video) => video.videoType === 'live' || video.isLive === true);
  }, [videos]);

  const hasLiveVideos = liveVideos.length > 0;

  // Calculate recent videos by channel (last 24 hours)
  const recentVideosByChannel = React.useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const countMap = new Map<string, number>();

    videos.forEach((video) => {
      const publishDate = new Date(video.publishedAt);
      if (publishDate >= oneDayAgo && video.channelDbId) {
        const current = countMap.get(video.channelDbId) || 0;
        countMap.set(video.channelDbId, current + 1);
      }
    });

    return countMap;
  }, [videos]);

  // Filter videos by search query, channel, and recency
  const filteredVideos = React.useMemo(() => {
    // If "AO VIVO" selected, show ONLY live videos
    if (selectedChannelId === 'live') {
      let filtered = videos.filter((video) => video.videoType === 'live' || video.isLive === true);

      // Filter by search query
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter(
          (video) =>
            video.title.toLowerCase().includes(query) ||
            video.description?.toLowerCase().includes(query)
        );
      }

      return filtered;
    }

    // For TODOS and specific channels:
    // - Show ONLY regular videos (videoType === 'video')
    // - Exclude: live, vod, short
    let allVideos = videos.filter((video) => {
      // Exclude if it's currently live
      if (video.isLive === true || video.videoType === 'live') return false;
      // Exclude if it's a VOD recording
      if (video.videoType === 'vod') return false;
      // Exclude if it's a short
      if (video.videoType === 'short') return false;
      // Include regular videos (videoType === 'video' or not set)
      return true;
    });

    // If specific channel selected - show last 6 videos (regardless of date)
    if (selectedChannelId !== null) {
      // DEBUG: Log channel IDs
      console.log('🔍 Selected channel:', selectedChannelId);
      console.log('🔍 allVideos count:', allVideos.length);
      console.log('🔍 Sample video channelDbIds:', allVideos.slice(0, 3).map(v => v.channelDbId));

      const channelVideos = allVideos
        .filter((video) => video.channelDbId === selectedChannelId)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      console.log('🔍 Matching videos:', channelVideos.length);

      // Get last 6 videos from this channel
      let filtered = channelVideos.slice(0, 6);

      // Filter by search query
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter(
          (video) =>
            video.title.toLowerCase().includes(query) ||
            video.description?.toLowerCase().includes(query)
        );
      }

      return filtered;
    }

    // TODOS - show only videos from last 24 hours (most recent)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    let filtered = allVideos.filter((video) => {
      const publishDate = new Date(video.publishedAt);
      return publishDate >= oneDayAgo;
    });

    // Sort by date (most recent first)
    filtered.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [videos, debouncedSearchQuery, selectedChannelId]);

  const handleAddChannel = () => {
    router.push('/add-subscription?type=youtube');
  };

  const handleVideoLongPress = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setShowQuickActions(true);
  };

  const quickActions = selectedVideo
    ? [
      {
        icon: 'bookmark-outline' as const,
        label: 'Salvar para depois',
        onPress: () => {
          console.log('Save:', selectedVideo.id);
        },
      },
      {
        icon: 'share-outline' as const,
        label: 'Compartilhar',
        onPress: () => {
          console.log('Share:', selectedVideo.videoId);
        },
      },
      {
        icon: 'checkmark-circle-outline' as const,
        label: 'Marcar como assistido',
        onPress: () => {
          // TODO implementation
        },
      },
    ]
    : [];

  // Memoize channels map
  const channelsMap = React.useMemo(
    () => new Map(channels.map((c) => [c.id, c])),
    [channels]
  );

  const renderItem = React.useCallback(
    ({ item }: { item: YouTubeVideo }) => {
      const channel = channelsMap.get(item.channelDbId);
      // Use channelTitle from video (API response) first, fallback to channel map
      const channelTitle = item.channelTitle || channel?.title;
      return (
        <TouchableOpacity
          onLongPress={() => handleVideoLongPress(item)}
          activeOpacity={0.7}
        >
          <VideoCard video={item} channelTitle={channelTitle} />
        </TouchableOpacity>
      );
    },
    [channelsMap]
  );

  const keyExtractor = React.useCallback((item: YouTubeVideo) => item.id, []);

  const getItemLayout = React.useCallback(
    (_: any, index: number) => ({
      length: 320,
      offset: 320 * index,
      index,
    }),
    []
  );

  const renderEmpty = () => {
    if (isLoadingVideos) {
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} lines={2} showAvatar />
          ))}
        </View>
      );
    }

    if (channels.length === 0) {
      return (
        <EmptyState
          icon="logo-youtube"
          title="Nenhum canal adicionado"
          description="Adicione seus canais favoritos do YouTube para assistir aos últimos vídeos em um só lugar"
          actionLabel="Adicionar Primeiro Canal"
          onAction={handleAddChannel}
        />
      );
    }

    if (debouncedSearchQuery && filteredVideos.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum resultado encontrado"
          description={`Não encontramos vídeos para "${searchQuery}"`}
          actionLabel="Limpar Busca"
          onAction={() => setSearchQuery('')}
        />
      );
    }

    return (
      <EmptyState
        icon="logo-youtube"
        title="Nenhum vídeo ainda"
        description="Os vídeos dos seus canais aparecerão aqui quando estiverem disponíveis"
        actionLabel="Atualizar"
        onAction={onRefresh}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar vídeos..."
      />

      {/* Channel Chips */}
      <ChannelChips
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        hasLiveVideos={hasLiveVideos}
        liveCount={liveVideos.length}
        recentVideosByChannel={recentVideosByChannel}
      />

      {/* Videos List */}
      <FlatList
        data={filteredVideos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={[
          styles.listContent,
          filteredVideos.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          progress && channels.length > 0 && !debouncedSearchQuery ? (
            <View style={styles.behavioralHeader}>
              {/* Saudação Contextual */}
              <View style={styles.greetingContainer}>
                <Text style={[styles.greeting, { color: colors.text }]}>
                  {getContextualCopy.timeOfDay().greeting}
                </Text>
                <Text style={[styles.greetingSuggestion, { color: colors.textSecondary }]}>
                  Hora de assistir seus canais favoritos
                </Text>
              </View>

              {/* Desafios Diários de Vídeos */}
              {progress.dailyChallenges && progress.dailyChallenges.length > 0 && (
                <DailyChallengeCard
                  challenges={progress.dailyChallenges.filter(c => c.contentType === 'videos' || c.contentType === 'any')}
                  contentType="videos"
                  onPress={() => router.push('/profile')}
                />
              )}

              {/* Indicador de Vídeos Novos */}
              {videos.length > 0 && (
                <UrgencyIndicator
                  type="newContent"
                  count={videos.filter(video => {
                    const publishedDate = new Date(video.publishedAt);
                    const now = new Date();
                    const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
                    return hoursDiff < 48; // Vídeos das últimas 48h
                  }).length}
                  dismissible
                  onPress={() => { }}
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
            tintColor={colors.youtube}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={4}
        windowSize={21}
        updateCellsBatchingPeriod={50}
        onEndReachedThreshold={0.5}
      />

      {/* FAB - Only show when there are channels */}
      {channels.length > 0 && (
        <FloatingActionButton
          onPress={handleAddChannel}
          icon="add"
          position="bottom-right"
        />
      )}

      {/* Quick Actions Modal */}
      <QuickActions
        visible={showQuickActions}
        onClose={() => {
          setShowQuickActions(false);
          setSelectedVideo(null);
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
          fetchAllVideos();
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
