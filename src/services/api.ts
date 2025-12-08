import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL from environment or use default
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  // Check if API URL is configured in app.json
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) {
    return configuredUrl;
  }

  // Default based on platform
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    // For physical device, replace with your computer's IP (e.g., http://192.168.1.100:3000/api/v1)
    return 'http://10.0.2.2:3000/api/v1';
  } else {
    // iOS simulator can use localhost
    return 'http://localhost:3000/api/v1';
  }
};

// Get server base URL for RSS feeds and other server-side URLs
// This is the URL that the SERVER will use to access itself
// In dev, we use localhost since the server runs on localhost
// In production, use the production URL
export const getServerBaseUrl = () => {
  // Check if configured in app.json
  const configuredUrl = Constants.expoConfig?.extra?.serverBaseUrl;
  if (configuredUrl) {
    return configuredUrl;
  }

  // In dev, the server accesses itself via localhost
  if (__DEV__) {
    return 'http://localhost:3000/api/v1';
  }

  // In production, use the same as API base URL
  // (assumes API and server are the same in production)
  return getApiBaseUrl();
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (remove in production)
if (__DEV__) {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Server Base URL:', getServerBaseUrl());
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
let isRedirectingToLogin = false;
let onAuthExpired: (() => void) | null = null;

// Function to set the callback for auth expiration (called from app init)
export const setOnAuthExpired = (callback: () => void) => {
  onAuthExpired = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors (API not reachable)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (__DEV__) {
        console.warn('Network Error: API not reachable at', API_BASE_URL);
        console.warn('Make sure the backend is running and accessible');
      }
      // Don't throw for network errors in non-critical operations
      // Let individual components handle them gracefully
    }

    if (error.response?.status === 401) {
      // Avoid multiple redirects
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;

        // Token expired or invalid - clear auth
        try {
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('auth_user');

          // Call the auth expired callback if set
          if (onAuthExpired) {
            setTimeout(() => {
              onAuthExpired?.();
              isRedirectingToLogin = false;
            }, 100);
          } else {
            isRedirectingToLogin = false;
          }
        } catch (e) {
          console.log('Error clearing auth:', e);
          isRedirectingToLogin = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const apiService = {
  // Auth
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),

  getProfile: () => api.get('/auth/me'),

  // Subscriptions
  getSubscriptions: (page = 1, limit = 20) =>
    api.get('/subscriptions', { params: { page, limit } }),

  addSiteSubscription: (url: string) =>
    api.post('/subscriptions/site', { url }),

  addYouTubeSubscription: (channelNameOrUrl: string) =>
    api.post('/subscriptions/youtube', { channelNameOrUrl }),

  deleteSubscription: (id: string) => api.delete(`/subscriptions/${id}`),

  // Feeds
  getFeeds: (page = 1, limit = 20) =>
    api.get('/feeds', { params: { page, limit } }),

  getFeed: (id: string) => api.get(`/feeds/${id}`),

  getFeedItems: (feedId: string, page = 1, limit = 20) =>
    api.get(`/feeds/${feedId}/items`, { params: { page, limit } }),

  // YouTube
  getYouTubeChannels: (page = 1, limit = 20) =>
    api.get('/youtube/channels', { params: { page, limit } }),

  getYouTubeChannel: (id: string) => api.get(`/youtube/channels/${id}`),

  getYouTubeVideos: (channelId: string, page = 1, limit = 20) =>
    api.get(`/youtube/channels/${channelId}/videos`, { params: { page, limit } }),

  // Push notifications
  registerPushToken: (token: string, platform: string) =>
    api.post('/push/register', { token, platform }),

  unregisterPushToken: (token: string, platform: string) =>
    api.delete('/push/unregister', { data: { token, platform } }),

  // Health
  getHealth: () => api.get('/health'),

  // Custom Feeds (Public - no auth required)
  getCustomFeeds: () => {
    // Create a temporary axios instance without auth for public endpoint
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get('/custom-feeds/public');
  },

  searchCustomFeeds: (query?: string) => {
    // Create a temporary axios instance without auth for public endpoint
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get('/custom-feeds/public/search', { params: { q: query } });
  },

  // Custom YouTube Feeds (Public - no auth required)
  getCustomYouTubeFeeds: () => {
    // Create a temporary axios instance without auth for public endpoint
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get('/custom-youtube-feeds/public');
  },

  searchCustomYouTubeFeeds: (query?: string) => {
    // Create a temporary axios instance without auth for public endpoint
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get('/custom-youtube-feeds/public/search', { params: { q: query } });
  },
};

export default api;

