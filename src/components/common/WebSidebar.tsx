// WebSidebar - Elegant sidebar navigation for web with Christian ambiance
// Features warm, spiritual design elements that create a serene atmosphere

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocalization } from '../../hooks/useLocalization';
import { useTheme } from '../../hooks/useTheme';
import { getSpacing, getSidebarWidth, isWebPlatform, screen } from '../../utils/responsive';
import { getScaledFontSize } from '../../utils/fontScaling';
import type { Theme } from '../../styles/theme';

export interface WebSidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  style?: object;
}

// Navigation items with spiritual labels
interface NavItem {
  name: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { 
    name: 'Home', 
    labelKey: 'navigation.home', 
    icon: 'home', 
    iconOutline: 'home-outline' 
  },
  { 
    name: 'DailyReadings', 
    labelKey: 'navigation.dailyReadings', 
    icon: 'book', 
    iconOutline: 'book-outline' 
  },
  { 
    name: 'Prayers', 
    labelKey: 'navigation.prayers', 
    icon: 'heart', 
    iconOutline: 'heart-outline' 
  },
  { 
    name: 'Settings', 
    labelKey: 'navigation.settings', 
    icon: 'settings', 
    iconOutline: 'settings-outline' 
  },
];

export default function WebSidebar({ currentRoute, onNavigate, style }: WebSidebarProps): React.ReactElement | null {
  // Return null if not on web platform - ensures mobile is unaffected
  if (!isWebPlatform()) {
    return <></>;
  }

  const { t } = useLocalization();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);
  
  const handleNavPress = (routeName: string) => {
    onNavigate(routeName);
  };

  return (
    <View 
      style={[styles.container, style]}
      accessibilityLabel="Navigation sidebar"
    >
      {/* Elegant Header with Cross Symbol */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons 
            name="rose-outline" 
            size={36} 
            color={theme.colors.primary[500]} 
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>
            {t('app.name') || 'Cenacle'}
          </Text>
          <Text style={styles.appSubtitle}>
            {t('app.subtitle') || '(Upper Room)'}
          </Text>
        </View>
      </View>

      {/* Decorative Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerOrnament}>
          <Ionicons name="flower" size={12} color={theme.colors.primary[300]} />
        </View>
        <View style={styles.dividerLine} />
      </View>

      {/* Navigation Items with enhanced styling */}
      <View style={styles.navContainer}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.name;
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
              ]}
              onPress={() => handleNavPress(item.name)}
              accessibilityLabel={t(item.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              activeOpacity={0.7}
            >
              <View style={styles.navItemContent}>
                {isActive && (
                  <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary[500] }]} />
                )}
                <View style={[styles.navIconContainer, isActive && styles.navIconContainerActive]}>
                  <Ionicons
                    name={isActive ? item.icon : item.iconOutline}
                    size={22}
                    color={isActive ? theme.colors.primary[500] : theme.colors.text.secondary}
                  />
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    isActive && styles.navLabelActive,
                  ]}
                >
                  {t(item.labelKey)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Spiritual Quote Section */}
      <View style={styles.quoteContainer}>
        <View style={styles.quoteIconContainer}>
          <Ionicons 
            name="book-outline" 
            size={18} 
            color={theme.colors.primary[400]} 
          />
        </View>
        <Text style={styles.quoteText}>
          "Peace I leave with you, my peace I give to you."
        </Text>
        <Text style={styles.quoteReference}>
          — John 14:27
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.versionText}>
          v1.0.0 • Cenacle Prayer App
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, insets: { top: number; bottom: number; left: number; right: number }) => 
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      backgroundColor: theme.colors.surface.secondary,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border.light,
      paddingTop: Math.max(insets.top, 24) + 8,
      paddingBottom: Math.max(insets.bottom, 16) + 8,
      zIndex: 100,
      // Subtle shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 8,
    },
    logoContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${theme.colors.primary[50] || '#fff5f5'}`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      borderWidth: 1,
      borderColor: `${theme.colors.primary[100] || '#fecaca'}`,
    },
    titleContainer: {
      flex: 1,
    },
    appName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text.primary,
      letterSpacing: 0.5,
    },
    appSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
      marginTop: 2,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginVertical: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border.light,
    },
    dividerOrnament: {
      paddingHorizontal: 12,
    },
    navContainer: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    navItem: {
      marginVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    navItemActive: {
      backgroundColor: `${theme.colors.primary[50] || '#fff5f5'}`,
    },
    navItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      position: 'relative',
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: 8,
      bottom: 8,
      width: 4,
      borderRadius: 2,
    },
    navIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    navIconContainerActive: {
      backgroundColor: `${theme.colors.primary[100] || '#fee2e2'}`,
    },
    navLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      flex: 1,
      letterSpacing: 0.3,
    },
    navLabelActive: {
      color: theme.colors.primary[600],
      fontWeight: '600',
    },
    quoteContainer: {
      marginHorizontal: 16,
      marginVertical: 20,
      padding: 16,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary[500],
    },
    quoteIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary[100] || '#fee2e2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    quoteText: {
      fontSize: 14,
      fontStyle: 'italic',
      color: '#1f2937',
      lineHeight: 22,
      marginTop: 4,
    },
    quoteReference: {
      fontSize: 12,
      color: '#1f2937',
      marginTop: 10,
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    footerDivider: {
      height: 1,
      backgroundColor: theme.colors.border.light,
      marginBottom: 12,
    },
    versionText: {
      fontSize: 11,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
    },
  });
