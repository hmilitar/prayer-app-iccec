/**
 * WeekCalendar — compact week view for selecting devotion dates
 * Designed for web platform with minimal vertical footprint (~60-80px height)
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { getScaledFontSize } from '../../utils/fontScaling';
import { formatDateToISO, formatDisplayDate, getNextDay, getPreviousDay } from '../../utils/dateUtils';
import type { Theme } from '../../styles/theme';

/** Check if running on web platform */
const isWebPlatform = (): boolean => Platform.OS === 'web';

/** Map i18n language code → BCP-47 locale for Intl formatting */
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

export interface WeekCalendarProps {
  /** The date to display the week around (usually selected date or today) */
  readonly currentDate: Date;
  /** ISO date string of the currently selected date */
  readonly selectedDate: string;
  /** Callback when user taps a date cell */
  readonly onDateSelect: (dateISO: string) => void;
  /** Array of ISO date strings that have content available */
  readonly availableDates?: readonly string[];
}

export function WeekCalendar({
  currentDate,
  selectedDate,
  onDateSelect,
  availableDates = [],
}: WeekCalendarProps) {
  const theme = useTheme();
  const { currentLanguage } = useLocalization();
  const styles = createStyles(theme);
  const today = formatDateToISO(new Date());

  /** Get the start of the week (Sunday) for the current date */
  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }, [currentDate]);

  /** Generate the 7 days of the week */
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  /** Day-of-week labels */
  const dayLabels = useMemo(() => {
    try {
      const locale = LOCALE_MAP[currentLanguage] ?? 'en-US';
      const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
      // Jan 4 2015 is a Sunday
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2015, 0, 4 + i);
        return formatter.format(d);
      });
    } catch {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  }, [currentLanguage]);

  const availableSet = useMemo(() => new Set(availableDates ?? []), [availableDates]);

  return (
    <View style={styles.container}>
      {/* Week days row */}
      <View style={styles.weekRow}>
        {weekDays.map((date: Date, index: number) => {
          const iso = formatDateToISO(date);
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const hasContent = availableSet.size === 0 || availableSet.has(iso);

          return (
            <TouchableOpacity
              key={iso}
              style={[
                styles.dayCell,
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => onDateSelect(iso)}
              accessibilityLabel={`${dayLabels[index]}, ${formatDisplayDate(date, currentLanguage)}`}
              accessibilityRole="button"
              activeOpacity={0.6}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.selectedLabel,
                  isToday && !isSelected && styles.todayLabel,
                ]}
                numberOfLines={1}
              >
                {dayLabels[index]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedText,
                  isToday && !isSelected && styles.todayText,
                  !hasContent && styles.noContentText,
                ]}
              >
                {date.getDate()}
              </Text>
              {hasContent && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme & { userFontSize: string }) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: isWebPlatform() ? theme.spacing.xs : theme.spacing.sm,
      ...theme.shadows.sm,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dayCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isWebPlatform() ? 4 : theme.spacing.sm,
      paddingHorizontal: isWebPlatform() ? 2 : 4,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: isWebPlatform() ? 2 : 3,
      minHeight: isWebPlatform() ? 50 : 60,
    },
    selectedCell: {
      backgroundColor: theme.colors.primary[500],
    },
    todayCell: {
      borderWidth: isWebPlatform() ? 1 : 1.5,
      borderColor: theme.colors.primary[400],
    },
    dayLabel: {
      fontSize: getScaledFontSize(isWebPlatform() ? 10 : 12, theme.userFontSize),
      fontWeight: '500',
      color: theme.colors.text.tertiary,
      marginBottom: 2,
    },
    selectedLabel: {
      color: '#FFFFFF',
    },
    todayLabel: {
      color: theme.colors.primary[600],
    },
    dayNumber: {
      fontSize: getScaledFontSize(isWebPlatform() ? 16 : 18, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    selectedText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    todayText: {
      color: theme.colors.primary[600],
      fontWeight: '700',
    },
    noContentText: {
      opacity: 0.4,
    },
    dot: {
      width: isWebPlatform() ? 3 : 4,
      height: isWebPlatform() ? 3 : 4,
      borderRadius: isWebPlatform() ? 1.5 : 2,
      backgroundColor: theme.colors.primary[400],
      marginTop: 2,
    },
    dotSelected: {
      backgroundColor: '#FFFFFF',
    },
  });
