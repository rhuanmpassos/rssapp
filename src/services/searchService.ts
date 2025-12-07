import api from './api';

export interface SearchParams {
  query: string;
  type?: 'all' | 'feed' | 'video';
  author?: string;
  feedId?: string;
  channelId?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  resultType: 'feed' | 'video';
  title: string;
  excerpt?: string;
  description?: string;
  thumbnailUrl?: string;
  url?: string;
  author?: string;
  channelTitle?: string;
  publishedAt: string;
  relevance?: number;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    feedCount?: number;
    videoCount?: number;
  };
}

/**
 * Search across feed items and videos using full-text search
 */
export const searchItems = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await api.get('/search', {
    params: {
      q: params.query,
      type: params.type || 'all',
      author: params.author,
      feedId: params.feedId,
      channelId: params.channelId,
      page: params.page || 1,
      limit: params.limit || 20,
    }
  });
  return response.data;
};

/**
 * Search only in user's bookmarks
 */
export const searchBookmarks = async (params: Omit<SearchParams, 'feedId' | 'channelId' | 'author'>): Promise<SearchResponse> => {
  const response = await api.get('/search/bookmarks', {
    params: {
      q: params.query,
      type: params.type || 'all',
      page: params.page || 1,
      limit: params.limit || 20,
    }
  });
  return response.data;
};
