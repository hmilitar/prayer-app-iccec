// Prayer Detail Screen - Full prayer view with actions

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/Navigation';
import { Prayer } from '../types/Prayer';
import { useLocalization } from '../hooks/useLocalization';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import { AsyncStorageService } from '../services/StorageService';
import { getScaledFontSize } from '../utils/fontScaling';
import { 
  getSpacing, 
  getBorderRadius, 
  getHeaderHeight
} from '../utils/responsive';

type PrayerDetailRouteProp = RouteProp<RootStackParamList, 'PrayerDetail'>;
type PrayerDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PrayerDetail'>;

export default function PrayerDetailScreen() {
  const navigation = useNavigation<PrayerDetailNavigationProp>();
  const route = useRoute<PrayerDetailRouteProp>();
  const { prayerId } = route.params;
  
  const { t, currentLanguage } = useLocalization();
  const { settings } = useSettings();
  const { loadPrayerById } = useData();
  
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const theme = useTheme();
  const storageService = new AsyncStorageService();

  const loadPrayerData = useCallback(async () => {
    if (!initialLoad && loading) return; // Prevent unnecessary loads
    
    try {
      setLoading(true);
      
      console.log(`Loading prayer with ID: ${prayerId}, language: ${currentLanguage}`);
      
      // Load prayer by ID using the data service (now with mapping support)
      const foundPrayer = await loadPrayerById(prayerId, currentLanguage);
      if (foundPrayer) {
        console.log(`Prayer found: ${foundPrayer.title} (ID: ${foundPrayer.id})`);
        setPrayer(foundPrayer);
        
        // Check if prayer is in favorites using the found prayer's actual ID
        const favorites = await storageService.getFavoritePrayers();
        const isInFavorites = favorites.includes(foundPrayer.id);
        setIsFavorite(isInFavorites);
        console.log(`Prayer favorite status: ${isInFavorites}`);
      } else {
        console.log(`Prayer not found for ID: ${prayerId}, language: ${currentLanguage}`);
        // Prayer not found
        Alert.alert(
          t('error.title') || 'Error',
          t('prayers.notFound') || 'Prayer not found.',
          [
            {
              text: t('common.ok') || 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Failed to load prayer:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.loadPrayer') || 'Failed to load prayer. Please try again.',
        [
          {
            text: t('common.ok') || 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
      
      // Fade in content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [prayerId, currentLanguage, loadPrayerById, storageService, t, navigation, initialLoad, loading]);

  // Load prayer data and favorite status - only on mount or when prayer ID changes
  useEffect(() => {
    if (initialLoad) {
      loadPrayerData();
    }
  }, [prayerId]); // Only depend on prayerId to prevent unnecessary loads

  const handleFavoriteToggle = useCallback(async () => {
    if (!prayer) return;

    try {
      if (isFavorite) {
        await storageService.removeFavoritePrayer(prayer.id);
        setIsFavorite(false);
      } else {
        await storageService.addFavoritePrayer(prayer.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.updateFavorites') || 'Failed to update favorites. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  }, [prayer, isFavorite, storageService, t]);

  const handleShare = useCallback(() => {
    if (!prayer) return;
    
    // For now, just show an alert. In the future, this could integrate with native sharing
    Alert.alert(
      t('prayers.share') || 'Share Prayer',
      t('prayers.shareMessage') || 'Sharing functionality coming soon.',
      [{ text: t('common.ok') || 'OK' }]
    );
  }, [prayer, t]);

  const getCategoryDisplayName = (category: string) => {
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const styles = createStyles(theme);

  // Show loading state only during initial load
  if (loading && initialLoad) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar
          barStyle={settings?.theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('common.back') || 'Go back'}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('prayers.loading') || 'Loading prayer...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prayer) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar
          barStyle={settings?.theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background.primary}
        />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel={t('common.back') || 'Go back'}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={theme.colors.text.tertiary}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>
            {t('prayers.notFound') || 'Prayer not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        barStyle={settings?.theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />
      
      {/* Header with back button and actions */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel={t('common.back') || 'Go back'}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            accessibilityLabel={t('prayers.share') || 'Share prayer'}
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavoriteToggle}
            accessibilityLabel={
              isFavorite 
                ? t('prayers.removeFromFavorites') || 'Remove from favorites'
                : t('prayers.addToFavorites') || 'Add to favorites'
            }
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? theme.colors.secondary[500] : theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prayer content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
        {/* Prayer metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryDisplayName(prayer.category)}
            </Text>
          </View>
          
          {prayer.source && (
            <Text style={styles.sourceText}>
              {prayer.source}
            </Text>
          )}
        </View>

        {/* Prayer title */}
        <Text style={styles.title} accessibilityRole="header">
          {prayer.title}
        </Text>

        {/* Prayer content */}
        <View style={styles.prayerContentContainer}>
          <Text style={styles.prayerContent} selectable>
            {prayer.content}
          </Text>
        </View>

        {/* Additional metadata */}
        {prayer.tags && prayer.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>
              {t('prayers.tags') || 'Tags'}:
            </Text>
            <View style={styles.tagsList}>
              {prayer.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

import type { Theme } from '../styles/theme';

const createStyles = (theme: Theme & { userFontSize: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(2.5),
    paddingVertical: getSpacing(2),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    minHeight: getHeaderHeight(),
  },
  backButton: {
    padding: getSpacing(1.5),
    marginLeft: -getSpacing(1.5),
    borderRadius: getBorderRadius('large'),
    backgroundColor: 'transparent',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: getSpacing(1.5),
    marginLeft: getSpacing(1),
    borderRadius: getBorderRadius('large'),
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: getSpacing(2.5),
    paddingBottom: getSpacing(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: getScaledFontSize(16, theme.userFontSize),
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: getScaledFontSize(18, theme.userFontSize),
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: theme.colors.secondary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  categoryText: {
    fontSize: getScaledFontSize(12, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.secondary[700],
    fontFamily: theme.typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceText: {
    fontSize: getScaledFontSize(14, theme.userFontSize),
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  title: {
    fontSize: getScaledFontSize(28, theme.userFontSize),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    lineHeight: getScaledFontSize(36, theme.userFontSize),
    marginBottom: 8,
  },
  subtitle: {
    fontSize: getScaledFontSize(18, theme.userFontSize),
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: getScaledFontSize(24, theme.userFontSize),
    marginBottom: 24,
  },
  prayerContentContainer: {
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  prayerContent: {
    fontSize: getScaledFontSize(16, theme.userFontSize),
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: getScaledFontSize(24, theme.userFontSize),
    textAlign: 'left',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    fontSize: getScaledFontSize(14, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  tagText: {
    fontSize: getScaledFontSize(12, theme.userFontSize),
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
});
