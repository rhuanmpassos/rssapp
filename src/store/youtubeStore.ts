import { create } from 'zustand';
import { api } from '../services/api';

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
  duration: string | null;
  publishedAt: string;
  fetchedAt: string;
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
          return response.data.data;
        } catch {
          return [];
        }
      });

      const results = await Promise.all(allVideosPromises);
      const allVideos = results.flat();

      // Sort by publishedAt
      allVideos.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });

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



