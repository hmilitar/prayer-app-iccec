// Daily Readings Screen - Display daily scripture readings and reflections

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabParamList } from '../types/Navigation';
import { DailyReading } from '../types/Reading';
import { Header, PrimaryButton } from '../components';
import { ReadingCard } from '../components/readings';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { getScaledFontSize } from '../utils/fontScaling';
import { 
  formatDisplayDate, 
  getTodayISO, 
  getNextDay, 
  getPreviousDay, 
  parseISODate,
  getLiturgicalSeason 
} from '../utils/dateUtils';

type DailyReadingsScreenNavigationProp = StackNavigationProp<TabParamList, 'DailyReadings'>;

export default function DailyReadingsScreen() {
  const { t, currentLanguage } = useLocalization();
  const { loadDailyReading } = useData();
  const { settings } = useSettings();
  
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [currentReading, setCurrentReading] = useState<DailyReading | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();
  const today = getTodayISO();

  // Generate unique key for forced re-renders when settings change
  const settingsKey = `${currentLanguage}-${settings?.fontSize || 'medium'}-${settings?.theme || 'light'}`;

  const loadReadingForDate = useCallback(async (dateString: string) => {
    setLoadingReading(true);
    try {
      const reading = await loadDailyReading(dateString, currentLanguage);
      if (reading) {
        setCurrentReading(reading);
      } else {
        // No content for this date
        setCurrentReading(null);
      }
    } catch (err) {
      console.warn('Warning loading reading for', dateString, ':', err);
      setCurrentReading(null);
    } finally {
      setLoadingReading(false);
    }
  }, [loadDailyReading, currentLanguage]);

  // Removed fallback search; show message if not available on selected date

  // Refresh data function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReadingForDate(selectedDate);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, loadReadingForDate]);

  // Removed useFocusEffect to prevent re-run loops tied to loading state changes

  // Load reading when selected date or language changes
  useEffect(() => {
    loadReadingForDate(selectedDate).catch(() => setCurrentReading(null));
  }, [selectedDate, currentLanguage]); // Removed loadReadingForDate from dependencies to prevent loop

  const navigateToDate = (direction: 'next' | 'previous') => {
    const currentDateObj = parseISODate(selectedDate);
    const newDate = direction === 'next' 
      ? getNextDay(currentDateObj) 
      : getPreviousDay(currentDateObj);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const navigateToToday = useCallback(() => {
    const todayDate = getTodayISO();
    setSelectedDate(todayDate);
    // Loading is handled by the useEffect tied to selectedDate/currentLanguage
  }, []);

  const handleReadingPress = (reading: DailyReading) => {
    // Handle reading press - could navigate to detail view
    console.log('Reading pressed:', reading.id);
  };

  const selectedDateObj = parseISODate(selectedDate);
  const isToday = selectedDate === today;
  const displayDate = formatDisplayDate(selectedDateObj, currentLanguage);
  const liturgicalSeason = getLiturgicalSeason(selectedDateObj);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={settingsKey}>
      <Header 
        title={t('dailyReadings')}
        variant="elevated"
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
            title={t('common.pullToRefresh') || 'Pull to refresh'}
            titleColor={theme.colors.text.secondary}
          />
        }
      >
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <PrimaryButton
            title="←"
            onPress={() => navigateToDate('previous')}
            variant="ghost"
            size="small"
          />
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              {displayDate}
            </Text>
            {!!liturgicalSeason && (
              <Text style={styles.seasonText}>
                {t(liturgicalSeason)}
              </Text>
            )}
          </View>
          
          <PrimaryButton
            title="→"
            onPress={() => navigateToDate('next')}
            variant="ghost"
            size="small"
          />
        </View>

        {/* Today/Latest Button */}
        {!isToday && (
          <PrimaryButton
            title={t('goToToday')}
            onPress={navigateToToday}
            variant="outline"
            size="small"
            style={styles.todayButton}
          />
        )}

        {/* Reading Content */}
        {loadingReading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>
              {t('loadingReading')}
            </Text>
          </View>
        )}
        
        {!loadingReading && currentReading && (
          <ReadingCard 
            reading={currentReading} 
            onPress={handleReadingPress}
            showDate={false}
          />
        )}
        
        {!loadingReading && !currentReading && (
          <View style={styles.noReadingContainer}>
            <Text style={styles.noReadingText}>
              {t('noReadingAvailable')}
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: theme.spacing.md,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  dateText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  seasonText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontStyle: 'italic',
    color: theme.colors.primary[500],
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  todayButton: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  noReadingContainer: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  noReadingText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
