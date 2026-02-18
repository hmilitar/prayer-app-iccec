// Localization Service - Multi-language support

import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { SupportedLanguage } from '../types/Prayer';
import { AsyncStorageService } from './StorageService';

// Import translation files
import enTranslations from '../data/translations/en.json';
import tlTranslations from '../data/translations/tl.json';
import etTranslations from '../data/translations/et.json';
import esTranslations from '../data/translations/es.json';
import itTranslations from '../data/translations/it.json';
import frTranslations from '../data/translations/fr.json';
import deTranslations from '../data/translations/de.json';
import plTranslations from '../data/translations/pl.json';

export interface LocalizationConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
}

export class LocalizationService {
  private static instance: LocalizationService;
  private config: LocalizationConfig;
  private i18n: I18n;
  private translations: Record<SupportedLanguage, any> = {
    en: {},
    tl: {},
    et: {},
    es: {},
    it: {},
    fr: {},
    de: {},
    pl: {}
  };

  private constructor() {
    this.config = {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'tl', 'et', 'es', 'it', 'fr', 'de', 'pl']
    };

    this.i18n = new I18n();
    this.setupI18n();
  }

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  private setupI18n(): void {
    // Set fallback language
    this.i18n.defaultLocale = this.config.fallbackLanguage;
    this.i18n.locale = this.detectDeviceLanguage();
    
    // Enable fallback
    this.i18n.enableFallback = true;
  }

  private detectDeviceLanguage(): SupportedLanguage {
    const deviceLocales = getLocales();
    
    for (const locale of deviceLocales) {
      const languageCode = locale.languageCode as SupportedLanguage;
      if (this.config.supportedLanguages.includes(languageCode)) {
        return languageCode;
      }
    }
    
    return this.config.defaultLanguage;
  }

  public async loadTranslations(): Promise<void> {
    try {
      // Load translation files from imported JSON
      this.translations = {
        en: enTranslations,
        tl: tlTranslations,
        et: etTranslations,
        es: esTranslations,
        it: itTranslations,
        fr: frTranslations,
        de: deTranslations,
        pl: plTranslations
      };

      this.i18n.translations = this.translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to empty translations if loading fails
      this.translations = {
        en: {},
        tl: {},
        et: {},
        es: {},
        it: {},
        fr: {},
        de: {},
        pl: {}
      };
      this.i18n.translations = this.translations;
    }
  }

  public translate(key: string, options?: Record<string, string | number>): string {
    return this.i18n.t(key, options);
  }

  public getCurrentLanguage(): SupportedLanguage {
    return this.i18n.locale as SupportedLanguage;
  }

  public async setLanguage(language: SupportedLanguage): Promise<void> {
    if (this.config.supportedLanguages.includes(language)) {
      this.i18n.locale = language;
      
      // Persist language preference to storage
      try {
        const storageService = new AsyncStorageService();
        const currentSettings = await storageService.getSettings();
        await storageService.saveSettings({
          ...currentSettings,
          language,
          metadata: {
            ...currentSettings.metadata,
            lastUpdated: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error persisting language preference:', error);
      }
    }
  }

  public getSupportedLanguages(): SupportedLanguage[] {
    return this.config.supportedLanguages;
  }

  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getCurrentLanguage();
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  public formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.getCurrentLanguage();
    return new Intl.NumberFormat(locale, options).format(number);
  }
}