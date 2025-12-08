import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { useBookmarkStore } from './bookmarkStore';

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  preferences?: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;

      // Store token securely
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Update API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Sync bookmarks from server after login
      setTimeout(() => {
        useBookmarkStore.getState().syncWithServer();
      }, 500);
    } catch (error: any) {
      set({ isLoading: false });

      // Better error handling
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'Erro ao fazer login';
        console.error('Login error:', error.response.status, message);
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        console.error('Network error:', error.message);
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      } else {
        // Something else happened
        console.error('Login error:', error.message);
        throw new Error(error.message || 'Erro desconhecido ao fazer login');
      }
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true });

      const response = await api.post('/auth/register', { email, password, name });
      const { accessToken, user } = response.data;

      // Store token securely
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      // Update API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      // Clear stored data
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      // Clear API headers
      delete api.defaults.headers.common['Authorization'];

      set({
        token: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(USER_KEY);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Sync bookmarks from server after loading stored auth
        setTimeout(() => {
          useBookmarkStore.getState().syncWithServer();
        }, 1000);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('Load auth error:', error);
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));

