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
import { FeedItem } from '../store/feedStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import { useProgressStore } from '../store/progressStore';
import { useToast } from './Toast';

interface FeedCardProps {
  item: FeedItem;
  feedTitle?: string;
}

// Memoizar função de formatação de data
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
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

export const FeedCard = React.memo(function FeedCard({ item, feedTitle }: FeedCardProps) {
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked(item.id));
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const isRead = useBookmarkStore((state) => state.isRead(item.id));
  const markAsRead = useBookmarkStore((state) => state.markAsRead);
  const incrementItemsRead = useProgressStore((state) => state.incrementItemsRead);

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Marcar como lido ao abrir
    markAsRead(item.id, 'feed');

    // Incrementar XP se ainda não foi lido (gamificação)
    if (!isRead) {
      await incrementItemsRead('news');
    }

    await WebBrowser.openBrowserAsync(item.url, {
      toolbarColor: isDark ? theme.background.primary : theme.primary,
      controlsColor: isDark ? theme.primary : '#FFFFFF',
    });
  }, [item.url, item.id, isDark, theme, markAsRead, isRead, incrementItemsRead]);

  const handleBookmark = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isBookmarked) {
      removeBookmark(item.id);
      showToast({
        message: 'Removido dos favoritos',
        type: 'info',
        duration: 2000,
      });
    } else {
      addBookmark({
        id: item.id,
        type: 'feed',
        title: item.title,
        excerpt: item.excerpt || undefined,
        thumbnailUrl: item.thumbnailUrl || undefined,
        url: item.url,
        source: feedTitle || hostname,
        publishedAt: item.publishedAt || '',
      });
      showToast({
        message: 'Salvo nos favoritos!',
        type: 'success',
        duration: 2000,
      });
    }
  }, [isBookmarked, item, feedTitle, addBookmark, removeBookmark, showToast]);

  const handleShare = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await Share.share({
        title: item.title,
        message: `${item.title}\n\n${item.url}`,
        url: item.url,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [item.title, item.url]);

  // Memoizar valores computados
  const formattedDate = useMemo(() => formatDate(item.publishedAt), [item.publishedAt]);
  const hostname = useMemo(() => {
    try {
      return new URL(item.url).hostname;
    } catch {
      return item.url;
    }
  }, [item.url]);
  const displayTitle = useMemo(() => feedTitle || hostname, [feedTitle, hostname]);

  const socialProof = useMemo(() => {
    if (!item.publishedAt) return null;
    const date = new Date(item.publishedAt);
    const now = new Date();
    const hours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (hours < 4) return { text: '🔥 Em alta', color: '#F59E0B' };
    if (hours < 12) return { text: '⚡ Recente', color: '#3B82F6' };
    // Simulação de social proof para itens específicos
    if (item.title.length % 5 === 0) return { text: '👥 +1k lendo', color: '#10B981' };
    return null;
  }, [item.publishedAt, item.title]);

  return (
    <Card onPress={handlePress} style={[styles.card, isRead ? styles.readCard : undefined]} padding="none">
      <View style={styles.content}>
        {/* Thumbnail */}
        {item.thumbnailUrl && (
          <View style={styles.thumbnailContainer} key={`thumb-${item.id}`}>
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
              priority="high"
              placeholderContentFit="cover"
              recyclingKey={item.id}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />

            {/* Social Proof Badge */}
            {socialProof && !isRead && (
              <View style={[styles.socialBadge, { backgroundColor: socialProof.color }]}>
                <Text style={styles.socialBadgeText}>
                  {socialProof.text}
                </Text>
              </View>
            )}

            {/* Read indicator */}
            {isRead && (
              <View style={[styles.readBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {/* Text content */}
        <View style={styles.textContent}>
          {/* Source and date */}
          <View style={styles.meta}>
            <View style={styles.sourceContainer}>
              <Ionicons
                name="globe-outline"
                size={12}
                color={theme.text.tertiary}
              />
              <Text
                style={[styles.source, { color: theme.text.tertiary }]}
                numberOfLines={1}
              >
                {displayTitle}
              </Text>
            </View>
            <Text style={[styles.date, { color: theme.text.tertiary }]}>
              {formattedDate}
            </Text>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: theme.text.primary },
              isRead && styles.readTitle
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* Excerpt */}
          {item.excerpt && (
            <Text
              style={[styles.excerpt, { color: theme.text.secondary }]}
              numberOfLines={2}
            >
              {item.excerpt}
            </Text>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            {/* Author */}
            {item.author && (
              <View style={styles.authorContainer}>
                <Ionicons
                  name="person-outline"
                  size={12}
                  color={theme.text.tertiary}
                />
                <Text
                  style={[styles.author, { color: theme.text.tertiary }]}
                  numberOfLines={1}
                >
                  {item.author}
                </Text>
              </View>
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
                  color={isBookmarked ? theme.primary : theme.text.tertiary}
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
      </View>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.excerpt === nextProps.item.excerpt &&
    prevProps.item.thumbnailUrl === nextProps.item.thumbnailUrl &&
    prevProps.item.publishedAt === nextProps.item.publishedAt &&
    prevProps.feedTitle === nextProps.feedTitle
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  readCard: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'column',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  readBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  socialBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textContent: {
    padding: spacing.base,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  source: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  readTitle: {
    fontWeight: '600',
  },
  excerpt: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  author: {
    fontSize: 12,
    marginLeft: spacing.xs,
    fontWeight: '500',
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




