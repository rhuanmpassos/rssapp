import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { YouTubeChannel } from '../store/youtubeStore';

interface ChannelChipsProps {
  channels: YouTubeChannel[];
  selectedChannelId: string | null; // null = todos, 'live' = só lives, channel.id = canal específico
  onSelectChannel: (channelId: string | null) => void;
  hasLiveVideos: boolean;
  liveCount?: number;
  recentVideosByChannel?: Map<string, number>; // channelId -> count of videos in last 24h
}

export function ChannelChips({
  channels,
  selectedChannelId,
  onSelectChannel,
  hasLiveVideos,
  liveCount = 0,
  recentVideosByChannel,
}: ChannelChipsProps) {
  const { colors, isDark } = useTheme();

  // Track which channels the user has already viewed (clicked on)
  const [viewedChannels, setViewedChannels] = useState<Set<string>>(new Set());

  // When user clicks a channel, mark it as viewed
  const handleSelectChannel = (channelId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If selecting a specific channel, mark it as viewed
    if (channelId && channelId !== 'live') {
      setViewedChannels(prev => new Set([...prev, channelId]));
    }

    onSelectChannel(channelId);
  };

  // Se não há canais, não mostrar o componente
  if (channels.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Chip "Todos" - sempre primeiro */}
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedChannelId === null
                  ? colors.primary
                  : isDark
                    ? colors.card
                    : colors.border,
            },
          ]}
          onPress={() => handleSelectChannel(null)}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  selectedChannelId === null
                    ? '#fff'
                    : colors.text,
              },
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {/* Chip "AO VIVO" - só aparece quando há lives */}
        {hasLiveVideos && (
          <TouchableOpacity
            style={[
              styles.chip,
              styles.liveChip,
              {
                backgroundColor:
                  selectedChannelId === 'live'
                    ? '#DC2626'
                    : isDark
                      ? 'rgba(220, 38, 38, 0.2)'
                      : 'rgba(220, 38, 38, 0.15)',
                borderWidth: selectedChannelId === 'live' ? 0 : 1,
                borderColor: '#DC2626',
              },
            ]}
            onPress={() => handleSelectChannel('live')}
          >
            <View style={styles.liveDot} />
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedChannelId === 'live'
                      ? '#fff'
                      : '#DC2626',
                },
              ]}
            >
              AO VIVO
            </Text>
            {liveCount > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      selectedChannelId === 'live'
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(220, 38, 38, 0.3)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        selectedChannelId === 'live'
                          ? '#fff'
                          : '#DC2626',
                    },
                  ]}
                >
                  {liveCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Chips de cada canal */}
        {channels.map((channel) => (
          <TouchableOpacity
            key={channel.id}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedChannelId === channel.id
                    ? colors.youtube
                    : isDark
                      ? colors.card
                      : colors.border,
              },
            ]}
            onPress={() => handleSelectChannel(channel.id)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedChannelId === channel.id
                      ? '#fff'
                      : colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {channel.title}
            </Text>
            {(() => {
              const videoCount = channel._count?.videos || 0;
              const recentCount = recentVideosByChannel?.get(channel.id) || 0;
              const hasBeenViewed = viewedChannels.has(channel.id);
              // Show red only if: has recent videos AND not currently selected AND not viewed before
              const showAsNew = recentCount > 0 && selectedChannelId !== channel.id && !hasBeenViewed;

              if (videoCount === 0) return null;

              return (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        selectedChannelId === channel.id
                          ? 'rgba(255,255,255,0.3)' // White when selected
                          : showAsNew
                            ? 'rgba(220, 38, 38, 0.2)' // Red for new videos
                            : colors.primary + '20', // Blue default
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          selectedChannelId === channel.id
                            ? '#fff' // White when selected
                            : showAsNew
                              ? '#DC2626' // Red for new videos
                              : colors.primary, // Blue default
                      },
                    ]}
                  >
                    {videoCount}
                  </Text>
                </View>
              );
            })()}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  scrollContent: {
    paddingLeft: 12,
    paddingRight: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveChip: {
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
