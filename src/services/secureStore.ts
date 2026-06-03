import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';
const isServer = isWeb && typeof window === 'undefined';

// Simple in-memory storage fallback for Server-Side Rendering (SSR)
const memoryStorage = new Map<string, string>();

export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (isServer) {
      return memoryStorage.get(key) || null;
    }
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn(`localStorage.getItem failed for key "${key}":`, error);
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`SecureStore.getItemAsync failed for key "${key}":`, error);
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (isServer) {
      memoryStorage.set(key, value);
      return;
    }
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn(`localStorage.setItem failed for key "${key}":`, error);
        return;
      }
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`SecureStore.setItemAsync failed for key "${key}":`, error);
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (isServer) {
      memoryStorage.delete(key);
      return;
    }
    if (isWeb) {
      try {
        localStorage.removeItem(key);
        return;
      } catch (error) {
        console.warn(`localStorage.removeItem failed for key "${key}":`, error);
        return;
      }
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`SecureStore.deleteItemAsync failed for key "${key}":`, error);
    }
  },
};
