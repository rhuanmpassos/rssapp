import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/contexts/ThemeContext';
import { api, apiService, getServerBaseUrl } from '../src/services/api';
import { FolderSelector } from '../src/components/FolderSelector';
import { useDebounce } from '../src/hooks/useDebounce';
import { useFeedStore } from '../src/store/feedStore';
import { useYouTubeStore } from '../src/store/youtubeStore';
import { CustomDialog } from '../src/components/CustomDialog';
import { useDialog } from '../src/hooks/useDialog';

type SubscriptionType = 'site' | 'youtube';

interface CustomFeed {
  id: string;
  title: string;
  description?: string;
  slug: string;
  siteUrl?: string;
  channelUrl?: string;
  type?: 'site' | 'youtube';
  category?: {
    id: string;
    name: string;
  };
}

export default function AddSubscriptionScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ type?: string }>();
  const type = (params.type as SubscriptionType) || 'site';
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomFeed[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  // Get existing subscriptions to check for duplicates
  const subscriptions = useFeedStore((state) => state.subscriptions);
  const addSiteSubscription = useFeedStore((state) => state.addSiteSubscription);
  const channels = useYouTubeStore((state) => state.channels);
  const addChannel = useYouTubeStore((state) => state.addChannel);

  // Custom dialog hook  
  const { dialogConfig, showAlert, hideDialog } = useDialog();

  const isSite = type === 'site';

  // Check for duplicates when URL changes - only for valid URLs
  useEffect(() => {
    if (!url.trim()) {
      setIsDuplicate(false);
      setDuplicateMessage('');
      return;
    }

    try {
      const trimmedUrl = url.trim().toLowerCase();

      // Only check for duplicates if it looks like a URL
      const looksLikeUrl = trimmedUrl.startsWith('http://') ||
        trimmedUrl.startsWith('https://') ||
        trimmedUrl.includes('.') && trimmedUrl.length > 4;

      if (!looksLikeUrl) {
        // It's a search query, not a URL - don't show duplicate warning
        setIsDuplicate(false);
        setDuplicateMessage('');
        return;
      }

      // Extract domain from input URL
      let inputDomain = '';
      try {
        if (trimmedUrl.startsWith('http')) {
          const urlObj = new URL(trimmedUrl);
          inputDomain = urlObj.hostname.replace('www.', '').toLowerCase();
        } else {
          // Try to parse as domain
          inputDomain = trimmedUrl.split('/')[0].replace('www.', '').toLowerCase();
        }
      } catch {
        inputDomain = trimmedUrl.replace('www.', '').toLowerCase();
      }

      // Check in feed subscriptions - compare domains only
      const feedDuplicate = subscriptions.some((sub) => {
        const feedUrl = sub.feed?.url || sub.target || '';
        if (!feedUrl) return false;

        try {
          const feedUrlObj = new URL(feedUrl);
          const feedDomain = feedUrlObj.hostname.replace('www.', '').toLowerCase();
          // Only match if domains are exactly the same
          return feedDomain === inputDomain;
        } catch {
          return false;
        }
      });

      // Check in YouTube channels - compare channelId, customUrl, or URL
      const youtubeDuplicate = channels.some((channel) => {
        // Check if input is a YouTube URL
        if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
          // Extract channel identifier from URL
          const channelIdMatch = trimmedUrl.match(/channel\/([^\/\?]+)/i);
          const customUrlMatch = trimmedUrl.match(/@([^\/\?]+)/i);

          if (channelIdMatch && channel.channelId === channelIdMatch[1]) {
            return true;
          }
          if (customUrlMatch && channel.customUrl?.toLowerCase().includes(customUrlMatch[1].toLowerCase())) {
            return true;
          }
        }

        // Check if input matches exactly the customUrl (like @channelname)
        if (trimmedUrl.startsWith('@')) {
          const inputHandle = trimmedUrl.substring(1).toLowerCase();
          const channelHandle = (channel.customUrl || '').replace('@', '').toLowerCase();
          return inputHandle === channelHandle;
        }

        return false;
      });

      if (feedDuplicate || youtubeDuplicate) {
        setIsDuplicate(true);
        setDuplicateMessage(isSite ? 'Este site já está no seu feed' : 'Este canal já está no seu feed');
      } else {
        setIsDuplicate(false);
        setDuplicateMessage('');
      }
    } catch (error) {
      setIsDuplicate(false);
      setDuplicateMessage('');
    }
  }, [url, subscriptions, channels, isSite]);

  // Search custom feeds when query changes (sites or YouTube)
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchCustomFeeds(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery, isSite]);

  const searchCustomFeeds = async (query: string) => {
    try {
      setIsSearching(true);
      setShowSearchResults(true);

      // Search both site feeds and YouTube feeds
      const [siteResponse, youtubeResponse] = await Promise.all([
        apiService.searchCustomFeeds(query).catch(() => ({ data: [] })),
        apiService.searchCustomYouTubeFeeds(query).catch(() => ({ data: [] })),
      ]);

      // Combine results and mark their type
      const siteFeeds = (siteResponse.data || []).map((feed: any) => ({ ...feed, type: 'site' as const }));
      const youtubeFeeds = (youtubeResponse.data || []).map((feed: any) => ({ ...feed, type: 'youtube' as const }));

      // Filter by type if needed (show only relevant feeds)
      const allFeeds = isSite
        ? [...siteFeeds, ...youtubeFeeds] // Show both when searching sites (user might want YouTube too)
        : youtubeFeeds; // Show only YouTube when in YouTube mode

      setSearchResults(allFeeds);
    } catch (error) {
      console.error('Error searching custom feeds:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCustomFeed = async (feed: CustomFeed) => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get base URL for RSS - use server URL (the server accesses itself via this URL)
      const serverBaseUrl = getServerBaseUrl();
      const feedType = feed.type || (feed.siteUrl ? 'site' : 'youtube');
      const rssUrl = feedType === 'youtube'
        ? `${serverBaseUrl}/custom-youtube-feeds/${feed.slug}/rss.xml`
        : `${serverBaseUrl}/custom-feeds/${feed.slug}/rss.xml`;

      console.log('=== handleSelectCustomFeed ===');
      console.log('feed:', JSON.stringify(feed, null, 2));
      console.log('feedType:', feedType);
      console.log('rssUrl:', rssUrl);
      console.log('Using feedStore.addSiteSubscription for progress tracking...');

      // Use the store function to ensure progress tracking works
      await addSiteSubscription(rssUrl);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert(
        '🎉 Sucesso!',
        feedType === 'youtube'
          ? 'Canal adicionado! Novos vídeos aparecerão aqui.'
          : 'Feed adicionado! Novos artigos chegarão em breve.',
        [{
          text: 'OK',
          onPress: () => {
            hideDialog();
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }
        }]
      );
    } catch (error: any) {
      console.error('=== Error adding custom feed ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Não foi possível adicionar o feed';
      showAlert('Erro', message);
    } finally {
      setIsLoading(false);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleAdd = async () => {
    if (!url.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert(
        'Campo vazio',
        isSite
          ? 'Digite a URL do site ou pesquise por feeds'
          : 'Digite o nome ou URL do canal ou pesquise por canais'
      );
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (isSite) {
        // Use the store function to ensure progress tracking works
        await addSiteSubscription(url.trim());
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert(
          '🎉 Sucesso!',
          'Site adicionado! Novos artigos chegarão em breve.',
          [{
            text: 'OK',
            onPress: () => {
              hideDialog();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }
          }]
        );
      } else {
        // For YouTube, try to use the store for progress tracking
        // If it's a custom YouTube feed URL, use addSiteSubscription
        // Otherwise use addChannel
        if (url.trim().includes('/custom-youtube-feeds/') || url.trim().includes('rss.xml')) {
          await addSiteSubscription(url.trim());
        } else {
          await addChannel(url.trim());
        }
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert(
          '🎉 Sucesso!',
          'Canal adicionado! Novos vídeos aparecerão aqui.',
          [{
            text: 'OK',
            onPress: () => {
              hideDialog();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }
          }]
        );
      }
    } catch (error: any) {
      console.error('Error adding subscription:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message ||
        (isSite ? 'Não foi possível adicionar o site' : 'Não foi possível adicionar o canal');
      showAlert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResult = ({ item }: { item: CustomFeed }) => {
    const feedType = item.type || (item.siteUrl ? 'site' : 'youtube');
    const isYouTubeFeed = feedType === 'youtube';
    return (
      <TouchableOpacity
        style={[styles.searchResultItem, { backgroundColor: colors.card }]}
        onPress={() => handleSelectCustomFeed(item)}
        activeOpacity={0.7}
      >
        <View style={styles.searchResultContent}>
          <View style={[styles.searchResultIcon, { backgroundColor: isYouTubeFeed ? '#FFE5E5' : colors.primaryLight }]}>
            <Ionicons
              name={isYouTubeFeed ? 'logo-youtube' : 'newspaper-outline'}
              size={20}
              color={isYouTubeFeed ? colors.youtube : colors.primary}
            />
          </View>
          <View style={styles.searchResultText}>
            <Text style={[styles.searchResultTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={[styles.searchResultDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={[styles.categoryText, { color: isYouTubeFeed ? colors.youtube : colors.primary }]}>
                  {item.category.name}
                </Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
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
          Adicionar
        </Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.iconHeader,
                { backgroundColor: isSite ? colors.primaryLight : '#FFE5E5' },
              ]}
            >
              <Ionicons
                name={isSite ? 'globe' : 'logo-youtube'}
                size={36}
                color={isSite ? colors.primary : colors.youtube}
              />
            </View>

            <Text style={[styles.formSubtitle, { color: colors.textTertiary }]}>
              {isSite
                ? 'Pesquise feeds disponíveis ou cole a URL do site. Descobrimos o feed automaticamente.'
                : 'Digite o nome, @handle ou URL. Encontramos tudo automaticamente.'}
            </Text>

            {/* Input */}
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name={isSite ? 'search' : 'search'}
                size={20}
                color={colors.textTertiary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={isSite ? 'Pesquisar feeds ou colar URL...' : 'Pesquisar canais ou colar URL...'}
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setUrl(text); // Keep url in sync for manual input
                  // If it looks like a URL, hide search results
                  if (text.startsWith('http://') || text.startsWith('https://')) {
                    setShowSearchResults(false);
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                editable={!isLoading}
                onFocus={() => {
                  if (searchQuery.length >= 2 && !searchQuery.startsWith('http')) {
                    setShowSearchResults(true);
                  }
                }}
              />
              {searchQuery.length > 0 && !isLoading && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setUrl('');
                  setShowSearchResults(false);
                }}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              )}
              {searchQuery.length >= 2 && !searchQuery.startsWith('http') && (
                <ActivityIndicator size="small" color={isSite ? colors.primary : colors.youtube} style={{ marginRight: 8 }} />
              )}
            </View>

            {/* Duplicate Warning */}
            {isDuplicate && duplicateMessage && (
              <View style={[styles.duplicateWarning, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
                <Ionicons name="warning" size={16} color={isDark ? '#F87171' : '#EF4444'} />
                <Text style={[styles.duplicateText, { color: isDark ? '#F87171' : '#EF4444' }]}>
                  {duplicateMessage}
                </Text>
              </View>
            )}

            {/* Search Results */}
            {showSearchResults && (
              <View style={[styles.searchResultsContainer, { backgroundColor: colors.background }]}>
                {isSearching ? (
                  <View style={styles.searchLoading}>
                    <ActivityIndicator size="small" color={isSite ? colors.primary : colors.youtube} />
                    <Text style={[styles.searchLoadingText, { color: colors.textSecondary }]}>
                      Buscando...
                    </Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => (
                      <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    )}
                  />
                ) : debouncedSearchQuery.length >= 2 ? (
                  <View style={styles.searchEmpty}>
                    <Text style={[styles.searchEmptyText, { color: colors.textSecondary }]}>
                      Nenhum feed encontrado
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Folder Selector */}
            {!showSearchResults && (
              <FolderSelector
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
              />
            )}

            {/* Examples */}
            {!showSearchResults && (
              <View style={styles.examplesContainer}>
                <Ionicons name="bulb-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.examples, { color: colors.textTertiary }]}>
                  {isSite
                    ? 'Exemplos: techcrunch.com, theverge.com, g1.globo.com'
                    : 'Exemplos: @GoogleDevelopers, Fireship, MKBHD'}
                </Text>
              </View>
            )}

            {/* Submit Button - Show if URL is provided (for direct URL addition) */}
            {url.trim().length > 0 && (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: isSite ? colors.primary : colors.youtube },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleAdd}
                disabled={isLoading || isDuplicate}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>
                      {isSite ? 'Adicionar Agora' : 'Adicionar Canal'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Info Card */}
          {!showSearchResults && (
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {isSite ? 'Detecção automática de feed RSS' : 'Busca automática de canal'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Atualizações em tempo real
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Notificações push de novos conteúdos
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Tudo em um só lugar, sem distrações
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Dialog */}
      {dialogConfig && (
        <CustomDialog
          visible={true}
          title={dialogConfig.title}
          message={dialogConfig.message}
          buttons={dialogConfig.buttons}
          onDismiss={hideDialog}
        />
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  formCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  iconHeader: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  formSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 17,
  },
  searchResultsContainer: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    maxHeight: 300,
    overflow: 'hidden',
  },
  searchResultItem: {
    padding: 16,
  },
  searchResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: 14,
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginLeft: 52,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  searchLoadingText: {
    fontSize: 14,
  },
  searchEmpty: {
    padding: 20,
    alignItems: 'center',
  },
  searchEmptyText: {
    fontSize: 14,
  },
  examplesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  examples: {
    fontSize: 13,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    borderRadius: 14,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
  duplicateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  duplicateText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
