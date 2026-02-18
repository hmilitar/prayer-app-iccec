// Data Service - Business logic & data access abstraction

declare const __DEV__: boolean | undefined;

import { Prayer, SupportedLanguage } from '../types/Prayer';
import { DailyReading, Reading, ReadingType } from '../types/Reading';
import { DailyDevotion, DevotionDay, DevotionTimeOfDay } from '../types/Devotion';
import { getMappedPrayerId, getAllEquivalentPrayerIds } from '../utils/prayerMapping';
import { buildDevotion, buildDevotionDay } from '../data/devotions/devotionBuilder';

/** Shape of the imported prayer JSON modules */
interface PrayerJsonModule {
  readonly prayers?: Prayer[];
}

/** Shape of a single raw reading entry from JSON */
interface RawReadingEntry {
  readonly id?: string;
  readonly date?: string;
  readonly title?: string;
  readonly season?: string;
  readonly language?: string;
  readonly reflection?: string;
  readonly readings?: {
    readonly first?: { readonly reference?: string; readonly text?: string; readonly title?: string };
    readonly psalm?: { readonly reference?: string; readonly text?: string; readonly title?: string };
    readonly second?: { readonly reference?: string; readonly text?: string; readonly title?: string };
    readonly gospel?: { readonly reference?: string; readonly text?: string; readonly title?: string };
  };
}

/** Shape of the imported reading JSON modules */
interface ReadingJsonModule {
  readonly readings?: RawReadingEntry[];
}

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

// Data source interface for future API integration
export interface DataSource {
  getPrayers(language: SupportedLanguage): Promise<Prayer[]>;
  getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer>;
  getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading>;
  getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]>;
  getDailyDevotions(date: string, language: SupportedLanguage): Promise<DevotionDay | null>;
  getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null>;
}

// Local JSON data source implementation
export class LocalDataSource implements DataSource {
  private readonly prayerData: Record<SupportedLanguage, Prayer[]>;
  private readonly readingData: Record<SupportedLanguage, RawReadingEntry[]>;

  constructor() {
    /** Safely extract the prayers array from a JSON module. */
    const extractPrayers = (mod: PrayerJsonModule): Prayer[] =>
      Array.isArray(mod?.prayers) ? mod.prayers : [];

    /** Safely extract the readings array from a JSON module. */
    const extractReadings = (mod: ReadingJsonModule): RawReadingEntry[] =>
      Array.isArray(mod?.readings) ? mod.readings : [];

    this.prayerData = {
      en: extractPrayers(enPrayers as PrayerJsonModule),
      tl: extractPrayers(tlPrayers as PrayerJsonModule),
      et: extractPrayers(etPrayers as PrayerJsonModule),
      es: extractPrayers(esPrayers as PrayerJsonModule),
      it: extractPrayers(itPrayers as PrayerJsonModule),
      fr: extractPrayers(frPrayers as PrayerJsonModule),
      de: extractPrayers(dePrayers as PrayerJsonModule),
      pl: extractPrayers(plPrayers as PrayerJsonModule),
    };

    this.readingData = {
      en: extractReadings(enReadings as ReadingJsonModule),
      tl: extractReadings(tlReadings as ReadingJsonModule),
      et: extractReadings(etReadings as ReadingJsonModule),
      es: extractReadings(esReadings as ReadingJsonModule),
      it: extractReadings(itReadings as ReadingJsonModule),
      fr: [],
      de: [],
      pl: [],
    };

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        'LocalDataSource initialized with prayers:',
        (Object.keys(this.prayerData) as SupportedLanguage[]).map(lang => `${lang}: ${this.prayerData[lang].length}`),
      );
      console.log(
        'LocalDataSource initialized with readings:',
        (Object.keys(this.readingData) as SupportedLanguage[]).map(lang => `${lang}: ${this.readingData[lang].length}`),
      );
    }
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
      const raw = readings.find(r => r.date === date);
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
        .filter(reading => {
          const readingDate = new Date(reading.date ?? '');
          return readingDate >= start && readingDate <= end;
        })
        .sort((a, b) => new Date(a.date ?? '').getTime() - new Date(b.date ?? '').getTime())
        .map(raw => this.normalizeDailyReading(raw, language));
    } catch (error) {
      console.error('Error loading readings range:', error);
      return [];
    }
  }

  /** Normalize raw JSON reading (from *_new.json) to DailyReading shape expected by UI */
  private normalizeDailyReading(raw: RawReadingEntry, languageFallback: SupportedLanguage): DailyReading {
    const date: string = raw.date ?? raw.id ?? '';
    const language: SupportedLanguage = (raw.language as SupportedLanguage | undefined) ?? languageFallback;
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
      return buildDevotionDay(date, language);
    } catch (error) {
      console.error('Error loading daily devotions:', error);
      return null;
    }
  }

  async getDevotionsByTimeOfDay(date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null> {
    try {
      const validTimeOfDay = timeOfDay as DevotionTimeOfDay;
      return buildDevotion(date, validTimeOfDay, language);
    } catch (error) {
      console.error('Error loading devotion by time of day:', error);
      return null;
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
}