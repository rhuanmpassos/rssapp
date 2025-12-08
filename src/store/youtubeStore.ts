import { create } from 'zustand';
import { api } from '../services/api';
import { useProgressStore } from './progressStore';

export interface YouTubeChannel {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  customUrl: string | null;
  lastCheckedAt: string | null;
  _count?: { videos: number };
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  channelDbId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: string | number | null;
  publishedAt: string;
  fetchedAt: string;
  channelTitle?: string;
  isLive?: boolean;
  videoType?: 'video' | 'short' | 'vod' | 'live';
}

interface YouTubeState {
  channels: YouTubeChannel[];
  videos: YouTubeVideo[];
  isLoading: boolean;
  isLoadingVideos: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  fetchChannels: () => Promise<void>;
  fetchChannelVideos: (channelId: string, page?: number) => Promise<void>;
  fetchAllVideos: () => Promise<void>;
  addChannel: (channelNameOrUrl: string) => Promise<void>;
  removeChannel: (subscriptionId: string) => Promise<void>;
  clearVideos: () => void;
}

export const useYouTubeStore = create<YouTubeState>((set, get) => ({
  channels: [],
  videos: [],
  isLoading: false,
  isLoadingVideos: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  fetchChannels: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/youtube/channels');
      set({ channels: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch channels',
        isLoading: false,
      });
    }
  },

  fetchChannelVideos: async (channelId: string, page: number = 1) => {
    try {
      set({ isLoadingVideos: true, error: null });
      const response = await api.get(`/youtube/channels/${channelId}/videos`, {
        params: { page, limit: 20 },
      });

      const newVideos = response.data.data;
      const hasMore = page < response.data.meta.totalPages;

      set((state) => ({
        videos: page === 1 ? newVideos : [...state.videos, ...newVideos],
        currentPage: page,
        hasMore,
        isLoadingVideos: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch videos',
        isLoadingVideos: false,
      });
    }
  },

  fetchAllVideos: async () => {
    try {
      set({ isLoadingVideos: true, error: null });

      const { channels } = get();
      if (channels.length === 0) {
        await get().fetchChannels();
      }

      const currentChannels = get().channels;
      if (currentChannels.length === 0) {
        set({ videos: [], isLoadingVideos: false });
        return;
      }

      // Fetch videos from each channel
      const allVideosPromises = currentChannels.map(async (channel) => {
        try {
          const response = await api.get(`/youtube/channels/${channel.id}/videos`, {
            params: { page: 1, limit: 10 },
          });
          // Add channelTitle and channelDbId to each video
          const channelTitle = response.data.channel?.title || channel.title || 'YouTube';
          return response.data.data.map((video: any) => ({
            ...video,
            channelTitle,
            // Ensure channelDbId is set from the channel being fetched
            channelDbId: video.channelDbId || channel.id,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(allVideosPromises);
      const allVideos = results.flat();

      // Sort: lives first, then by publishedAt
      allVideos.sort((a, b) => {
        // Lives always on top (only use explicit isLive field)
        const aIsLive = a.isLive === true;
        const bIsLive = b.isLive === true;

        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;

        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });

      // Debug: log first 5 videos with isLive status
      console.log('🎥 Videos loaded:', allVideos.slice(0, 5).map(v => ({
        title: v.title?.substring(0, 30),
        isLive: v.isLive,
        videoId: v.videoId,
      })));

      set({
        videos: allVideos.slice(0, 50),
        isLoadingVideos: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch videos',
        isLoadingVideos: false,
      });
    }
  },

  addChannel: async (channelNameOrUrl: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/subscriptions/youtube', { channelNameOrUrl });
      await get().fetchChannels();

      // Update progress to track explore challenge
      const channels = get().channels;
      await useProgressStore.getState().updateProgress({
        totalSubscriptions: channels.length,
      }, 'videos'); // 'videos' = add channel challenge
      console.log('[YouTube] Channel added, updated progress with totalSubscriptions:', channels.length);
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(
        error.response?.data?.message || 'Failed to add channel'
      );
    }
  },

  removeChannel: async (subscriptionId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/subscriptions/${subscriptionId}`);
      await get().fetchChannels();
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(
        error.response?.data?.message || 'Failed to remove channel'
      );
    }
  },

  clearVideos: () => {
    set({ videos: [], currentPage: 1, hasMore: true });
  },
}));



