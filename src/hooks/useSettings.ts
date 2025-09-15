// Custom hook for managing user settings

import { useState, useEffect, useCallback } from 'react';
import { UserSettings, FontSize, ThemeMode } from '../types/Settings';
import { AsyncStorageService } from '../services/StorageService';
import { SupportedLanguage } from '../types/Prayer';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const storageService = new AsyncStorageService();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await storageService.getSettings();
      setSettings(userSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!settings) return false;

    try {
      setSaving(true);
      setError(null);
      
      const updatedSettings: UserSettings = {
        ...settings,
        ...newSettings,
        metadata: {
          ...settings.metadata,
          version: settings.metadata.version + 1,
          lastUpdated: new Date().toISOString(),
        },
      };

      await storageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
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
      const defaultSettings = new AsyncStorageService()['getDefaultSettings']();
      await storageService.saveSettings(defaultSettings);
      setSettings(defaultSettings);
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