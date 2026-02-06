// Daily Readings Screen - Display daily scripture readings and reflections

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabParamList } from '../types/Navigation';
import { DailyReading, getBibleGatewayUrl } from '../types/Reading';
import { Header, PrimaryButton } from '../components';
import { ReadingCard, CalendarView } from '../components/readings';
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
  getLiturgicalSeason,
  getLiturgicalColor,
  formatDateToISO
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
  const [viewMode, setViewMode] = useState<'daily' | 'calendar'>('calendar'); // Default to calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
  const navigateMonth = (direction: 'next' | 'previous') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelectFromCalendar = (dateISO: string) => {
    setSelectedDate(dateISO);
    setViewMode('daily'); // Switch to daily view when date is selected
  };

  const openBibleLink = (reference: string) => {
    const url = getBibleGatewayUrl(reference);
    Linking.openURL(url).catch(err => console.error('Failed to open Bible link:', err));
  };

  const isToday = selectedDate === today;
  const displayDate = formatDisplayDate(selectedDateObj, currentLanguage);
  const liturgicalSeason = getLiturgicalSeason(selectedDateObj);
  const liturgicalColor = getLiturgicalColor(selectedDateObj);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={settingsKey}>
      <Header 
        title={t('dailyReadings')}
        variant="elevated"
      />

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendar')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={viewMode === 'calendar' ? '#FFFFFF' : theme.colors.text.secondary} 
          />
          <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
            {t('calendar') || 'Calendar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'daily' && styles.toggleButtonActive]}
          onPress={() => setViewMode('daily')}
        >
          <Ionicons 
            name="book-outline" 
            size={20} 
            color={viewMode === 'daily' ? '#FFFFFF' : theme.colors.text.secondary} 
          />
          <Text style={[styles.toggleText, viewMode === 'daily' && styles.toggleTextActive]}>
            {t('daily') || 'Daily'}
          </Text>
        </TouchableOpacity>
      </View>
      
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
        {viewMode === 'calendar' ? (
          <>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <PrimaryButton
                title="←"
                onPress={() => navigateMonth('previous')}
                variant="ghost"
                size="small"
              />
              <Text style={styles.monthText}>
                {currentMonth.toLocaleDateString(currentLanguage, { month: 'long', year: 'numeric' })}
              </Text>
              <PrimaryButton
                title="→"
                onPress={() => navigateMonth('next')}
                variant="ghost"
                size="small"
              />
            </View>

            {/* Calendar View */}
            <CalendarView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelectFromCalendar}
              availableDates={[]} // TODO: Load available dates from data
            />
          </>
        ) : (
          <>
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
                  <View style={styles.seasonContainer}>
                    <View 
                      style={[styles.seasonDot, { backgroundColor: liturgicalColor }]} 
                    />
                    <Text style={styles.seasonText}>
                      {t(liturgicalSeason)}
                    </Text>
                  </View>
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
              <>
                <ReadingCard 
                  reading={currentReading} 
                  onPress={handleReadingPress}
                  showDate={false}
                />

                {/* Bible Links */}
                {currentReading.readings.length > 0 && (
                  <View style={styles.bibleLinksContainer}>
                    <Text style={styles.bibleLinksTitle}>
                      {t('readOnline') || 'Read Online'}
                    </Text>
                    {currentReading.readings.map((reading) => (
                      <TouchableOpacity
                        key={reading.id}
                        style={styles.bibleLink}
                        onPress={() => openBibleLink(reading.reference)}
                      >
                        <Ionicons name="book-outline" size={20} color={theme.colors.primary[500]} />
                        <Text style={styles.bibleLinkText}>{reading.reference}</Text>
                        <Ionicons name="open-outline" size={16} color={theme.colors.text.secondary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
            
            {!loadingReading && !currentReading && (
              <View style={styles.noReadingContainer}>
                <Text style={styles.noReadingText}>
                  {t('noReadingAvailable')}
                </Text>
              </View>
            )}
          </>
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  toggleText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  monthText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
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
  seasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  seasonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seasonText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontStyle: 'italic',
    color: theme.colors.primary[500],
    textAlign: 'center',
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
  bibleLinksContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  bibleLinksTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  bibleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  bibleLinkText: {
    flex: 1,
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    color: theme.colors.primary[500],
    fontWeight: '500',
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
