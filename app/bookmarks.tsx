import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../src/contexts/ThemeContext';
import { useBookmarkStore, BookmarkedItem } from '../src/store/bookmarkStore';
import { useToast } from '../src/components/Toast';
import { formatDistanceToNow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!isValid(date)) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};

export default function BookmarksScreen() {
  const { colors, isDark, theme } = useTheme();
  const { showToast } = useToast();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);

  const handlePress = useCallback(async (item: BookmarkedItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(item.url, {
      toolbarColor: isDark ? theme.background.primary : theme.primary,
      controlsColor: isDark ? theme.primary : '#FFFFFF',
    });
  }, [isDark, theme]);

  const handleRemove = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeBookmark(id);
    showToast({
      message: 'Removido dos favoritos',
      type: 'info',
      duration: 2000,
    });
  }, [removeBookmark, showToast]);

  const handleShare = useCallback(async (item: BookmarkedItem) => {
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
  }, []);

  const renderItem = useCallback(({ item }: { item: BookmarkedItem }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {item.thumbnailUrl && (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        )}
        <View style={styles.textContent}>
          <View style={styles.meta}>
            <Ionicons
              name={item.type === 'video' ? 'logo-youtube' : 'globe-outline'}
              size={12}
              color={item.type === 'video' ? colors.youtube : colors.textTertiary}
            />
            <Text style={[styles.source, { color: colors.textTertiary }]} numberOfLines={1}>
              {item.source}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.excerpt && (
            <Text style={[styles.excerpt, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.excerpt}
            </Text>
          )}
          <Text style={[styles.date, { color: colors.textTertiary }]}>
            Salvo {formatDate(item.savedAt)}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleShare(item)}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [colors, handlePress, handleRemove, handleShare]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="bookmark-outline" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Nenhum favorito ainda
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Salve artigos e vídeos para ler depois tocando no ícone de bookmark nos cards.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyButtonText}>Explorar conteúdo</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favoritos</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.count, { color: colors.textTertiary }]}>
            {bookmarks.length}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          bookmarks.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  excerpt: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  actions: {
    justifyContent: 'center',
    paddingRight: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
