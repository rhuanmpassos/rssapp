import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { spacing, borderRadius } from '../theme';
import { YouTubeVideo } from '../store/youtubeStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useProgressStore } from '../store/progressStore';
import { useToast } from './Toast';

interface VideoCardProps {
  video: YouTubeVideo;
  channelTitle?: string;
}

// Memoizar funções de formatação
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (!isValid(date)) return '';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 24) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  }

  return format(date, "dd MMM 'às' HH:mm", { locale: ptBR });
};

const formatDuration = (duration: string | number | null) => {
  if (!duration && duration !== 0) return '';

  // If duration is a number (seconds from youtubei.js)
  if (typeof duration === 'number') {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Parse ISO 8601 duration (PT1H2M10S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const VideoCard = React.memo(function VideoCard({ video, channelTitle }: VideoCardProps) {
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked(video.id));
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const incrementItemsRead = useProgressStore((state) => state.incrementItemsRead);

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Incrementar XP ao assistir vídeo (gamificação comportamental)
    await incrementItemsRead('video');

    await WebBrowser.openBrowserAsync(videoUrl, {
      toolbarColor: isDark ? theme.background.primary : '#FF0000',
      controlsColor: '#FFFFFF',
    });
  }, [videoUrl, isDark, theme, incrementItemsRead]);

  const handleBookmark = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isBookmarked) {
      removeBookmark(video.id);
      showToast({
        message: 'Removido dos favoritos',
        type: 'info',
        duration: 2000,
      });
    } else {
      addBookmark({
        id: video.id,
        type: 'video',
        title: video.title,
        excerpt: video.description || undefined,
        thumbnailUrl: video.thumbnailUrl || undefined,
        url: videoUrl,
        source: channelTitle || 'YouTube',
        publishedAt: video.publishedAt,
      });
      showToast({
        message: 'Salvo nos favoritos!',
        type: 'success',
        duration: 2000,
      });
    }
  }, [isBookmarked, video, videoUrl, channelTitle, addBookmark, removeBookmark, showToast]);

  const handleShare = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Share.share({
        title: video.title,
        message: `${video.title}\n\n${videoUrl}`,
        url: videoUrl,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [video.title, videoUrl]);

  // Memoizar valores computados
  const thumbnailUrl = useMemo(
    () => video.thumbnailUrl || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
    [video.thumbnailUrl, video.videoId]
  );
  const formattedDuration = useMemo(() => formatDuration(video.duration), [video.duration]);
  const formattedDate = useMemo(() => formatDate(video.publishedAt), [video.publishedAt]);
  const displayChannel = useMemo(() => channelTitle || 'YouTube', [channelTitle]);

  // Detect if video is a livestream
  // ONLY use explicit isLive field from backend (don't fallback to !duration)
  const isLive = (video as any).isLive === true;

  return (
    <Card onPress={handlePress} style={styles.card} padding="none">
      {/* Thumbnail with duration overlay */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          priority="normal"
          placeholderContentFit="cover"
          recyclingKey={video.videoId}
        />

        {/* Play icon overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={28} color="#FFFFFF" />
          </View>
        </View>

        {/* Duration badge */}
        {formattedDuration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formattedDuration}
            </Text>
          </View>
        )}

        {/* YouTube logo */}
        <View style={styles.youtubeBadge}>
          <Ionicons name="logo-youtube" size={22} color="#FF0000" />
        </View>

        {/* LIVE Indicator */}
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}
      </View>

      {/* Video info */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.text.primary }]}
          numberOfLines={2}
        >
          {video.title}
        </Text>

        <View style={styles.meta}>
          <Text style={[styles.channel, { color: theme.text.secondary }]}>
            {displayChannel}
          </Text>
          <Text style={[styles.dot, { color: theme.text.tertiary }]}>•</Text>
          <Text style={[styles.date, { color: theme.text.tertiary }]}>
            {formattedDate}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {video.description && (
            <Text
              style={[styles.description, { color: theme.text.tertiary }]}
              numberOfLines={1}
            >
              {video.description}
            </Text>
          )}

          <View style={styles.actionButtons}>
            {/* Bookmark button */}
            <TouchableOpacity
              onPress={handleBookmark}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? theme.youtube : theme.text.tertiary}
              />
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="share-outline"
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.title === nextProps.video.title &&
    prevProps.video.thumbnailUrl === nextProps.video.thumbnailUrl &&
    prevProps.video.publishedAt === nextProps.video.publishedAt &&
    prevProps.video.duration === nextProps.video.duration &&
    prevProps.channelTitle === nextProps.channelTitle
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  youtubeBadge: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  liveBadge: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    backgroundColor: '#DC2626',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.base,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  channel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  dot: {
    marginHorizontal: spacing.xs,
    fontSize: 12,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
});
