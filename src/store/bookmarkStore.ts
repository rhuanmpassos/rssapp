import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

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

interface PendingSyncItem {
  action: 'ADD_BOOKMARK' | 'REMOVE_BOOKMARK' | 'MARK_READ' | 'MARK_UNREAD';
  payload: any;
  timestamp: string;
}

interface BookmarkState {
  bookmarks: BookmarkedItem[];
  readItems: ReadItem[];
  isLoading: boolean;
  lastSyncAt: string | null;
  pendingSync: PendingSyncItem[];
  isSyncing: boolean;

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

  // Sync
  syncWithServer: () => Promise<void>;
  processPendingSync: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      readItems: [],
      isLoading: false,
      lastSyncAt: null,
      pendingSync: [],
      isSyncing: false,

      // Bookmarks
      addBookmark: (item) => {
        const { bookmarks, pendingSync } = get();
        if (bookmarks.some((b) => b.id === item.id)) {
          return; // Already bookmarked
        }
        const newBookmark: BookmarkedItem = {
          ...item,
          savedAt: new Date().toISOString(),
        };

        // Add to local store immediately
        set({ bookmarks: [newBookmark, ...bookmarks] });

        // Queue for sync with backend (fire and forget)
        api.post('/bookmarks', {
          itemType: item.type,
          itemId: item.id,
          title: item.title,
          excerpt: item.excerpt,
          thumbnailUrl: item.thumbnailUrl,
          url: item.url,
          source: item.source,
          publishedAt: item.publishedAt,
          savedAt: newBookmark.savedAt,
        }).catch(() => {
          // If sync fails, add to pending queue
          set({
            pendingSync: [
              ...pendingSync,
              {
                action: 'ADD_BOOKMARK',
                payload: newBookmark,
                timestamp: new Date().toISOString(),
              },
            ],
          });
        });
      },

      removeBookmark: (id) => {
        const { bookmarks, pendingSync } = get();
        set({ bookmarks: bookmarks.filter((b) => b.id !== id) });

        // Sync with backend
        api.delete(`/bookmarks/${id}`).catch(() => {
          set({
            pendingSync: [
              ...pendingSync,
              {
                action: 'REMOVE_BOOKMARK',
                payload: { id },
                timestamp: new Date().toISOString(),
              },
            ],
          });
        });
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
        const { readItems, pendingSync } = get();
        if (readItems.some((r) => r.id === id)) {
          return; // Already read
        }
        const newRead: ReadItem = {
          id,
          type,
          readAt: new Date().toISOString(),
        };
        set({ readItems: [...readItems, newRead] });

        // Sync with backend
        api.post('/read-items', {
          itemType: type,
          itemId: id,
          readAt: newRead.readAt,
        }).catch(() => {
          set({
            pendingSync: [
              ...pendingSync,
              {
                action: 'MARK_READ',
                payload: newRead,
                timestamp: new Date().toISOString(),
              },
            ],
          });
        });
      },

      markAsUnread: (id) => {
        const { readItems, pendingSync } = get();
        set({ readItems: readItems.filter((r) => r.id !== id) });

        api.delete(`/read-items/${id}`).catch(() => {
          set({
            pendingSync: [
              ...pendingSync,
              {
                action: 'MARK_UNREAD',
                payload: { id },
                timestamp: new Date().toISOString(),
              },
            ],
          });
        });
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

      // Sync with server
      syncWithServer: async () => {
        const { bookmarks, readItems, lastSyncAt, isSyncing } = get();

        if (isSyncing) return;

        set({ isSyncing: true });

        try {
          // First, process any pending sync items
          await get().processPendingSync();

          // Sync bookmarks
          const bookmarkSyncData = bookmarks.map((b) => ({
            itemType: b.type,
            itemId: b.id,
            title: b.title,
            excerpt: b.excerpt,
            thumbnailUrl: b.thumbnailUrl,
            url: b.url,
            source: b.source,
            publishedAt: b.publishedAt,
            savedAt: b.savedAt,
          }));

          const bookmarkResponse = await api.post('/bookmarks/sync', {
            bookmarks: bookmarkSyncData,
            lastSyncAt,
          });

          // Merge server bookmarks
          if (bookmarkResponse.data?.toSync?.length > 0) {
            const serverBookmarks: BookmarkedItem[] = bookmarkResponse.data.toSync.map((item: any) => ({
              id: item.itemId,
              type: item.itemType,
              title: item.title,
              excerpt: item.excerpt,
              thumbnailUrl: item.thumbnailUrl,
              url: item.url,
              source: item.source,
              publishedAt: item.publishedAt,
              savedAt: item.savedAt,
            }));

            const currentBookmarks = get().bookmarks;
            const newBookmarks = serverBookmarks.filter(
              (sb) => !currentBookmarks.some((cb) => cb.id === sb.id)
            );

            if (newBookmarks.length > 0) {
              set({ bookmarks: [...currentBookmarks, ...newBookmarks] });
            }
          }

          // Sync read items
          const readSyncData = readItems.map((r) => ({
            itemType: r.type,
            itemId: r.id,
            readAt: r.readAt,
          }));

          const readResponse = await api.post('/read-items/sync', {
            readItems: readSyncData,
            lastSyncAt,
          });

          // Merge server read items
          if (readResponse.data?.toSync?.length > 0) {
            const serverReadItems: ReadItem[] = readResponse.data.toSync.map((item: any) => ({
              id: item.itemId,
              type: item.itemType,
              readAt: item.readAt,
            }));

            const currentReadItems = get().readItems;
            const newReadItems = serverReadItems.filter(
              (sr) => !currentReadItems.some((cr) => cr.id === sr.id)
            );

            if (newReadItems.length > 0) {
              set({ readItems: [...currentReadItems, ...newReadItems] });
            }
          }

          set({ lastSyncAt: new Date().toISOString() });
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Process pending sync items
      processPendingSync: async () => {
        const { pendingSync } = get();

        if (pendingSync.length === 0) return;

        const processed: PendingSyncItem[] = [];

        for (const item of pendingSync) {
          try {
            switch (item.action) {
              case 'ADD_BOOKMARK':
                await api.post('/bookmarks', {
                  itemType: item.payload.type,
                  itemId: item.payload.id,
                  title: item.payload.title,
                  excerpt: item.payload.excerpt,
                  thumbnailUrl: item.payload.thumbnailUrl,
                  url: item.payload.url,
                  source: item.payload.source,
                  publishedAt: item.payload.publishedAt,
                  savedAt: item.payload.savedAt,
                });
                break;
              case 'REMOVE_BOOKMARK':
                await api.delete(`/bookmarks/${item.payload.id}`);
                break;
              case 'MARK_READ':
                await api.post('/read-items', {
                  itemType: item.payload.type,
                  itemId: item.payload.id,
                  readAt: item.payload.readAt,
                });
                break;
              case 'MARK_UNREAD':
                await api.delete(`/read-items/${item.payload.id}`);
                break;
            }
            processed.push(item);
          } catch (error) {
            // Keep failed items for retry
            console.error(`Failed to sync ${item.action}:`, error);
          }
        }

        // Remove processed items from pending
        if (processed.length > 0) {
          set({
            pendingSync: pendingSync.filter((p) => !processed.includes(p)),
          });
        }
      },
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        readItems: state.readItems,
        lastSyncAt: state.lastSyncAt,
        pendingSync: state.pendingSync,
      }),
    }
  )
);

