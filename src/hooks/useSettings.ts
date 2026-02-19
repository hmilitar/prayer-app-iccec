// Custom hook for managing user settings

import { useState, useEffect, useCallback } from 'react';
import { EventEmitter } from 'fbemitter';
import { UserSettings, FontSize, ThemeMode } from '../types/Settings';
import { AsyncStorageService } from '../services/StorageService';
import { SupportedLanguage } from '../types/Prayer';

// Global Event Emitter for Settings synchronization across the app
// This ensures that when settings change in one screen, all other screens update instantly
const settingsEmitter = new EventEmitter();
const EVENT_SETTINGS_CHANGED = 'settings_changed';

// In-memory cache to serve settings immediately to new subscribers without async delay
let globalSettingsCache: UserSettings | null = null;

export function useSettings() {
  // Initialize with cache if available to prevent layout shift/flicker
  const [settings, setSettings] = useState<UserSettings | null>(globalSettingsCache);
  const [loading, setLoading] = useState(!globalSettingsCache); // Only loading if cache is empty
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Stable singleton — AsyncStorageService is stateless so a single instance is safe.
  // Using useState initializer guarantees this is only created once per hook lifetime,
  // preventing every downstream useCallback from being recreated on every render.
  const [storageService] = useState(() => new AsyncStorageService());

  useEffect(() => {
    // If we don't have settings yet (fresh app launch), load them
    if (!globalSettingsCache) {
      loadSettings();
    }

    // Subscribe to global setting changes
    const subscription = settingsEmitter.addListener(EVENT_SETTINGS_CHANGED, (newSettings: UserSettings) => {
      // Update local state (this triggers re-render)
      setSettings(newSettings);
      
      // Update cache
      globalSettingsCache = newSettings;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadSettings = async () => {
    try {
      // Only set loading if we don't have data
      if (!settings) setLoading(true);
      
      setError(null);
      const userSettings = await storageService.getSettings();
      
      // Update local state and global cache
      setSettings(userSettings);
      globalSettingsCache = userSettings;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // On error, we might want to use default settings
      if (!settings) {
         // Fallback could be added here
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    // Defensive check: ensure we have base settings to merge into
    const baseSettings = settings || globalSettingsCache;
    if (!baseSettings) {
        console.warn('Cannot update settings: Settings not loaded yet');
        return false;
    }

    try {
      setSaving(true);
      setError(null);
      
      const updatedSettings: UserSettings = {
        ...baseSettings,
        ...newSettings,
        metadata: {
          ...baseSettings.metadata,
          version: baseSettings.metadata.version + 1,
          lastUpdated: new Date().toISOString(),
        },
      };

      // Optimistic update: Broadcast fast, then save
      // This makes the UI feel instant
      setSettings(updatedSettings);
      globalSettingsCache = updatedSettings;
      settingsEmitter.emit(EVENT_SETTINGS_CHANGED, updatedSettings);

      // Persist to storage
      await storageService.saveSettings(updatedSettings);
      
      return true;
    } catch (err) {
      // Rollback logic could be implemented here if save fails
      console.error('Failed to save settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      
      // In a real robust app, we might emit the old settings back to revert UI
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings, storageService]);

  const resetSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Get fresh default settings
      const defaultSettings = new AsyncStorageService().getDefaultSettings();
      
      // Optimistic update
      setSettings(defaultSettings);
      globalSettingsCache = defaultSettings;
      settingsEmitter.emit(EVENT_SETTINGS_CHANGED, defaultSettings);

      await storageService.saveSettings(defaultSettings);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [storageService]);


  // Convenience methods for specific settings
  const updateLanguage = useCallback(async (language: SupportedLanguage) => {
    return await updateSettings({ language });
  }, [updateSettings]);

  const updateFontSize = useCallback(async (fontSize: FontSize) => {
    return await updateSettings({ fontSize });
  }, [updateSettings]);

  const updateTheme = useCallback(async (theme: ThemeMode) => {
    return await updateSettings({ theme });
  }, [updateSettings]);

  const toggleNotification = useCallback(async (type: 'dailyReminder' | 'prayerNotifications') => {
    if (!settings) return false;
    
    return await updateSettings({
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  }, [settings, updateSettings]);

  const updateReminderTime = useCallback(async (reminderTime: string) => {
    if (!settings) return false;
    
    return await updateSettings({
      notifications: {
        ...settings.notifications,
        reminderTime
      }
    });
  }, [settings, updateSettings]);

  const toggleAccessibility = useCallback(async (type: 'reduceMotion' | 'highContrast' | 'screenReader') => {
    if (!settings) return false;
    
    return await updateSettings({
      accessibility: {
        ...settings.accessibility,
        [type]: !settings.accessibility[type]
      }
    });
  }, [settings, updateSettings]);

  const togglePrivacy = useCallback(async (type: 'analytics' | 'crashReporting') => {
    if (!settings) return false;
    
    return await updateSettings({
      privacy: {
        ...settings.privacy,
        [type]: !settings.privacy[type]
      }
    });
  }, [settings, updateSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    resetSettings,
    reload: loadSettings,
    // Convenience methods
    updateLanguage,
    updateFontSize,
    updateTheme,
    toggleNotification,
    updateReminderTime,
    toggleAccessibility,
    togglePrivacy,
    // Getters
    isLoaded: settings !== null,
    currentLanguage: settings?.language || 'en',
    currentFontSize: settings?.fontSize || FontSize.MEDIUM,
    currentTheme: settings?.theme || ThemeMode.SYSTEM,
  };
}