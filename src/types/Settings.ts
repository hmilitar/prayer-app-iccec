// Settings data types based on technical specification

import { SupportedLanguage } from './Prayer';

export interface UserSettings {
  language: SupportedLanguage;
  fontSize: FontSize;
  theme: ThemeMode;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
  metadata: {
    version: number;
    lastUpdated: string;
  };
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  prayerNotifications: boolean;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  crashReporting: boolean;
}

// Storage Keys
export const STORAGE_KEYS = {
  USER_SETTINGS: '@prayer_app/user_settings',
  LAST_READ_PRAYER: '@prayer_app/last_read_prayer',
  FAVORITE_PRAYERS: '@prayer_app/favorite_prayers',
  READING_PROGRESS: '@prayer_app/reading_progress',
  APP_VERSION: '@prayer_app/app_version'
} as const;