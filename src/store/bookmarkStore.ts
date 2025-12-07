import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BookmarkedItem {
  id: string;
  type: 'feed' | 'video';
  title: string;
  excerpt?: string;
  thumbnailUrl?: string;
  url: string;
  source: string;
  publishedAt: string;
  savedAt: string;
}

export interface ReadItem {
  id: string;
  type: 'feed' | 'video';
  readAt: string;
}

interface BookmarkState {
  bookmarks: BookmarkedItem[];
  readItems: ReadItem[];
  isLoading: boolean;

  // Bookmarks
  addBookmark: (item: Omit<BookmarkedItem, 'savedAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  getBookmarks: () => BookmarkedItem[];
  clearBookmarks: () => void;

  // Read status
  markAsRead: (id: string, type: 'feed' | 'video') => void;
  markAsUnread: (id: string) => void;
  isRead: (id: string) => boolean;
  getReadCount: () => number;
  clearReadHistory: () => void;

  // Stats
  getStats: () => {
    totalBookmarks: number;
    totalRead: number;
    feedBookmarks: number;
    videoBookmarks: number;
  };
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      readItems: [],
      isLoading: false,

      // Bookmarks
      addBookmark: (item) => {
        const { bookmarks } = get();
        if (bookmarks.some((b) => b.id === item.id)) {
          return; // Already bookmarked
        }
        const newBookmark: BookmarkedItem = {
          ...item,
          savedAt: new Date().toISOString(),
        };
        set({ bookmarks: [newBookmark, ...bookmarks] });
      },

      removeBookmark: (id) => {
        const { bookmarks } = get();
        set({ bookmarks: bookmarks.filter((b) => b.id !== id) });
      },

      isBookmarked: (id) => {
        const { bookmarks } = get();
        return bookmarks.some((b) => b.id === id);
      },

      getBookmarks: () => {
        return get().bookmarks;
      },

      clearBookmarks: () => {
        set({ bookmarks: [] });
      },

      // Read status
      markAsRead: (id, type) => {
        const { readItems } = get();
        if (readItems.some((r) => r.id === id)) {
          return; // Already read
        }
        const newRead: ReadItem = {
          id,
          type,
          readAt: new Date().toISOString(),
        };
        set({ readItems: [...readItems, newRead] });
      },

      markAsUnread: (id) => {
        const { readItems } = get();
        set({ readItems: readItems.filter((r) => r.id !== id) });
      },

      isRead: (id) => {
        const { readItems } = get();
        return readItems.some((r) => r.id === id);
      },

      getReadCount: () => {
        return get().readItems.length;
      },

      clearReadHistory: () => {
        set({ readItems: [] });
      },

      // Stats
      getStats: () => {
        const { bookmarks, readItems } = get();
        return {
          totalBookmarks: bookmarks.length,
          totalRead: readItems.length,
          feedBookmarks: bookmarks.filter((b) => b.type === 'feed').length,
          videoBookmarks: bookmarks.filter((b) => b.type === 'video').length,
        };
      },
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        readItems: state.readItems,
      }),
    }
  )
);
