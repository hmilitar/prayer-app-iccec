// Settings Screen - Manage app preferences and user customization

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FontSize, ThemeMode } from '../types/Settings';
import { SupportedLanguage } from '../types/Prayer';
import { Header, PrimaryButton } from '../components';
import { useLocalization } from '../hooks/useLocalization';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { getScaledFontSize } from '../utils/fontScaling';
import type { Theme } from '../styles/theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

interface SettingsToggleProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface SettingsPickerProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  rightElement
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  return (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={theme.colors.text.secondary}
            style={styles.settingsIcon}
          />
        )}
        <View style={styles.settingsTextContainer}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={styles.settingsItemRight}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );
};

const SettingsToggle: React.FC<SettingsToggleProps> = ({ 
  title, 
  subtitle, 
  icon, 
  value, 
  onValueChange
}) => {
  const theme = useTheme();
  
  return (
    <SettingsItem
      title={title}
      subtitle={subtitle}
      icon={icon}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ 
            false: theme.colors.background.tertiary, 
            true: `${theme.colors.primary[500]}50` 
          }}
          thumbColor={value ? theme.colors.primary[500] : theme.colors.text.tertiary}
        />
      }
    />
  );
};

const SettingsPicker: React.FC<SettingsPickerProps> = ({ 
  title, 
  subtitle, 
  icon, 
  value, 
  options, 
  onValueChange
}) => {
  const theme = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  
  const handlePress = () => {
    setShowOptions(!showOptions);
  };
  
  const handleOptionSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setShowOptions(false);
  };
  
  return (
    <View>
      <SettingsItem
        title={title}
        subtitle={subtitle || selectedOption?.label}
        icon={icon}
        onPress={handlePress}
        
        rightElement={
          <Ionicons
            name={showOptions ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.text.secondary}
          />
        }
      />
      {showOptions && (
        <View style={createStyles(theme).pickerOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                createStyles(theme).pickerOption,
                value === option.value && createStyles(theme).pickerOptionSelected
              ]}
              onPress={() => handleOptionSelect(option.value)}
            >
              <Text style={[
                createStyles(theme).pickerOptionText,
                value === option.value && createStyles(theme).pickerOptionTextSelected
              ]}>
                {option.label}
              </Text>
              {value === option.value && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.primary[500]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// Ministry App Card
// ─────────────────────────────────────────────────────────────────

interface MinistryAppCardProps {
  logo: ImageSourcePropType;
  badge: string;
  appName: string;
  tagline: string;
  description: string;
  url: string;
  accentColor: string;
  getAppLabel: string;
}

const MinistryAppCard: React.FC<MinistryAppCardProps> = ({
  logo,
  badge,
  appName,
  tagline,
  description,
  url,
  accentColor,
  getAppLabel,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const handleOpen = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).open(url, '_blank', 'noopener,noreferrer');
      } else {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      }
    } catch (err) {
      console.error('MinistryAppCard: failed to open URL', err);
    }
  }, [url]);

  return (
    <TouchableOpacity
      style={styles.ministryCard}
      onPress={handleOpen}
      activeOpacity={0.88}
      accessibilityRole="link"
      accessibilityLabel={appName}
    >
      {/* Accent bar */}
      <View style={[styles.ministryAccentBar, { backgroundColor: accentColor }]} />

      <View style={styles.ministryCardBody}>
        {/* Header row: icon + meta */}
        <View style={styles.ministryCardHeader}>
          <View style={[styles.ministryIconWrap, { borderColor: `${accentColor}30` }]}>
            <Image source={logo} style={styles.ministryLogo} resizeMode="contain" />
          </View>
          <View style={styles.ministryCardMeta}>
            <View style={[styles.ministryBadge, { backgroundColor: `${accentColor}1A` }]}>
              <Text style={[styles.ministryBadgeText, { color: accentColor }]}>{badge}</Text>
            </View>
            <Text style={styles.ministryAppName} numberOfLines={1}>{appName}</Text>
            <Text style={[styles.ministryTagline, { color: accentColor }]}>{tagline}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.ministryDescription} numberOfLines={3}>{description}</Text>

        {/* CTA */}
        <View style={[styles.ministryButton, { backgroundColor: accentColor }]}>
          <Ionicons name="download-outline" size={15} color="#fff" style={styles.ministryButtonIcon} />
          <Text style={styles.ministryButtonText}>{getAppLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { t, changeLanguage, getSupportedLanguages } = useLocalization();
  const { 
    settings, 
    updateLanguage, 
    updateFontSize, 
    updateTheme, 
    toggleNotification, 
    toggleAccessibility,
    togglePrivacy,
    resetSettings,
    saving,
    reload 
  } = useSettings();
  
  const theme = useTheme();

  // Keep a stable reference to reload to avoid dependency churn
  const reloadRef = useRef(reload);
  useEffect(() => { reloadRef.current = reload; }, [reload]);

  // Refresh settings when tab is focused (run once per focus)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const run = async () => {
        try {
          if (!cancelled) {
            await reloadRef.current?.();
          }
        } catch (e) {
          console.error(e);
        }
      };
      run();
      return () => { cancelled = true; };
    }, [])
  );

  // Force re-render when settings change to ensure UI updates immediately
  useEffect(() => {
    // This effect ensures the settings screen updates when theme changes
    // This is particularly important for immediate visual feedback
  }, [theme, settings]);

  const handleLanguageChange = useCallback(async (language: string) => {
    // If currently changing, block attempts
    if (saving) return;

    try {
      // Defensive programming: Validate language
      const targetLanguage = language as SupportedLanguage;
      if (!getSupportedLanguages().includes(targetLanguage)) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // 1. Persist settings first
      await updateLanguage(targetLanguage);
      
      // 2. Update localization context (this triggers the event emitter)
      // This will convert "simultaneously" across other screens
      await changeLanguage(targetLanguage);

    } catch (err) {
      console.error('Failed to change language:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.changeLanguage') || 'Failed to change language. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  }, [updateLanguage, changeLanguage, t, getSupportedLanguages, saving]);

  const handleFontSizeChange = useCallback(async (fontSize: string) => {
    try {
      await updateFontSize(fontSize as FontSize);
    } catch (err) {
      console.error('Failed to change font size:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.changeFontSize') || 'Failed to change font size. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  }, [updateFontSize, t]);

  const handleThemeChange = useCallback(async (themeMode: string) => {
    try {
      await updateTheme(themeMode as ThemeMode);
    } catch (err) {
      console.error('Failed to change theme:', err);
      Alert.alert(
        t('error.title') || 'Error',
        t('error.changeTheme') || 'Failed to change theme. Please try again.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  }, [updateTheme, t]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      t('settings.resetTitle') || 'Reset Settings',
      t('settings.resetMessage') || 'Are you sure you want to reset all settings to default? This action cannot be undone.',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel'
        },
        {
          text: t('settings.reset') || 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings().then(() => {
              Alert.alert(
                t('settings.resetSuccess') || 'Settings Reset',
                t('settings.resetSuccessMessage') || 'All settings have been reset to default values.',
                [{ text: t('common.ok') || 'OK' }]
              );
            }).catch((err) => {
              console.error('Failed to reset settings:', err);
              Alert.alert(
                t('error.title') || 'Error',
                t('error.resetSettings') || 'Failed to reset settings. Please try again.',
                [{ text: t('common.ok') || 'OK' }]
              );
            });
          }
        }
      ]
    );
  }, [resetSettings, t]);

  // Open Selah Studio website - only works on web platform
  const handleOpenSelahStudio = useCallback(async () => {
    const url = 'https://selahstudio.ph/';
    try {
      if (Platform.OS === 'web') {
        // On web, use window.open for proper navigation
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // On mobile, use Linking
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          console.warn('Cannot open URL:', url);
        }
      }
    } catch (err) {
      console.error('Failed to open Selah Studio link:', err);
    }
  }, []);

  if (!settings) {
    return (
      <SafeAreaView style={createStyles(theme).container} edges={['top']}>
        <Header
          title={t('settings.title') || 'Settings'}
          
          variant="elevated"
        />
        <View style={createStyles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={createStyles(theme).loadingText}>
            {t('settings.loading') || 'Loading settings...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const languageOptions = getSupportedLanguages().map(lang => {
    // Use native language names for better UX
    const languageLabels: Record<string, string> = {
      en: 'English',
      tl: 'Tagalog',
      et: 'Eesti',
      es: 'Español',
      it: 'Italiano',
      fr: 'Français',
      de: 'Deutsch',
      pl: 'Polski',
      ru: 'Русский',
      nl: 'Nederlands',
      pt: 'Português',
      sv: 'Svenska',
      ro: 'Română'
    };
    
    return { 
      label: languageLabels[lang] ?? lang.toUpperCase(), 
      value: lang 
    };
  });

  const fontSizeOptions = [
    { label: t('settings.fontSize.small') || 'Small', value: FontSize.SMALL },
    { label: t('settings.fontSize.medium') || 'Medium', value: FontSize.MEDIUM },
    { label: t('settings.fontSize.large') || 'Large', value: FontSize.LARGE },
    { label: t('settings.fontSize.extraLarge') || 'Extra Large', value: FontSize.EXTRA_LARGE },
  ];

  const themeOptions = [
    { label: t('settings.theme.light') || 'Light', value: ThemeMode.LIGHT },
    { label: t('settings.theme.dark') || 'Dark', value: ThemeMode.DARK },
    { label: t('settings.theme.system') || 'System', value: ThemeMode.SYSTEM },
  ];

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={t('settings.title') || 'Settings'}
        
        variant="elevated"
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Settings */}
        <SettingsSection title={t('settings.appearance') || 'Appearance'} >
          <SettingsPicker
            title={t('settings.language') || 'Language'}
            subtitle={t('settings.languageSubtitle') || 'App display language'}
            icon="language-outline"
            value={settings.language}
            options={languageOptions}
            onValueChange={handleLanguageChange}
            
          />
          
          <SettingsPicker
            title={t('settings.fontSize.title') || 'Font Size'}
            subtitle={t('settings.fontSize.subtitle') || 'Text size throughout the app'}
            icon="text-outline"
            value={settings.fontSize}
            options={fontSizeOptions}
            onValueChange={handleFontSizeChange}
            
          />
          
          <SettingsPicker
            title={t('settings.theme.title') || 'Theme'}
            subtitle={t('settings.theme.subtitle') || 'App color scheme'}
            icon="color-palette-outline"
            value={settings.theme}
            options={themeOptions}
            onValueChange={handleThemeChange}
            
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title={t('settings.notifications') || 'Notifications'} >
          <SettingsToggle
            title={t('settings.dailyReminder') || 'Daily Reminder'}
            subtitle={t('settings.dailyReminderSubtitle') || 'Remind me to read daily prayers'}
            icon="notifications-outline"
            value={settings.notifications.dailyReminder}
            onValueChange={() => toggleNotification('dailyReminder')}
            
          />
          
          <SettingsToggle
            title={t('settings.prayerNotifications') || 'Prayer Notifications'}
            subtitle={t('settings.prayerNotificationsSubtitle') || 'Notifications for prayer times'}
            icon="time-outline"
            value={settings.notifications.prayerNotifications}
            onValueChange={() => toggleNotification('prayerNotifications')}
            
          />
        </SettingsSection>

        {/* Accessibility */}
        <SettingsSection title={t('settings.accessibility') || 'Accessibility'} >
          <SettingsToggle
            title={t('settings.reduceMotion') || 'Reduce Motion'}
            subtitle={t('settings.reduceMotionSubtitle') || 'Minimize animations and transitions'}
            icon="eye-outline"
            value={settings.accessibility.reduceMotion}
            onValueChange={() => toggleAccessibility('reduceMotion')}
            
          />
          
          <SettingsToggle
            title={t('settings.highContrast') || 'High Contrast'}
            subtitle={t('settings.highContrastSubtitle') || 'Increase text and UI contrast'}
            icon="contrast-outline"
            value={settings.accessibility.highContrast}
            onValueChange={() => toggleAccessibility('highContrast')}
            
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title={t('settings.privacy') || 'Privacy'} >
          <SettingsToggle
            title={t('settings.analytics') || 'Analytics'}
            subtitle={t('settings.analyticsSubtitle') || 'Help improve the app with usage data'}
            icon="analytics-outline"
            value={settings.privacy.analytics}
            onValueChange={() => togglePrivacy('analytics')}
            
          />
          
          <SettingsToggle
            title={t('settings.crashReporting') || 'Crash Reporting'}
            subtitle={t('settings.crashReportingSubtitle') || 'Send crash reports to help fix issues'}
            icon="bug-outline"
            value={settings.privacy.crashReporting}
            onValueChange={() => togglePrivacy('crashReporting')}
            
          />
        </SettingsSection>

        {/* Actions */}
        <SettingsSection title={t('settings.actions') || 'Actions'} >
          <View style={styles.actionButtons}>
            <PrimaryButton
              title={t('settings.reset') || 'Reset Settings'}
              onPress={handleResetSettings}
              variant="outline"
              icon="refresh-outline"
              
              style={styles.resetButton}
              loading={saving}
            />
          </View>
        </SettingsSection>

        {/* Ministry Apps */}
        <View style={styles.ministrySection}>
          <Text style={styles.ministrySectionTitle}>
            {t('settings.ministryApps.sectionTitle') || 'Discover Ministry Apps'}
          </Text>
          <Text style={styles.ministrySectionSubtitle}>
            {t('settings.ministryApps.sectionSubtitle') || 'Tools to strengthen your ministry and worship'}
          </Text>
          <MinistryAppCard
            logo={require('../../assets/mslm-logo.png') as ImageSourcePropType}
            badge={t('settings.ministryApps.mslmBadge') || 'Worship Music'}
            appName={t('settings.ministryApps.mslmName') || 'Music Sheet Lineup Manager'}
            tagline={t('settings.ministryApps.mslmTagline') || 'by Selah Studio'}
            description={
              t('settings.ministryApps.mslmDesc') ||
              'Organize worship sets, view sheet music, transpose keys, and collaborate with your music ministry team.'
            }
            url="https://mslm.selahstudio.ph"
            accentColor="#57378c"
            getAppLabel={t('settings.ministryApps.getApp') || 'Get App'}
          />
          <MinistryAppCard
            logo={require('../../assets/missionlinker-icon.png') as ImageSourcePropType}
            badge={t('settings.ministryApps.missionLinkerBadge') || 'Church & Missions'}
            appName={t('settings.ministryApps.missionLinkerName') || 'MissionLinker'}
            tagline={t('settings.ministryApps.missionLinkerTagline') || 'Connect. Serve. Transform.'}
            description={
              t('settings.ministryApps.missionLinkerDesc') ||
              'Connect churches, missionaries, and ministry partners to serve communities around the world.'
            }
            url="https://www.missionlinker.com"
            accentColor="#3A9EA5"
            getAppLabel={t('settings.ministryApps.getApp') || 'Get App'}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            ICCEC EUROPE
          </Text>
          <Text style={styles.appVersion}>
            {t('settings.version') || 'Version'} 1.0.1
          </Text>
          <Text style={styles.appVersion}>
            Powered by{' '}
            {Platform.OS === 'web' ? (
              <TouchableOpacity
                onPress={handleOpenSelahStudio}
                accessibilityLabel="Visit Selah Studio PH website"
                accessibilityRole="link"
                style={styles.selahTouchable}
              >
                <Text style={styles.selahLink}>Selah Studio PH</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.appVersion}>Selah Studio PH</Text>
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  loadingText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  sectionContent: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemRight: {
    marginLeft: theme.spacing.md,
  },
  settingsIcon: {
    marginRight: theme.spacing.md,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  settingsSubtitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
  },
  pickerOptions: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    marginTop: -theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    paddingTop: theme.spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pickerOptionSelected: {
    backgroundColor: `${theme.colors.primary[500]}10`,
  },
  pickerOptionText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    color: theme.colors.text.primary,
  },
  pickerOptionTextSelected: {
    color: theme.colors.primary[500],
    fontWeight: '500',
  },
  actionButtons: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  resetButton: {
    marginBottom: theme.spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  appInfoText: {
    fontSize: getScaledFontSize(theme.typography.fontSize['2xl']),
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  appVersion: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
  },
  selahLink: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    color: theme.colors.primary[500],
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  selahTouchable: {
    alignSelf: 'flex-start',
  },
  // ── Ministry Apps ──────────────────────────────────────────────
  ministrySection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  ministrySectionTitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  ministrySectionSubtitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  ministryCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  ministryAccentBar: {
    height: 4,
    width: '100%',
  },
  ministryCardBody: {
    padding: theme.spacing.md,
  },
  ministryCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  ministryIconWrap: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    flexShrink: 0,
  },
  ministryLogo: {
    width: '100%',
    height: '100%',
  },
  ministryCardMeta: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  ministryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full ?? 999,
    marginBottom: theme.spacing.xs,
  },
  ministryBadgeText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ministryAppName: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 1,
  },
  ministryTagline: {
    fontSize: getScaledFontSize(theme.typography.fontSize.xs),
    fontWeight: '500',
  },
  ministryDescription: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    lineHeight: getScaledFontSize(theme.typography.fontSize.sm) * 1.55,
    marginBottom: theme.spacing.md,
  },
  ministryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  ministryButtonIcon: {
    marginRight: theme.spacing.xs,
  },
  ministryButtonText: {
    flex: 1,
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});
