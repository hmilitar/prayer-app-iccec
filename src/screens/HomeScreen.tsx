// Home Screen - Welcome users and provide quick access to daily content

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabParamList } from '../types/Navigation';
import { Header, TileCard } from '../components';
import { useLocalization } from '../hooks/useLocalization';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { getScaledFontSize } from '../utils/fontScaling';
import { formatDisplayDate, getLiturgicalSeason } from '../utils/dateUtils';

type HomeScreenNavigationProp = StackNavigationProp<TabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t, currentLanguage } = useLocalization();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();

  // Refresh data function
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Update current time
      setCurrentTime(new Date());
      
      // Add any other data refresh logic here
      // For example: reload user preferences, update recommendations, etc.
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle tab focus - refresh when tab is tapped
  useFocusEffect(
    useCallback(() => {
      // Update current time
      setCurrentTime(new Date());
    }, [])
  );

  // Ensure component re-renders when settings change
  useEffect(() => {
    // This effect will run whenever theme, currentLanguage, or settings change
    // forcing a re-render of the component when settings are updated
  }, [theme, currentLanguage, settings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      return t('greeting.morning') || 'Good Morning';
    } else if (hour < 17) {
      return t('greeting.afternoon') || 'Good Afternoon';
    } else {
      return t('greeting.evening') || 'Good Evening';
    }
  };

  const getTimeBasedPrayerRecommendation = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: t('prayers.morning') || 'Morning Prayers',
        subtitle: t('prayers.morningDetails.subtitle') || 'Start your day with prayer',
        icon: 'sunny-outline' as const,
        category: 'morning'
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: t('prayers.noon') || 'Midday Prayers',
        subtitle: t('prayers.noonDetails.subtitle') || 'Pause and reflect',
        icon: 'partly-sunny-outline' as const,
        category: 'noon'
      };
    } else {
      return {
        title: t('prayers.evening') || 'Evening Prayers',
        subtitle: t('prayers.eveningDetails.subtitle') || 'End your day in gratitude',
        icon: 'moon-outline' as const,
        category: 'evening'
      };
    }
  };

  const liturgicalSeason = getLiturgicalSeason(currentTime);
  const todayDate = formatDisplayDate(currentTime, currentLanguage);
  const recommendedPrayer = getTimeBasedPrayerRecommendation();

  const handlePrayerNavigation = (category: string) => {
    navigation.navigate('Prayers');
  };

  const handleDailyReadingsNavigation = () => {
    navigation.navigate('DailyReadings');
  };

  const handleDevotionNavigation = (timeOfDay: 'morning' | 'noon' | 'evening' | 'family' | string) => {
    // Cast to valid time value if it matches
    const validTime = (['morning', 'noon', 'evening', 'family'].includes(timeOfDay) 
      ? timeOfDay 
      : 'morning') as 'morning' | 'noon' | 'evening' | 'family';
    navigation.navigate('DailyReadings', { timeOfDay: validTime });
  };

  const styles = createStyles(theme);

  // Generate a unique key based on current settings for forced re-render
  const settingsKey = `${currentLanguage}-${settings?.fontSize}-${settings?.theme}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={settingsKey}>
      <Header
        title={t('app.name') || 'Prayer App - ICCEC Europe'}
        variant="transparent"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{todayDate}</Text>
          
          {/* Liturgical Season */}
          <View style={styles.liturgicalContainer}>
            <View style={styles.liturgicalBadge}>
              <Text style={styles.liturgicalText}>
                {t(`liturgical.${liturgicalSeason.toLowerCase()}`) || liturgicalSeason}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>
            {t('home.quickActions') || 'Quick Actions'}
          </Text>
          
          {/* Recommended Prayer */}
          <TileCard
            title={recommendedPrayer.title}
            subtitle={recommendedPrayer.subtitle}
            icon={recommendedPrayer.icon}
            onPress={() => handleDevotionNavigation(recommendedPrayer.category)}
            variant="primary"
            style={styles.recommendedTile}
          />

          {/* Daily Readings */}
          {/*
          <TileCard
            title={t('readings.daily') || 'Daily Readings'}
            subtitle={t('readings.dailyDetails.subtitle') || "Today's scripture and reflections"}
            icon="book-outline"
            onPress={handleDailyReadingsNavigation}
            style={styles.actionTile}
          />
          */}
        </View>

        {/* Prayer Times */}
        <View style={styles.prayerTimesSection}>
          <Text style={styles.sectionTitle}>
            {t('home.prayerTimes') || 'Daily Prayer Times'}
          </Text>
          
          <View style={styles.prayerTimesGrid}>
            <TileCard
              title={t('devotions.morning') || 'Morning'}
              subtitle={t('devotions.morningSubtitle') || 'Start your day'}
              icon="sunny-outline"
              onPress={() => handleDevotionNavigation('morning')}
              
              style={styles.prayerTimeTile}
            />
            
            <TileCard
              title={t('devotions.noon') || 'Midday'}
              subtitle={t('devotions.noonSubtitle') || 'Pause & reflect'}
              icon="partly-sunny-outline"
              onPress={() => handleDevotionNavigation('noon')}
              
              style={styles.prayerTimeTile}
            />
            
            <TileCard
              title={t('devotions.evening') || 'Evening'}
              subtitle={t('devotions.eveningSubtitle') || 'Close your day'}
              icon="moon-outline"
              onPress={() => handleDevotionNavigation('evening')}
              
              style={styles.prayerTimeTile}
            />
            
            <TileCard
              title={t('devotions.family') || 'Family'}
              subtitle={t('devotions.familySubtitle') || 'Pray together'}
              icon="people-outline"
              onPress={() => handleDevotionNavigation('family')}
              
              style={styles.prayerTimeTile}
            />
          </View>
        </View>

        {/* Additional Navigation */}
        <View style={styles.additionalSection}>
          <Text style={styles.sectionTitle}>
            {t('home.explore') || 'Explore'}
          </Text>
          
          <TileCard
            title={t('prayers.occasions') || 'Prayers for Occasions'}
            subtitle={t('prayers.occasionsDetails.subtitle') || 'For special moments'}
            icon="star-outline"
            onPress={() => handlePrayerNavigation('occasions')}
            variant="secondary"
            style={styles.actionTile}
          />
          
          <TileCard
            title={t('prayers.all') || 'All Prayers'}
            subtitle={t('prayers.allDetails.subtitle') || 'Browse prayer collections'}
            icon="library-outline"
            onPress={() => navigation.navigate('Prayers')}
            
            style={styles.actionTile}
          />
          
          <TileCard
            title={t('prayerJournal.title') || 'Prayer Journal'}
            subtitle={t('prayerJournal.comingSoon') || 'Coming Soon'}
            icon="journal-outline"
            onPress={() => {}}
            style={styles.actionTile}
          />
          
          <TileCard
            title={t('settings.title') || 'Settings'}
            subtitle={t('settings.subtitle') || 'Customize your experience'}
            icon="settings-outline"
            onPress={() => navigation.navigate('Settings')}
            
            style={styles.actionTile}
          />
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  welcomeSection: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: getScaledFontSize(theme.typography.fontSize['2xl'], theme.userFontSize),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base, theme.userFontSize),
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  liturgicalContainer: {
    alignItems: 'flex-start',
  },
  liturgicalBadge: {
    backgroundColor: `${theme.colors.primary[500]}15`,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  liturgicalText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  quickActionsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  prayerTimesSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  additionalSection: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  recommendedTile: {
    marginBottom: theme.spacing.md,
  },
  actionTile: {
    marginBottom: theme.spacing.sm,
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTimeTile: {
    width: '31%',
    minHeight: 100,
    marginBottom: theme.spacing.sm,
  },
});
