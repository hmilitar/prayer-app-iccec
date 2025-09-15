// Data Service - Business logic & data access abstraction

import { Prayer, SupportedLanguage } from '../types/Prayer';
import { DailyReading, Reading, ReadingType } from '../types/Reading';
import { getMappedPrayerId, getAllEquivalentPrayerIds } from '../utils/prayerMapping';

// Import local data files
import enPrayers from '../data/prayers/en.json';
import tlPrayers from '../data/prayers/tl.json';
import etPrayers from '../data/prayers/et.json';
import enReadings from '../data/readings/en_new.json';
import tlReadings from '../data/readings/tl_new.json';
import etReadings from '../data/readings/et_new.json';

// Data source interface for future API integration
export interface DataSource {
  getPrayers(language: SupportedLanguage): Promise<Prayer[]>;
  getPrayerById(id: string, language: SupportedLanguage): Promise<Prayer>;
  getDailyReadings(date: string, language: SupportedLanguage): Promise<DailyReading>;
  getReadingsRange(startDate: string, endDate: string, language: SupportedLanguage): Promise<DailyReading[]>;
}

// Local JSON data source implementation
export class LocalDataSource implements DataSource {
  private readonly prayerData: Record<SupportedLanguage, Prayer[]> = {
    en: (enPrayers as any).prayers || [],
    tl: (tlPrayers as any).prayers || [],
    et: (etPrayers as any).prayers || []
  };

  private readonly readingData: Record<SupportedLanguage, DailyReading[]> = {
    en: (enReadings as any).readings || [],
    tl: (tlReadings as any).readings || [],
    et: (etReadings as any).readings || []
  };

  constructor() {
    console.log('LocalDataSource initialized with prayers:', Object.keys(this.prayerData).map(lang => `${lang}: ${(this.prayerData as any)[lang].length}`));
    console.log('LocalDataSource initialized with readings:', Object.keys(this.readingData).map(lang => `${lang}: ${(this.readingData as any)[lang].length}`));
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
}