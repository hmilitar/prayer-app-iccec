// Custom hook for data management

import { useState, useEffect, useCallback } from 'react';
import { Prayer, SupportedLanguage } from '../types/Prayer';
import { DailyReading } from '../types/Reading';
import { DataService, LocalDataSource } from '../services/DataService';

export function useData() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedLanguage, setLastLoadedLanguage] = useState<SupportedLanguage | null>(null);

  const dataService = new DataService(new LocalDataSource());

  const loadPrayers = useCallback(async (language: SupportedLanguage, forceReload: boolean = false) => {
    // Skip loading if same language and not forcing reload and we have data
    if (!forceReload && lastLoadedLanguage === language && prayers.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const prayerData = await dataService.getPrayers(language);
      console.log('useData: loadPrayers setting prayers:', prayerData.length);
      setPrayers(prayerData);
      setLastLoadedLanguage(language);
    } catch (err) {
      console.error('useData: loadPrayers error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prayers');
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  }, [lastLoadedLanguage, prayers.length, dataService]);

  const loadPrayerById = useCallback(async (id: string, language: SupportedLanguage): Promise<Prayer | null> => {
    try {
      setError(null);
      
      // First try to find in already loaded prayers
      const existingPrayer = prayers.find(p => p.id === id && p.language === language);
      if (existingPrayer) {
        return existingPrayer;
      }
      
      // If not found, load from data service
      return await dataService.getPrayerById(id, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prayer');
      return null;
    }
  }, [prayers, dataService]);

  const loadDailyReading = useCallback(async (date: string, language: SupportedLanguage): Promise<DailyReading | null> => {
    try {
      setError(null);
      
      // First try to find in already loaded readings
      const existingReading = readings.find(r => r.date === date && r.language === language);
      if (existingReading) {
        return existingReading;
      }
      
      // If not found, load from data service
      return await dataService.getDailyReadings(date, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily reading');
      return null;
    }
  }, [readings, dataService]);

  const loadReadingsRange = useCallback(async (startDate: string, endDate: string, language: SupportedLanguage) => {
    try {
      setLoading(true);
      setError(null);
      const readingData = await dataService.getReadingsRange(startDate, endDate, language);
      setReadings(readingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load readings');
      setReadings([]);
    } finally {
      setLoading(false);
    }
  }, [dataService]);

  const searchPrayers = useCallback((searchTerm: string, category?: string): Prayer[] => {
    if (!prayers.length) return [];
    
    return prayers.filter(prayer => {
      const matchesSearch = !searchTerm ||
        prayer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prayer.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prayer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !category || prayer.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, [prayers]);

  const getPrayersByCategory = useCallback((category: string): Prayer[] => {
    return prayers.filter(prayer => prayer.category === category);
  }, [prayers]);

  const clearCache = useCallback(() => {
    setPrayers([]);
    setReadings([]);
    setLastLoadedLanguage(null);
    setError(null);
  }, []);

  const refreshData = useCallback(async (language: SupportedLanguage) => {
    await loadPrayers(language, true);
  }, [loadPrayers]);

  return {
    prayers,
    readings,
    loading,
    error,
    loadPrayers,
    loadPrayerById,
    loadDailyReading,
    loadReadingsRange,
    searchPrayers,
    getPrayersByCategory,
    clearCache,
    refreshData,
    isDataLoaded: prayers.length > 0 || readings.length > 0,
    lastLoadedLanguage,
  };
}