import { create } from 'zustand';
import { api } from '../services/api';
import { useProgressStore } from './progressStore';

export interface Feed {
  id: string;
  url: string;
  siteDomain: string;
  title: string | null;
  rssUrl: string | null;
  faviconUrl: string | null;
  status: 'active' | 'blocked' | 'error' | 'pending';
  lastScrapeAt: string | null;
  _count?: { items: number };
}

export interface FeedItem {
  id: string;
  feedId: string;
  url: string;
  canonicalUrl: string | null;
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  fetchedAt: string;
}

export interface Subscription {
  id: string;
  type: 'site' | 'youtube';
  target: string;
  enabled: boolean;
  createdAt: string;
  feed?: Feed;
  channel?: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
  folder?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

interface FeedState {
  subscriptions: Subscription[];
  feedItems: FeedItem[];
  isLoading: boolean;
  isLoadingItems: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;

  // Actions
  fetchSubscriptions: () => Promise<void>;
  fetchFeedItems: (feedId: string, page?: number) => Promise<void>;
  fetchAllItems: (page?: number) => Promise<void>;
  addSiteSubscription: (url: string) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  refreshFeeds: () => Promise<void>;
  clearItems: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  subscriptions: [],
  feedItems: [],
  isLoading: false,
  isLoadingItems: false,
  error: null,
  currentPage: 1,
  hasMore: true,

  fetchSubscriptions: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/subscriptions');
      set({ subscriptions: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch subscriptions',
        isLoading: false,
      });
    }
  },

  fetchFeedItems: async (feedId: string, page: number = 1) => {
    try {
      set({ isLoadingItems: true, error: null });
      const response = await api.get(`/feeds/${feedId}/items`, {
        params: { page, limit: 20 },
      });

      const newItems = response.data.data;
      const hasMore = page < response.data.meta.totalPages;

      set((state) => ({
        feedItems: page === 1 ? newItems : [...state.feedItems, ...newItems],
        currentPage: page,
        hasMore,
        isLoadingItems: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch items',
        isLoadingItems: false,
      });
    }
  },

  fetchAllItems: async (page: number = 1) => {
    try {
      set({ isLoadingItems: page === 1, error: null });

      // Fetch items from all subscribed feeds
      const { subscriptions } = get();
      const siteSubscriptions = subscriptions.filter(
        (s) => s.type === 'site' && s.feed
      );

      if (siteSubscriptions.length === 0) {
        set({ feedItems: [], isLoadingItems: false });
        return;
      }

      // Fetch items from each feed and combine
      const allItemsPromises = siteSubscriptions.map(async (sub) => {
        try {
          const response = await api.get(`/feeds/${sub.feed!.id}/items`, {
            params: { page: 1, limit: 10 },
          });
          return response.data.data;
        } catch {
          return [];
        }
      });

      const results = await Promise.all(allItemsPromises);
      const allItems = results.flat();

      // Sort by publishedAt
      allItems.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.fetchedAt).getTime();
        const dateB = new Date(b.publishedAt || b.fetchedAt).getTime();
        return dateB - dateA;
      });

      set({
        feedItems: allItems.slice(0, 50), // Limit to 50 items
        isLoadingItems: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch items',
        isLoadingItems: false,
      });
    }
  },

  addSiteSubscription: async (url: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/subscriptions/site', { url });
      await get().fetchSubscriptions();
      
      // Update progress - increment subscriptions count
      const { subscriptions } = get();
      const progressStore = useProgressStore.getState();
      await progressStore.updateProgress({
        totalSubscriptions: subscriptions.length + 1,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(
        error.response?.data?.message || 'Failed to add subscription'
      );
    }
  },

  removeSubscription: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/subscriptions/${id}`);
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(
        error.response?.data?.message || 'Failed to remove subscription'
      );
    }
  },

  refreshFeeds: async () => {
    const { fetchSubscriptions, fetchAllItems } = get();
    await fetchSubscriptions();
    await fetchAllItems();
  },

  clearItems: () => {
    set({ feedItems: [], currentPage: 1, hasMore: true });
  },
}));



