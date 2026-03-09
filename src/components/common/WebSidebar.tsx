// WebSidebar - Sidebar navigation for web/tablet platforms
// This component provides a desktop-friendly sidebar navigation
// that replaces the bottom tab bar on larger screens

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

// Navigation items configuration
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
  // Return null if not on web platform
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
      {/* Logo / App Title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons 
            name="flower" 
            size={32} 
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

      {/* Navigation Items */}
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
              <View style={styles.navIconContainer}>
                <Ionicons
                  name={isActive ? item.icon : item.iconOutline}
                  size={24}
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
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary[500] }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer / Version Info */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          v1.0.0
        </Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, insets: { top: number; bottom: number; left: number; right: number }) => 
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      backgroundColor: theme.colors.background.primary,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border.light,
      paddingTop: insets.top + getSpacing(2),
      paddingBottom: insets.bottom + getSpacing(2),
      zIndex: 100,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing(2),
      paddingVertical: getSpacing(3),
      marginBottom: getSpacing(2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    logoContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: `${theme.colors.primary[500]}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: getSpacing(2),
    },
    titleContainer: {
      flex: 1,
    },
    appName: {
      fontSize: getScaledFontSize(18),
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    appSubtitle: {
      fontSize: getScaledFontSize(12),
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    navContainer: {
      flex: 1,
      paddingHorizontal: getSpacing(1.5),
      paddingTop: getSpacing(1),
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getSpacing(1.5),
      paddingHorizontal: getSpacing(2),
      marginVertical: getSpacing(0.5),
      borderRadius: theme.borderRadius.md,
      position: 'relative',
    },
    navItemActive: {
      backgroundColor: `${theme.colors.primary[500]}10`,
    },
    navIconContainer: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: getSpacing(2),
    },
    navLabel: {
      fontSize: getScaledFontSize(15),
      fontWeight: '500',
      color: theme.colors.text.secondary,
      flex: 1,
    },
    navLabelActive: {
      color: theme.colors.primary[500],
      fontWeight: '600',
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: getSpacing(1),
      bottom: getSpacing(1),
      width: 3,
      borderRadius: 2,
    },
    footer: {
      paddingHorizontal: getSpacing(2),
      paddingVertical: getSpacing(2),
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      alignItems: 'center',
    },
    versionText: {
      fontSize: getScaledFontSize(12),
      color: theme.colors.text.tertiary,
    },
  });
