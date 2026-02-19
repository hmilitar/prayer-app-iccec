// Custom hook for data management

import { useState, useEffect, useCallback, useRef } from 'react';
import { Prayer, SupportedLanguage } from '../types/Prayer';
import { DailyReading } from '../types/Reading';
import { DailyDevotion, DevotionDay } from '../types/Devotion';
import { DataService, LocalDataSource } from '../services/DataService';

export function useData() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [devotions, setDevotions] = useState<DevotionDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref for lastLoadedLanguage so the loadPrayers callback always
  // sees the current value — avoids stale-closure caching bugs that
  // caused prayers to "stick" when switching languages back and forth.
  const lastLoadedLanguageRef = useRef<SupportedLanguage | null>(null);
  const prayersCountRef = useRef(0);

  // Use useMemo to create dataService only once
  const [dataService] = useState(() => new DataService(new LocalDataSource()));

  const loadPrayers = useCallback(async (language: SupportedLanguage, forceReload: boolean = false) => {
    // Refs are always current — no stale closure issues
    const lastLoaded = lastLoadedLanguageRef.current;
    const languageChanged = lastLoaded !== null && lastLoaded !== language;
    const shouldReload = forceReload || languageChanged || prayersCountRef.current === 0;
    
    if (!shouldReload) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if language changed
      if (languageChanged) {
        console.log('useData: Language changed, clearing cache and reloading');
        setPrayers([]);
        setDevotions([]);
      }
      
      const prayerData = await dataService.getPrayers(language);
      console.log('useData: loadPrayers setting prayers:', prayerData.length, 'for language:', language);
      setPrayers(prayerData);
      prayersCountRef.current = prayerData.length;
      lastLoadedLanguageRef.current = language;
    } catch (err) {
      console.error('useData: loadPrayers error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prayers');
      setPrayers([]);
      prayersCountRef.current = 0;
    } finally {
      setLoading(false);
    }
  }, [dataService]);

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
  }, [prayers]);

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
  }, [readings]);

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
  }, []);

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

  const loadDailyDevotions = useCallback(async (date: string, language: SupportedLanguage): Promise<DevotionDay | null> => {
    try {
      setError(null);
      
      // First try to find in already loaded devotions
      const existingDevotion = devotions.find(d => d.date === date);
      if (existingDevotion) {
        return existingDevotion;
      }
      
      // If not found, load from data service
      return await dataService.getDailyDevotions(date, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily devotions');
      return null;
    }
  }, [devotions]);

  const loadDevotionByTimeOfDay = useCallback(async (date: string, timeOfDay: string, language: SupportedLanguage): Promise<DailyDevotion | null> => {
    try {
      setError(null);
      return await dataService.getDevotionsByTimeOfDay(date, timeOfDay, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devotion');
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    setPrayers([]);
    setReadings([]);
    setDevotions([]);
    lastLoadedLanguageRef.current = null;
    prayersCountRef.current = 0;
    setError(null);
  }, []);

  const refreshData = useCallback(async (language: SupportedLanguage) => {
    await loadPrayers(language, true);
  }, [loadPrayers]);

  return {
    prayers,
    readings,
    devotions,
    loading,
    error,
    loadPrayers,
    loadPrayerById,
    loadDailyReading,
    loadReadingsRange,
    loadDailyDevotions,
    loadDevotionByTimeOfDay,
    searchPrayers,
    getPrayersByCategory,
    clearCache,
    refreshData,
    isDataLoaded: prayers.length > 0 || readings.length > 0 || devotions.length > 0,
    lastLoadedLanguage: lastLoadedLanguageRef.current,
  };
}