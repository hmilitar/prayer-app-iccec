/**
 * CalendarView — simple month calendar grid for selecting devotion dates
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { getScaledFontSize } from '../../utils/fontScaling';
import { formatDateToISO } from '../../utils/dateUtils';
import type { Theme } from '../../styles/theme';

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

export interface CalendarViewProps {
  /** The month/year to display */
  readonly currentMonth: Date;
  /** ISO date string of the currently selected date */
  readonly selectedDate: string;
  /** Callback when user taps a date cell */
  readonly onDateSelect: (dateISO: string) => void;
  /** Array of ISO date strings that have content available */
  readonly availableDates?: readonly string[];
}

/**
 * Generate localized short day-of-week labels (Sun–Sat) using Intl.
 * Falls back to English abbreviations when the locale is unavailable.
 */
function getLocalizedDayLabels(lang: string): readonly string[] {
  try {
    const locale = LOCALE_MAP[lang] ?? 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Jan 4 2015 is a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2015, 0, 4 + i);
      return formatter.format(d);
    });
  } catch {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }
}

export function CalendarView({
  currentMonth,
  selectedDate,
  onDateSelect,
  availableDates = [],
}: CalendarViewProps) {
  const theme = useTheme();
  const { currentLanguage, t } = useLocalization();
  const styles = createStyles(theme);
  const today = formatDateToISO(new Date());

  /** Day-of-week headers — recomputed when language changes */
  const dayLabels = useMemo(() => getLocalizedDayLabels(currentLanguage), [currentLanguage]);

  const { weeks } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();

    const cells: Array<Date | null> = [];
    // blanks before first day
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: Array<Array<Date | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return { weeks: rows };
  }, [currentMonth]);

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        {dayLabels.map((label, index) => (
          <View key={`day-${index}`} style={styles.headerCell}>
            <Text style={styles.headerText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar weeks */}
      {weeks.map((week: Array<Date | null>, wi: number) => (
        <View key={`week-${wi}`} style={styles.weekRow}>
          {week.map((date: Date | null, di: number) => {
            if (!date) {
              return <View key={`blank-${di}`} style={styles.dayCell} />;
            }
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
                accessibilityLabel={t('readings.selectDate') || `Select ${iso}`}
                accessibilityRole="button"
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.dayText,
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
      ))}
    </View>
  );
}

const createStyles = (theme: Theme & { userFontSize: string }) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    headerCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    headerText: {
      fontSize: getScaledFontSize(12, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
    },
    weekRow: {
      flexDirection: 'row',
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full,
      margin: 2,
      minHeight: 44,
      minWidth: 44,
    },
    selectedCell: {
      backgroundColor: theme.colors.primary[500],
    },
    todayCell: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary[400],
    },
    dayText: {
      fontSize: getScaledFontSize(14, theme.userFontSize),
      color: theme.colors.text.primary,
      fontWeight: '500',
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
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary[400],
      marginTop: 2,
    },
    dotSelected: {
      backgroundColor: '#FFFFFF',
    },
  });
