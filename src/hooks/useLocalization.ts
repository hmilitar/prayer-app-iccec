// Custom hook for localization

import { useState, useEffect } from 'react';
import { EventEmitter } from 'fbemitter';
import { SupportedLanguage } from '../types/Prayer';
import { LocalizationService } from '../services/LocalizationService';
import { AsyncStorageService } from '../services/StorageService';

// Global event emitter for language changes to ensure synchronization
const languageEmitter = new EventEmitter();
const EVENT_LANGUAGE_CHANGED = 'language_changed';

export function useLocalization() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localizationService = LocalizationService.getInstance();

  useEffect(() => {
    initializeLocalization();
    
    // Subscribe to language changes from other components
    const subscription = languageEmitter.addListener(EVENT_LANGUAGE_CHANGED, (language: SupportedLanguage) => {
      // Update local state if it differs
      if (currentLanguage !== language) {
        setCurrentLanguage(language);
        localizationService.setLanguage(language); // Ensure service is synced
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeLocalization = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load translations first
      await localizationService.loadTranslations();
      
      // Try to load saved language preference
      const storageService = new AsyncStorageService();
      const settings = await storageService.getSettings();
      
      if (settings.language) {
        await localizationService.setLanguage(settings.language);
        setCurrentLanguage(settings.language);
      } else {
        // Use detected device language
        const language = localizationService.getCurrentLanguage();
        setCurrentLanguage(language);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize localization');
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      setError(null);
      await localizationService.setLanguage(language);
      setCurrentLanguage(language);
      
      // Notify other components
      languageEmitter.emit(EVENT_LANGUAGE_CHANGED, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change language');
    }
  };

  const translate = (key: string, options?: any): string => {
    return localizationService.translate(key, options);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return localizationService.formatDate(date, options);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return localizationService.formatNumber(number, options);
  };

  const getSupportedLanguages = (): SupportedLanguage[] => {
    return localizationService.getSupportedLanguages();
  };

  return {
    currentLanguage,
    loading,
    error,
    changeLanguage,
    translate,
    formatDate,
    formatNumber,
    getSupportedLanguages,
    t: translate, // Shorthand alias
  };
}