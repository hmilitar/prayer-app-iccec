/**
 * DailyDevotionsScreen — ICCEC Daily Office
 *
 * Displays Morning, Midday, Evening, and Family devotions following
 * the ICCEC Prayer Guide outline (pages 8-20).
 *
 * Layout: time-of-day selector → scrollable devotion content
 * with readings, prayers, canticles, and rubrics.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Header, PrimaryButton } from '../components';
import { CalendarView } from '../components/readings/CalendarView';
import { BibleGatewayModal } from '../components/readings/BibleGatewayModal';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
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
  formatDateToISO,
  getBcp47Locale,
} from '../utils/dateUtils';
import { getBibleGatewayUrl, getBibleVersionForLanguage } from '../types/Reading';
import {
  buildDevotion,
  hasLectionaryData,
  getLectionaryDates,
} from '../data/devotions/devotionBuilder';
import type { DailyDevotion, DevotionTimeOfDay, DevotionSection, DevotionReading } from '../types/Devotion';
import type { Theme } from '../styles/theme';

/** Route params optionally carry a pre-selected time of day */
type DevotionRouteParams = {
  DailyReadings: { timeOfDay?: DevotionTimeOfDay } | undefined;
};

// ─── Time-of-day tab data ──────────────────────────────────────────────
interface TimeTab {
  readonly key: DevotionTimeOfDay;
  readonly labelKey: string;
  readonly fallbackLabel: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
}

const TIME_TABS: readonly TimeTab[] = [
  { key: 'morning', labelKey: 'devotions.morning', fallbackLabel: 'Morning', icon: 'sunny-outline' },
  { key: 'noon', labelKey: 'devotions.noon', fallbackLabel: 'Midday', icon: 'partly-sunny-outline' },
  { key: 'evening', labelKey: 'devotions.evening', fallbackLabel: 'Evening', icon: 'moon-outline' },
  { key: 'family', labelKey: 'devotions.family', fallbackLabel: 'Family', icon: 'people-outline' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════

export default function DailyDevotionsScreen() {
  const route = useRoute<RouteProp<DevotionRouteParams, 'DailyReadings'>>();
  const { t, currentLanguage } = useLocalization();
  const { settings } = useSettings();
  const theme = useTheme();

  // ── State ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedTime, setSelectedTime] = useState<DevotionTimeOfDay>(
    route.params?.timeOfDay ?? getDefaultTimeOfDay(),
  );
  const [devotion, setDevotion] = useState<DailyDevotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'devotion'>('devotion');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Bible Gateway modal state
  const [bibleModalVisible, setBibleModalVisible] = useState(false);
  const [bibleModalUrl, setBibleModalUrl] = useState('');
  const [bibleModalRef, setBibleModalRef] = useState('');

  const today = getTodayISO();
  const isToday = selectedDate === today;
  const displayDate = formatDisplayDate(parseISODate(selectedDate), currentLanguage);
  const liturgicalSeason = getLiturgicalSeason(parseISODate(selectedDate));
  const liturgicalColor = getLiturgicalColor(parseISODate(selectedDate));

  /** All lectionary dates for dot display on calendar */
  const lectionaryDates = useMemo(() => getLectionaryDates(), []);

  // Keys for forcing re-render on settings change
  const settingsKey = `${currentLanguage}-${settings?.fontSize ?? 'medium'}-${settings?.theme ?? 'light'}`;

  // ── Load devotion ────────────────────────────────────────────────────
  const loadDevotion = useCallback(
    (date: string, time: DevotionTimeOfDay) => {
      setLoading(true);
      try {
        const result = buildDevotion(date, time, currentLanguage);
        setDevotion(result);
      } catch (err) {
        console.error('Error building devotion:', err);
        setDevotion(null);
      } finally {
        setLoading(false);
      }
    },
    [currentLanguage],
  );

  useEffect(() => {
    loadDevotion(selectedDate, selectedTime);
  }, [selectedDate, selectedTime, currentLanguage, loadDevotion]);

  // Apply route param time-of-day if changed externally
  useEffect(() => {
    const routeTime = route.params?.timeOfDay;
    if (routeTime && routeTime !== selectedTime) {
      setSelectedTime(routeTime);
    }
  }, [route.params?.timeOfDay]);

  // ── Navigation helpers ───────────────────────────────────────────────
  const navigateDate = (dir: 'next' | 'previous') => {
    const dateObj = parseISODate(selectedDate);
    const newDate = dir === 'next' ? getNextDay(dateObj) : getPreviousDay(dateObj);
    setSelectedDate(formatDateToISO(newDate));
  };

  const goToToday = () => setSelectedDate(getTodayISO());

  const navigateMonth = (dir: 'next' | 'previous') => {
    const m = new Date(currentMonth);
    m.setMonth(m.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentMonth(m);
  };

  const handleDateFromCalendar = (iso: string) => {
    setSelectedDate(iso);
    setViewMode('devotion');
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    loadDevotion(selectedDate, selectedTime);
    setRefreshing(false);
  }, [selectedDate, selectedTime, loadDevotion]);

  /** Open a scripture reference in the in-app Bible Gateway modal */
  const openBibleLink = useCallback((ref: string) => {
    const url = getBibleGatewayUrl(ref, currentLanguage);
    setBibleModalRef(ref);
    setBibleModalUrl(url);
    setBibleModalVisible(true);
  }, [currentLanguage]);

  const closeBibleModal = useCallback(() => {
    setBibleModalVisible(false);
  }, []);

  const styles = createStyles(theme);

  // ═══════════════════════════════════════════════════════════════════
  // Render helpers
  // ═══════════════════════════════════════════════════════════════════

  /** Render a single devotion section */
  const renderSection = (section: DevotionSection, index: number) => {
    // Sections that show a tappable BibleGateway reference badge
    const isLinkableReading =
      section.key === 'psalm' ||
      section.key === 'reading_1st_label' ||
      section.key === 'reading_2nd_label' ||
      section.key === 'reading_gospel_label';

    // Whether to use the indented reading-card style
    const isReading =
      section.key === 'reading_1st_label' ||
      section.key === 'reading_2nd_label' ||
      section.key === 'reading_gospel_label';

    return (
      <View
        key={`${section.key}-${index}`}
        style={[styles.sectionCard, isReading && styles.readingCard]}
        accessibilityRole="text"
      >
        {/* Rubric */}
        {section.rubric ? (
          <Text style={styles.rubricText}>{section.rubric}</Text>
        ) : null}

        {/* Title */}
        <Text style={styles.sectionTitle}>{section.title}</Text>

        {/* Tappable reference badge (psalm + scripture readings) */}
        {section.reference && isLinkableReading ? (
          <TouchableOpacity
            style={styles.referenceBadge}
            onPress={() => openBibleLink(section.reference ?? '')}
            accessibilityLabel={`Open ${section.reference} on Bible Gateway`}
            accessibilityRole="link"
          >
            <Ionicons name="book-outline" size={14} color={theme.colors.primary[500]} />
            <Text style={styles.referenceText}>{section.reference}</Text>
            <Ionicons name="reader-outline" size={12} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        ) : null}

        {/* Content — omit for linkable readings where content === reference (no verse text loaded) */}
        {section.content && section.content !== section.reference ? (
          <Text style={styles.sectionContent} selectable>
            {section.content}
          </Text>
        ) : !isLinkableReading && section.content ? (
          <Text style={styles.sectionContent} selectable>
            {section.content}
          </Text>
        ) : null}

        {/* Non-linkable reference footnote */}
        {section.reference && !isLinkableReading ? (
          <Text style={styles.refFootnote}>{section.reference}</Text>
        ) : null}

        {/* Response */}
        {section.response ? (
          <Text style={styles.responseText}>℟ {section.response}</Text>
        ) : null}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  // Main render
  // ═══════════════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={styles.container} edges={['top']} key={settingsKey}>
      <Header
        title={t('devotions.title') ?? 'Daily Devotions'}
        variant="elevated"
      />

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'calendar' && styles.toggleBtnActive]}
          onPress={() => setViewMode('calendar')}
          accessibilityLabel="Calendar view"
          accessibilityRole="tab"
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={viewMode === 'calendar' ? '#FFF' : theme.colors.text.secondary}
          />
          <Text style={[styles.toggleLabel, viewMode === 'calendar' && styles.toggleLabelActive]}>
            {t('calendar') ?? 'Calendar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'devotion' && styles.toggleBtnActive]}
          onPress={() => setViewMode('devotion')}
          accessibilityLabel="Devotion view"
          accessibilityRole="tab"
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={viewMode === 'devotion' ? '#FFF' : theme.colors.text.secondary}
          />
          <Text style={[styles.toggleLabel, viewMode === 'devotion' && styles.toggleLabelActive]}>
            {t('daily') ?? 'Daily'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {viewMode === 'calendar' ? (
          <>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <PrimaryButton title="←" onPress={() => navigateMonth('previous')} variant="ghost" size="small" />
              <Text style={styles.monthLabel}>
                {currentMonth.toLocaleDateString(getBcp47Locale(currentLanguage), { month: 'long', year: 'numeric' })}
              </Text>
              <PrimaryButton title="→" onPress={() => navigateMonth('next')} variant="ghost" size="small" />
            </View>
            <CalendarView
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateFromCalendar}
              availableDates={lectionaryDates}
            />
          </>
        ) : (
          <>
            {/* Date navigation */}
            <View style={styles.dateNav}>
              <PrimaryButton title="←" onPress={() => navigateDate('previous')} variant="ghost" size="small" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>{displayDate}</Text>
                <View style={styles.seasonRow}>
                  <View style={[styles.seasonDot, { backgroundColor: liturgicalColor }]} />
                  <Text style={styles.seasonText}>
                    {t(`liturgical.${liturgicalSeason.toLowerCase()}`) ?? liturgicalSeason}
                  </Text>
                </View>
              </View>
              <PrimaryButton title="→" onPress={() => navigateDate('next')} variant="ghost" size="small" />
            </View>

            {/* Today button */}
            {!isToday && (
              <PrimaryButton
                title={t('goToToday') ?? 'Go to Today'}
                onPress={goToToday}
                variant="outline"
                size="small"
                style={styles.todayBtn}
              />
            )}

            {/* Time-of-day tabs */}
            <View style={styles.timeTabs}>
              {TIME_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.timeTab, selectedTime === tab.key && styles.timeTabActive]}
                  onPress={() => setSelectedTime(tab.key)}
                  accessibilityLabel={tab.fallbackLabel}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: selectedTime === tab.key }}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={selectedTime === tab.key ? '#FFF' : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.timeTabLabel,
                      selectedTime === tab.key && styles.timeTabLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t(tab.labelKey) ?? tab.fallbackLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                <Text style={styles.loadingText}>
                  {t('devotions.loadingDevotions') ?? 'Loading devotions...'}
                </Text>
              </View>
            ) : devotion ? (
              <View style={styles.devotionContent}>
                {/* Devotion title */}
                <Text style={styles.devotionTitle} accessibilityRole="header">
                  {devotion.title}
                </Text>

                {/* Sections */}
                {devotion.sections.map((section: DevotionSection, idx: number) => renderSection(section, idx))}

                {/* Bible Gateway links */}
                {devotion.readings.length > 0 && (
                  <View style={styles.linksCard}>
                    <Text style={styles.linksTitle}>
                      {t('readOnline') ?? 'Read Online'}
                    </Text>
                    {devotion.readings.map((r: DevotionReading) => (
                      <TouchableOpacity
                        key={r.type}
                        style={styles.linkRow}
                        onPress={() => openBibleLink(r.reference)}
                        accessibilityLabel={`Open ${r.reference} on Bible Gateway`}
                        accessibilityRole="link"
                      >
                        <Ionicons name="book-outline" size={18} color={theme.colors.primary[500]} />
                        <View style={styles.linkInfo}>
                          <Text style={styles.linkLabel}>{r.label}</Text>
                          <Text style={styles.linkRef}>{r.reference}</Text>
                        </View>
                        <Ionicons name="reader-outline" size={14} color={theme.colors.text.tertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={theme.colors.text.tertiary} />
                <Text style={styles.emptyTitle}>
                  {t('devotions.noDevotions') ?? 'No devotions available for this date'}
                </Text>
                <PrimaryButton
                  title={t('goToToday') ?? 'Go to Today'}
                  onPress={goToToday}
                  variant="outline"
                  size="small"
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bible Gateway in-app reader */}
      <BibleGatewayModal
        visible={bibleModalVisible}
        url={bibleModalUrl}
        reference={bibleModalRef}
        bibleVersion={getBibleVersionForLanguage(currentLanguage)}
        onClose={closeBibleModal}
      />
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

/** Guess a sensible default time of day based on the clock. */
function getDefaultTimeOfDay(): DevotionTimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'noon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'family';
}

// ═══════════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════════

const createStyles = (theme: Theme & { userFontSize: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
    },
    scroll: { flex: 1, paddingHorizontal: theme.spacing.md },
    scrollContent: { paddingBottom: theme.spacing.xl * 2 },

    // ── View toggle ────────────────────────────────────────────────────
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.primary,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      ...theme.shadows.sm,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    toggleBtnActive: {
      backgroundColor: theme.colors.primary[500],
    },
    toggleLabel: {
      fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    toggleLabelActive: { color: '#FFFFFF' },

    // ── Calendar ───────────────────────────────────────────────────────
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
    },
    monthLabel: {
      fontSize: getScaledFontSize(theme.typography.fontSize.lg, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.primary,
    },

    // ── Date navigation ────────────────────────────────────────────────
    dateNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    dateInfo: { flex: 1, alignItems: 'center', paddingHorizontal: theme.spacing.md },
    dateText: {
      fontSize: getScaledFontSize(theme.typography.fontSize.lg, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    seasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    seasonDot: { width: 8, height: 8, borderRadius: 4 },
    seasonText: {
      fontSize: getScaledFontSize(theme.typography.fontSize.sm, theme.userFontSize),
      fontStyle: 'italic',
      color: theme.colors.primary[500],
    },
    todayBtn: { alignSelf: 'center', marginBottom: theme.spacing.md },

    // ── Time tabs ──────────────────────────────────────────────────────
    timeTabs: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    timeTab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      gap: 2,
      minHeight: 56,
    },
    timeTabActive: {
      backgroundColor: theme.colors.primary[500],
    },
    timeTabLabel: {
      fontSize: getScaledFontSize(11, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    timeTabLabelActive: { color: '#FFFFFF' },

    // ── Devotion content ───────────────────────────────────────────────
    devotionContent: { marginTop: theme.spacing.sm },
    devotionTitle: {
      fontSize: getScaledFontSize(22, theme.userFontSize),
      fontWeight: '700',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },

    // ── Section cards ──────────────────────────────────────────────────
    sectionCard: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    readingCard: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary[400],
    },
    sectionTitle: {
      fontSize: getScaledFontSize(16, theme.userFontSize),
      fontWeight: '700',
      color: theme.colors.primary[600],
      marginBottom: theme.spacing.sm,
    },
    sectionContent: {
      fontSize: getScaledFontSize(15, theme.userFontSize),
      lineHeight: getScaledFontSize(24, theme.userFontSize),
      color: theme.colors.text.primary,
    },
    rubricText: {
      fontSize: getScaledFontSize(12, theme.userFontSize),
      fontStyle: 'italic',
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xs,
    },
    referenceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary[500]}10`,
      alignSelf: 'flex-start',
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      marginBottom: theme.spacing.sm,
      gap: 4,
      minHeight: 44,
    },
    referenceText: {
      fontSize: getScaledFontSize(13, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.primary[500],
    },
    refFootnote: {
      fontSize: getScaledFontSize(12, theme.userFontSize),
      fontStyle: 'italic',
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.xs,
    },
    responseText: {
      fontSize: getScaledFontSize(14, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.primary[500],
      marginTop: theme.spacing.sm,
    },

    // ── Bible links ────────────────────────────────────────────────────
    linksCard: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      ...theme.shadows.sm,
    },
    linksTitle: {
      fontSize: getScaledFontSize(16, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xs,
      gap: theme.spacing.sm,
      minHeight: 48,
    },
    linkInfo: { flex: 1 },
    linkLabel: {
      fontSize: getScaledFontSize(13, theme.userFontSize),
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    linkRef: {
      fontSize: getScaledFontSize(12, theme.userFontSize),
      color: theme.colors.primary[500],
      marginTop: 2,
    },

    // ── States ─────────────────────────────────────────────────────────
    centered: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    loadingText: {
      fontSize: getScaledFontSize(14, theme.userFontSize),
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.sm,
    },
    emptyTitle: {
      fontSize: getScaledFontSize(16, theme.userFontSize),
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });
