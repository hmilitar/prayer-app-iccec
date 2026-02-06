// Data Service - Business logic & data access abstraction

import { Prayer, SupportedLanguage } from '../types/Prayer';
import { DailyReading, Reading, ReadingType } from '../types/Reading';
import { DailyDevotion, DevotionDay } from '../types/Devotion';
import { getMappedPrayerId, getAllEquivalentPrayerIds } from '../utils/prayerMapping';

// Import local data files
import enPrayers from '../data/prayers/en.json';
import tlPrayers from '../data/prayers/tl.json';
import etPrayers from '../data/prayers/et.json';
import esPrayers from '../data/prayers/es.json';
import itPrayers from '../data/prayers/it.json';
import frPrayers from '../data/prayers/fr.json';
import dePrayers from '../data/prayers/de.json';
import plPrayers from '../data/prayers/pl.json';
import enReadings from '../data/readings/en_new.json';
import tlReadings from '../data/readings/tl_new.json';
import etReadings from '../data/readings/et_new.json';
import esReadings from '../data/readings/es.json';
import itReadings from '../data/readings/it.json';
import enDevotions from '../data/devotions/en.json';
import tlDevotions from '../data/devotions/tl.json';
import etDevotions from '../data/devotions/et.json';
import esDevotions from '../data/devotions/es.json';
import itDevotions from '../data/devotions/it.json';
import frDevotions from '../data/devotions/fr.json';
import deDevotions from '../data/devotions/de.json';
import plDevotions from '../data/devotions/pl.json';

// Data source interface for future API integration
export interface DataSource {
  getPrayers(language: SupportedLanguage): Promise<Prayer[]>;
  getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer>;
  getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading>;
  getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]>;
  getDailyDevotions(date: string, language: SupportedLanguage): Promise<DevotionDay | null>;
  getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null>;
  getAvailableReadingDates(language: SupportedLanguage): Promise<string[]>;
}

// Local JSON data source implementation
export class LocalDataSource implements DataSource {
  private readonly prayerData: Record<SupportedLanguage, Prayer[]> = {
    en: (enPrayers as any).prayers || [],
    tl: (tlPrayers as any).prayers || [],
    et: (etPrayers as any).prayers || [],
    es: (esPrayers as any).prayers || [],
    it: (itPrayers as any).prayers || [],
    fr: (frPrayers as any).prayers || [],
    de: (dePrayers as any).prayers || [],
    pl: (plPrayers as any).prayers || []
  };

  private readonly readingData: Record<SupportedLanguage, DailyReading[]> = {
    en: (enReadings as any).readings || [],
    tl: (tlReadings as any).readings || [],
    et: (etReadings as any).readings || [],
    es: (esReadings as any).readings || [],
    it: (itReadings as any).readings || [],
    fr: [],
    de: [],
    pl: []
  };

  private readonly devotionData: Record<string, DailyDevotion[]> = {
    en: (enDevotions as any).devotions || [],
    tl: (tlDevotions as any).devotions || [],
    et: (etDevotions as any).devotions || [],
    es: (esDevotions as any).devotions || [],
    it: (itDevotions as any).devotions || [],
    fr: (frDevotions as any).devotions || [],
    de: (deDevotions as any).devotions || [],
    pl: (plDevotions as any).devotions || []
  };

  constructor() {
    console.log('LocalDataSource initialized with prayers:', Object.keys(this.prayerData).map(lang => `${lang}: ${(this.prayerData as any)[lang].length}`));
    console.log('LocalDataSource initialized with readings:', Object.keys(this.readingData).map(lang => `${lang}: ${(this.readingData as any)[lang].length}`));
    console.log('LocalDataSource initialized with devotions:', Object.keys(this.devotionData).map(lang => `${lang}: ${(this.devotionData as any)[lang].length}`));
  }

  async getPrayers(language: SupportedLanguage): Promise<Prayer[]> {
    try {
      const result = this.prayerData[language] || [];
      console.log(`getPrayers(${language}): returning ${result.length} prayers`);
      return result;
    } catch (error) {
      console.error('Error loading prayers:', error);
      return [];
    }
  }

  async getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer> {
    try {
      const prayers = this.prayerData[language] || [];
      
      // First try to find with the exact ID
      let prayer = prayers.find(p => p.id === id);
      
      // If not found, try to find using the mapped ID for the target language
      if (!prayer) {
        const mappedId = getMappedPrayerId(id, language);
        prayer = prayers.find(p => p.id === mappedId);
      }
      
      // If still not found, try to find any equivalent prayer
      if (!prayer) {
        const equivalentIds = getAllEquivalentPrayerIds(id);
        for (const equivalentId of equivalentIds) {
          prayer = prayers.find(p => p.id === equivalentId);
          if (prayer) break;
        }
      }
      
      if (!prayer) {
        throw new Error(`Prayer with id ${id} not found for language ${language}`);
      }
      return prayer;
    } catch (error) {
      console.error('Error loading prayer by id:', error);
      throw error;
    }
  }

  async getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading> {
    try {
      const readings = this.readingData[language] || [];
      console.log(`getDailyReadings(${date}, ${language}): found ${readings.length} total readings`);
      const raw = readings.find((r: any) => r.date === date);
      console.log(`getDailyReadings(${date}, ${language}): found reading:`, !!raw);
      if (!raw) {
        throw new Error(`Reading for date ${date} not found`);
      }
      return this.normalizeDailyReading(raw, language);
    } catch (error) {
      // Expected in some flows (e.g., fallback from missing dates); log as warning
      console.warn('Warning loading daily readings:', error);
      throw error;
    }
  }

  async getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]> {
    try {
      const readings = this.readingData[language] || [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return readings
        .filter((reading: any) => {
          const readingDate = new Date(reading.date);
          return readingDate >= start && readingDate <= end;
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((raw: any) => this.normalizeDailyReading(raw, language));
    } catch (error) {
      console.error('Error loading readings range:', error);
      return [];
    }
  }

  // Normalize raw JSON reading (from *_new.json) to DailyReading shape expected by UI
  private normalizeDailyReading(raw: any, languageFallback: SupportedLanguage): DailyReading {
    const date: string = raw.date ?? raw.id;
    const language: SupportedLanguage = (raw.language as SupportedLanguage) || languageFallback;
    const season: string | undefined = raw.season;

    const nowIso = new Date().toISOString();

    const readingsArray: Reading[] = [];
    const parts = raw.readings || {};

    if (parts.first) {
      readingsArray.push({
        id: `${date}-first`,
        type: ReadingType.OLD_TESTAMENT,
        reference: parts.first.reference || '',
        text: parts.first.text || '',
        title: parts.first.title || undefined,
      });
    }
    if (parts.psalm) {
      readingsArray.push({
        id: `${date}-psalm`,
        type: ReadingType.PSALM,
        reference: parts.psalm.reference || '',
        text: parts.psalm.text || '',
        title: parts.psalm.title || undefined,
      });
    }
    if (parts.second) {
      readingsArray.push({
        id: `${date}-second`,
        type: ReadingType.NEW_TESTAMENT,
        reference: parts.second.reference || '',
        text: parts.second.text || '',
        title: parts.second.title || undefined,
      });
    }
    if (parts.gospel) {
      readingsArray.push({
        id: `${date}-gospel`,
        type: ReadingType.GOSPEL,
        reference: parts.gospel.reference || '',
        text: parts.gospel.text || '',
        title: parts.gospel.title || undefined,
      });
    }

    const metadata = {
      liturgicalSeason: season, // e.g., 'ordinary_time', 'feast', 'solemnity'
      feast: season === 'feast' || season === 'solemnity' ? raw.title : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const normalized: DailyReading = {
      id: raw.id || date,
      date,
      title: raw.title || '',
      readings: readingsArray,
      reflection: raw.reflection || undefined,
      language,
      metadata,
    };

    return normalized;
  }

  async getDailyDevotions(date: string, language: SupportedLanguage): Promise<DevotionDay | null> {
    try {
      const devotions = this.devotionData[language] || [];
      const dayDevotions = devotions.filter((d: DailyDevotion) => d.date === date);
      
      if (dayDevotions.length === 0) {
        return null;
      }

      const devotionDay: DevotionDay = {
        date,
        morning: dayDevotions.find(d => d.timeOfDay === 'morning'),
        noon: dayDevotions.find(d => d.timeOfDay === 'noon'),
        evening: dayDevotions.find(d => d.timeOfDay === 'evening'),
        family: dayDevotions.find(d => d.timeOfDay === 'family'),
      };

      return devotionDay;
    } catch (error) {
      console.error('Error loading daily devotions:', error);
      return null;
    }
  }

  async getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null> {
    try {
      const devotions = this.devotionData[language] || [];
      const devotion = devotions.find((d: DailyDevotion) => d.date === date && d.timeOfDay === timeOfDay);
      return devotion || null;
    } catch (error) {
      console.error('Error loading devotion by time of day:', error);
      return null;
    }
  }

  async getAvailableReadingDates(language: SupportedLanguage): Promise<string[]> {
    try {
      const devotions = this.devotionData[language] || [];
      const uniqueDates = new Set<string>();
      devotions.forEach(devotion => {
        uniqueDates.add(devotion.date);
      });
      return Array.from(uniqueDates);
    } catch (error) {
      console.error('Error loading available reading dates:', error);
      return [];
    }
  }
}

// Future API data source implementation
export class RemoteDataSource implements DataSource {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async getPrayers(language: SupportedLanguage): Promise<Prayer[]> {
    // Remote data source is not implemented; returning empty list for now.
    return [];
  }

  async getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer> {
    // Remote data source is not implemented; indicate not found.
    throw new Error('Prayer not found');
  }

  async getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading> {
    // Remote data source is not implemented; indicate not found.
    throw new Error('Reading not found');
  }

  async getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]> {
    // Remote data source is not implemented; returning empty list for now.
    return [];
  }

  async getDailyDevotions(date: string, language: SupportedLanguage): Promise<DevotionDay | null> {
    // Remote data source is not implemented; returning null for now.
    return null;
  }

  async getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null> {
    // Remote data source is not implemented; returning null for now.
    return null;
  }

  async getAvailableReadingDates(language: SupportedLanguage): Promise<string[]> {
    // Remote data source is not implemented; returning empty list for now.
    return [];
  }
}

// Main data service with unified interface
export class DataService {
  private readonly dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async getPrayers(language: SupportedLanguage): Promise<Prayer[]> {
    return this.dataSource.getPrayers(language);
  }

  async getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer> {
    return this.dataSource.getPrayerById(id, language);
  }

  async getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading> {
    return this.dataSource.getDailyReadings(date, language);
  }

  async getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]> {
    return this.dataSource.getReadingsRange(startDate, endDate, language);
  }

  async getDailyDevotions(date: string, language: SupportedLanguage): Promise<DevotionDay | null> {
    return this.dataSource.getDailyDevotions(date, language);
  }

  async getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null> {
    return this.dataSource.getDevotionsByTimeOfDay(date, timeOfDay, language);
  }

  async getAvailableReadingDates(language: SupportedLanguage): Promise<string[]> {
    return this.dataSource.getAvailableReadingDates(language);
  }
}