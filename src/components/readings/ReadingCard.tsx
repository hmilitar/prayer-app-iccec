// ReadingCard component - Display daily reading in card format

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyReading, ReadingType } from '../../types/Reading';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { getScaledFontSize } from '../../utils/fontScaling';

/** Map i18n language code → BCP-47 locale for Intl.DateTimeFormat */
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  tl: 'fil-PH',
  et: 'et-EE',
  es: 'es-ES',
  it: 'it-IT',
  fr: 'fr-FR',
  de: 'de-DE',
  pl: 'pl-PL',
};

/** Map ReadingType enum values → translation keys under readings.* */
const READING_TYPE_KEYS: Record<string, string> = {
  OLD_TESTAMENT: 'readings.oldTestament',
  PSALM: 'readings.psalm',
  NEW_TESTAMENT: 'readings.newTestament',
  GOSPEL: 'readings.gospel',
  DEVOTIONAL: 'readings.devotional',
};

export interface ReadingCardProps {
  reading: DailyReading;
  onPress: (reading: DailyReading) => void;
  showDate?: boolean;
  compact?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function ReadingCard({
  reading,
  onPress,
  showDate = true,
  compact = false,
  variant = 'default'
}: Readonly<ReadingCardProps>) {
  const theme = useTheme();
  const { t, currentLanguage } = useLocalization();
  const styles = createStyles(theme);

  const handlePress = () => {
    onPress(reading);
  };

  /** Format date in the user's selected language */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = LOCALE_MAP[currentLanguage] ?? 'en-US';
      return date.toLocaleDateString(locale, {
        weekday: compact ? 'short' : 'long',
        year: 'numeric',
        month: compact ? 'short' : 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getReadingTypeIcon = (type: ReadingType) => {
    switch (type) {
      case ReadingType.OLD_TESTAMENT:
        return 'library-outline';
      case ReadingType.PSALM:
        return 'musical-notes-outline';
      case ReadingType.NEW_TESTAMENT:
        return 'book-outline';
      case ReadingType.GOSPEL:
        return 'star-outline';
      case ReadingType.DEVOTIONAL:
        return 'heart-outline';
      default:
        return 'document-text-outline';
    }
  };

  const getReadingTypeColor = (type: ReadingType) => {
    switch (type) {
      case ReadingType.OLD_TESTAMENT:
        return theme.colors.semantic.info;
      case ReadingType.PSALM:
        return theme.colors.primary[500];
      case ReadingType.NEW_TESTAMENT:
        return theme.colors.semantic.success;
      case ReadingType.GOSPEL:
        return theme.colors.semantic.warning;
      case ReadingType.DEVOTIONAL:
        return theme.colors.semantic.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getContainerStyle = () => {
    const baseStyles: any[] = [styles.container];
    
    if (compact) {
      baseStyles.push(styles.compactContainer);
    }
    
    if (variant === 'elevated') {
      baseStyles.push(styles.elevatedContainer);
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlinedContainer);
    }
    
    return baseStyles;
  };

  /** Translate reading type enum to localized label */
  const formatReadingType = (type: string): string => {
    const translationKey = READING_TYPE_KEYS[type];
    if (translationKey) {
      const translated = t(translationKey);
      if (translated && translated !== translationKey) {
        return translated;
      }
    }
    // Fallback: title-case the enum value
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      accessibilityLabel={`${t('readings.daily') || 'Daily reading'}: ${reading.title}`}
      accessibilityRole="button"
      accessibilityHint={t('readings.tapToRead') || 'Tap to read full daily reading'}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
            {reading.title}
          </Text>
          {showDate && (
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.colors.text.tertiary}
                style={styles.dateIcon}
              />
              <Text style={styles.date}>
                {formatDate(reading.date)}
              </Text>
            </View>
          )}
        </View>
      </View>

  <View style={styles.metadataContainer}>
    {reading.metadata?.liturgicalSeason && (
          <View style={styles.seasonContainer}>
            <Ionicons
              name="leaf-outline"
              size={12}
              color={theme.colors.primary[600]}
              style={styles.seasonIcon}
            />
            <Text style={styles.season}>
      {t(`liturgical.${String(reading.metadata.liturgicalSeason).toLowerCase()}`) || String(reading.metadata.liturgicalSeason).toUpperCase()}
            </Text>
          </View>
        )}

    {reading.metadata?.feast && (
          <View style={styles.feastContainer}>
            <Text style={styles.feast}>
              🎉 {reading.metadata.feast}
            </Text>
          </View>
        )}
      </View>

      {reading.readings.length > 0 && (
        <View style={styles.readingsPreview}>
          {reading.readings.map((readingItem) => (
            <View
              key={readingItem.id}
              style={[
                styles.readingItem,
                { borderLeftColor: getReadingTypeColor(readingItem.type) }
              ]}
            >
              <View style={styles.readingHeader}>
                <Ionicons
                  name={getReadingTypeIcon(readingItem.type) as any}
                  size={14}
                  color={getReadingTypeColor(readingItem.type)}
                  style={styles.readingIcon}
                />
                <Text
                  style={[
                    styles.readingType,
                    { color: getReadingTypeColor(readingItem.type) }
                  ]}
                >
                  {formatReadingType(readingItem.type)}
                </Text>
              </View>
              <Text style={styles.readingReference}>{readingItem.reference}</Text>
              {readingItem.title ? (
                <Text style={styles.readingTitle}>{readingItem.title}</Text>
              ) : null}
              {readingItem.text ? (
                <Text style={styles.readingText}>{readingItem.text}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {!compact && reading.reflection && (
        <View style={styles.reflectionContainer}>
          <Ionicons
            name="bulb-outline"
            size={16}
            color={theme.colors.text.secondary}
            style={styles.reflectionIcon}
          />
          <Text style={styles.reflection} numberOfLines={2}>
            {reading.reflection}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  compactContainer: {
    padding: theme.spacing.sm + theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  elevatedContainer: {
    ...theme.shadows.lg,
  },
  outlinedContainer: {
    borderWidth: 1,
    borderColor: theme.colors.background.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: getScaledFontSize(theme.typography.fontSize.lg) * theme.typography.lineHeight.tight,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: theme.spacing.xs,
  },
  date: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  seasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary[500]}15`,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  seasonIcon: {
    marginRight: theme.spacing.xs / 2,
  },
  season: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  feastContainer: {
    backgroundColor: `${theme.colors.semantic.warning}15`,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    marginBottom: theme.spacing.xs,
  },
  feast: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.semantic.warning,
    fontWeight: '500',
  },
  readingsPreview: {
    marginBottom: theme.spacing.sm,
  },
  readingItem: {
    marginBottom: theme.spacing.xs + theme.spacing.xs / 2,
    paddingLeft: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.background.tertiary,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs / 2,
  },
  readingIcon: {
    marginRight: theme.spacing.xs,
  },
  readingType: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    fontWeight: '600',
  },
  readingReference: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  readingTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  readingText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.primary,
    lineHeight: getScaledFontSize(theme.typography.fontSize.sm) * theme.typography.lineHeight.normal,
    marginTop: theme.spacing.xs,
  },
  moreReadingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  moreIcon: {
    marginRight: theme.spacing.xs,
  },
  moreReadings: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  reflectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  reflectionIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  reflection: {
    flex: 1,
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    lineHeight: getScaledFontSize(theme.typography.fontSize.sm) * theme.typography.lineHeight.normal,
    fontStyle: 'italic',
  },
});