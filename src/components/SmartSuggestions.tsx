import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { spacing } from '../theme';
import { persuasiveCopy } from '../utils/persuasiveCopy';
import { apiService, getServerBaseUrl } from '../services/api';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  url?: string;
  channelId?: string;
  type: 'site' | 'youtube';
  category?: string;
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  title?: string;
  showSocialProof?: boolean;
}

// Sugestões populares pré-definidas (pode vir do backend)
const POPULAR_SITES: Suggestion[] = [
  {
    id: 'techcrunch',
    title: 'TechCrunch',
    description: 'Notícias de tecnologia e startups',
    icon: 'laptop-outline',
    url: 'https://techcrunch.com',
    type: 'site',
    category: 'Tecnologia',
  },
  {
    id: 'theverge',
    title: 'The Verge',
    description: 'Tecnologia, ciência e cultura',
    icon: 'hardware-chip-outline',
    url: 'https://www.theverge.com',
    type: 'site',
    category: 'Tecnologia',
  },
  {
    id: 'g1',
    title: 'G1',
    description: 'Notícias do Brasil e do mundo',
    icon: 'newspaper-outline',
    url: 'https://g1.globo.com',
    type: 'site',
    category: 'Notícias',
  },
];

const POPULAR_CHANNELS: Suggestion[] = [
  {
    id: 'fireship',
    title: 'Fireship',
    description: 'Código rápido e divertido',
    icon: 'logo-youtube',
    channelId: 'UCsBjURrPoezykLs9EqgamOA',
    type: 'youtube',
    category: 'Programação',
  },
  {
    id: 'mkbhd',
    title: 'MKBHD',
    description: 'Reviews de tecnologia',
    icon: 'logo-youtube',
    channelId: 'UCBJycsmduvYEL83R_U4JriQ',
    type: 'youtube',
    category: 'Tecnologia',
  },
];

export function SmartSuggestions({
  suggestions = [],
  onSelect,
  title,
  showSocialProof = true,
}: SmartSuggestionsProps) {
  const { colors } = useTheme();
  const [customFeeds, setCustomFeeds] = useState<Suggestion[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  // Buscar custom feeds do backend (sites e YouTube)
  useEffect(() => {
    const fetchCustomFeeds = async () => {
      try {
        setLoadingFeeds(true);
        // Buscar feeds de sites e YouTube
        const [siteFeedsResponse, youtubeFeedsResponse] = await Promise.all([
          apiService.getCustomFeeds().catch(() => ({ data: [] })),
          apiService.getCustomYouTubeFeeds().catch(() => ({ data: [] })),
        ]);

        // Use server base URL (the server needs to access itself)
        const serverBaseUrl = getServerBaseUrl();

        const siteFeeds = siteFeedsResponse.data.map((feed: any) => ({
          id: feed.id,
          title: feed.title,
          description: feed.description || feed.category?.name || 'Feed RSS',
          icon: 'newspaper-outline' as keyof typeof Ionicons.glyphMap,
          url: `${serverBaseUrl}/custom-feeds/${feed.slug}/rss.xml`,
          type: 'site' as const,
          category: feed.category?.name,
        }));

        const youtubeFeeds = youtubeFeedsResponse.data.map((feed: any) => ({
          id: feed.id,
          title: feed.title,
          description: feed.description || feed.category?.name || 'Canal YouTube',
          icon: 'logo-youtube' as keyof typeof Ionicons.glyphMap,
          url: `${serverBaseUrl}/custom-youtube-feeds/${feed.slug}/rss.xml`,
          type: 'site' as const, // Usar 'site' para que seja adicionado via /subscriptions/site
          category: feed.category?.name,
        }));

        setCustomFeeds([...siteFeeds, ...youtubeFeeds]);
      } catch (error) {
        console.error('Error fetching custom feeds:', error);
        // Silently fail - will show popular sites instead
      } finally {
        setLoadingFeeds(false);
      }
    };

    fetchCustomFeeds();
  }, []);

  // Priorizar custom feeds, depois suggestions passadas, depois populares
  const displaySuggestions =
    customFeeds.length > 0
      ? customFeeds
      : suggestions.length > 0
        ? suggestions
        : POPULAR_SITES;

  const handleSelect = async (suggestion: Suggestion) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(suggestion);
  };

  if (displaySuggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title || persuasiveCopy.socialProof.popularSites}
        </Text>
        {showSocialProof && (
          <View style={styles.socialProof}>
            <Ionicons name="people-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.socialProofText, { color: colors.textTertiary }]}>
              Popular
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displaySuggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            style={[styles.suggestionCard, { backgroundColor: colors.card }]}
            onPress={() => handleSelect(suggestion)}
            padding="sm"
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
              <Ionicons
                name={suggestion.icon}
                size={24}
                color={suggestion.type === 'youtube' ? colors.youtube : colors.primary}
              />
            </View>
            <Text
              style={[styles.suggestionTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {suggestion.title}
            </Text>
            <Text
              style={[styles.suggestionDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {suggestion.description}
            </Text>
            {suggestion.category && (
              <View style={styles.category}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {suggestion.category}
                </Text>
              </View>
            )}
            <View style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>
                Adicionar
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

// Componente para mostrar sugestões baseadas em contexto
export function ContextualSuggestions({
  userProgress,
  onSelect,
}: {
  userProgress?: {
    subscriptions: number;
    itemsRead: number;
    interests?: string[];
  };
  onSelect: (suggestion: Suggestion) => void;
}) {
  // Lógica para sugerir baseado no progresso do usuário
  const suggestions: Suggestion[] = [];

  if (!userProgress || userProgress.subscriptions === 0) {
    // Primeira vez - mostrar sugestões populares
    return (
      <SmartSuggestions
        suggestions={POPULAR_SITES.slice(0, 3)}
        onSelect={onSelect}
        title="Comece com sites populares"
      />
    );
  }

  if (userProgress.subscriptions < 3) {
    // Poucos sites - sugerir mais
    return (
      <SmartSuggestions
        suggestions={POPULAR_SITES}
        onSelect={onSelect}
        title="Diversifique seu feed"
      />
    );
  }

  // Usuário experiente - sugerir canais YouTube
  return (
    <SmartSuggestions
      suggestions={POPULAR_CHANNELS}
      onSelect={onSelect}
      title="Explore canais populares"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialProofText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  suggestionCard: {
    width: 160,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  category: {
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

