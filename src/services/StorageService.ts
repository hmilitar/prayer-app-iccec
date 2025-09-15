// Storage Service - AsyncStorage wrapper for user data persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, STORAGE_KEYS, FontSize, ThemeMode } from '../types/Settings';

export interface StorageService {
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
  getFavoritePrayers(): Promise<string[]>;
  addFavoritePrayer(prayerId: string): Promise<void>;
  removeFavoritePrayer(prayerId: string): Promise<void>;
  getReadingProgress(): Promise<Record<string, number>>;
  saveReadingProgress(readingId: string, progress: number): Promise<void>;
}

export class AsyncStorageService implements StorageService {
  async getSettings(): Promise<UserSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      // Return default settings if none exist
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, settingsJson);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getFavoritePrayers(): Promise<string[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_PRAYERS);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error loading favorite prayers:', error);
      return [];
    }
  }

  async addFavoritePrayer(prayerId: string): Promise<void> {
    try {
      const favorites = await this.getFavoritePrayers();
      if (!favorites.includes(prayerId)) {
        favorites.push(prayerId);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_PRAYERS, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite prayer:', error);
      throw error;
    }
  }

  async removeFavoritePrayer(prayerId: string): Promise<void> {
    try {
      const favorites = await this.getFavoritePrayers();
      const updatedFavorites = favorites.filter(id => id !== prayerId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_PRAYERS, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite prayer:', error);
      throw error;
    }
  }

  async getReadingProgress(): Promise<Record<string, number>> {
    try {
      const progressJson = await AsyncStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      return progressJson ? JSON.parse(progressJson) : {};
    } catch (error) {
      console.error('Error loading reading progress:', error);
      return {};
    }
  }

  async saveReadingProgress(readingId: string, progress: number): Promise<void> {
    try {
      const currentProgress = await this.getReadingProgress();
      currentProgress[readingId] = progress;
      await AsyncStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(currentProgress));
    } catch (error) {
      console.error('Error saving reading progress:', error);
      throw error;
    }
  }

  private getDefaultSettings(): UserSettings {
    return {
      language: 'en',
      fontSize: FontSize.MEDIUM,
      theme: ThemeMode.SYSTEM,
      notifications: {
        dailyReminder: true,
        reminderTime: '08:00',
        prayerNotifications: true,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        screenReader: false,
      },
      privacy: {
        analytics: true,
        crashReporting: true,
      },
      metadata: {
        version: 1,
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}