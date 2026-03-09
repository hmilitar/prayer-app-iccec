// Prayers Screen - Browse and access prayer collections

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/Navigation';
import { Prayer } from '../types/Prayer';
import { Header } from '../components';
import { PrayerList } from '../components/prayers';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { AsyncStorageService } from '../services/StorageService';

type PrayersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrayerDetail'>;

export default function PrayersScreen() {
  const navigation = useNavigation<PrayersScreenNavigationProp>();
  const { t, currentLanguage } = useLocalization();
  const { prayers, loadPrayers, loading, error } = useData();
  const { settings } = useSettings();
  
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();

  // Stable singleton — prevents loadFavorites from being recreated every render
  const [storageService] = useState(() => new AsyncStorageService());

  // Track the latest language to detect stale async operations
  const latestLanguageRef = useRef(currentLanguage);
  latestLanguageRef.current = currentLanguage;

  const loadFavorites = useCallback(async () => {
    try {
      setLoadingFavorites(true);
      const favorites = await storageService.getFavoritePrayers();
      setFavoriteIds(favorites);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [storageService]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reload prayers for current language
      await loadPrayers(currentLanguage);
      
      // Reload favorites
      await loadFavorites();
    } catch (err) {
      console.error('Failed to refresh prayers data:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.refreshFailed') || 'Failed to refresh data. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  }, [currentLanguage, loadPrayers, loadFavorites, t]);

  // Handle tab focus - reload favorites; prayers are already managed by language effect
  useFocusEffect(
    useCallback(() => {
      // Only refresh favorites on focus—prayers are handled by the language effect below
      loadFavorites().catch(console.error);
    }, [loadFavorites])
  );

  // Load prayers when language changes — includes a stale-check to prevent
  // race conditions where an older async load overwrites a newer one
  useEffect(() => {
    let stale = false;

    const loadData = async () => {
      try {
        // Force reload so the skip-guard in useData is bypassed
        await loadPrayers(currentLanguage, true);

        // Stale-check: if the language changed while we were loading,
        // discard this result silently — the newer effect will handle it
        if (stale) return;

        await loadFavorites();
      } catch (err) {
        if (!stale) {
          console.error('PrayersScreen: Error loading data:', err);
        }
      }
    };
    
    loadData();

    return () => {
      // Mark this effect instance as stale so in-flight loads are discarded
      stale = true;
    };
  }, [currentLanguage, loadPrayers, loadFavorites]);

  const handlePrayerPress = useCallback((prayer: Prayer) => {
    // Navigate to prayer detail screen
    navigation.navigate('PrayerDetail', { prayerId: prayer.id });
  }, [navigation]);

  const handleFavoritePress = useCallback(async (prayerId: string) => {
    try {
      const isFavorite = favoriteIds.includes(prayerId);
      
      if (isFavorite) {
        // Remove from favorites
        await storageService.removeFavoritePrayer(prayerId);
        setFavoriteIds(prev => prev.filter(id => id !== prayerId));
      } else {
        // Add to favorites
        await storageService.addFavoritePrayer(prayerId);
        setFavoriteIds(prev => [...prev, prayerId]);
      }
      
      // Show feedback
      const message = isFavorite
        ? t('prayers.removedFromFavorites') || 'Removed from favorites'
        : t('prayers.addedToFavorites') || 'Added to favorites';
      
      // You could show a toast here instead of an alert for better UX
      console.log(message);
      
    } catch (err) {
      console.error('Failed to update favorites:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.updateFavorites') || 'Failed to update favorites. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
      
      // Revert local state on error
      await loadFavorites();
    }
  }, [favoriteIds, storageService, t, loadFavorites]);

  const getEmptyMessage = () => {
    if (loading) {
      return t('prayers.loading') || 'Loading prayers...';
    }
    
    if (error) {
      return t('prayers.loadError') || 'Failed to load prayers. Please try again.';
    }
    
    return t('prayers.noPrayers') || 'No prayers found. Try adjusting your search or filters.';
  };

  const styles = createStyles(theme);

  // Generate a unique key based on current settings for forced re-render
  const settingsKey = `prayers-${currentLanguage}-${theme.userFontSize}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={settingsKey}>
      <Header
        title={t('prayers.title') || 'Prayers'}
        subtitle={prayers.length > 0 ? `${prayers.length} ${t('prayers.available') || 'prayers'}` : undefined}
        
        variant="elevated"
      />
      
      <View style={styles.content}>
        <PrayerList
          prayers={prayers}
          onPrayerPress={handlePrayerPress}
          onFavoritePress={handleFavoritePress}
          favoriteIds={favoriteIds}
          loading={loading || loadingFavorites}
          emptyMessage={getEmptyMessage()}
          groupByCategory={false}
          searchable={true}
          filterable={true}
          compact={false}
          refreshing={refreshing}
          onRefresh={refreshData}
        />
      </View>
    </SafeAreaView>
  );
}

import type { Theme } from '../styles/theme';

const createStyles = (theme: Theme & { userFontSize: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
});
