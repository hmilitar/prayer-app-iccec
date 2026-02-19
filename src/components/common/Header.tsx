// Header component - Reusable header for screens

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';
import { getSpacing, getHeaderHeight, getIconSize } from '../../utils/responsive';
import type { Theme } from '../../styles/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
  style?: ViewStyle;
  variant?: 'default' | 'transparent' | 'elevated';
}

export default function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
  leftAction,
  style,
  variant = 'default'
}: Readonly<HeaderProps>) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const getContainerStyle = () => {
    if (variant === 'transparent') {
      return [styles.container, styles.transparentContainer];
    } else if (variant === 'elevated') {
      return [styles.container, styles.elevatedContainer];
    }
    
    return [styles.container];
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    }
  };

  return (
    <View style={[getContainerStyle(), style]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBackPress}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
        {leftAction && !showBackButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={leftAction.onPress}
            accessibilityLabel={leftAction.accessibilityLabel}
            accessibilityRole="button"
          >
            <Ionicons
              name={leftAction.icon}
              size={getIconSize('medium')}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerSection} accessibilityRole="header">
        <Text
          style={styles.title}
          numberOfLines={1}
          accessibilityLabel={title}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={styles.subtitle}
            numberOfLines={1}
            accessibilityLabel={subtitle}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      
      <View style={styles.rightSection}>
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            accessibilityLabel={rightAction.accessibilityLabel}
            accessibilityRole="button"
          >
            <Ionicons
              name={rightAction.icon}
              size={getIconSize('medium')}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme & { userFontSize: string }) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(2),
    paddingVertical: getSpacing(1.5),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
    minHeight: getHeaderHeight(),
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  elevatedContainer: {
    shadowColor: theme.colors.text.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 0,
  },
  leftSection: {
    width: getSpacing(6),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getSpacing(1),
  },
  rightSection: {
    width: getSpacing(6),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionButton: {
    padding: getSpacing(1),
    borderRadius: getSpacing(1),
    minWidth: getSpacing(5),
    minHeight: getSpacing(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: getScaledFontSize(18, theme.userFontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.medium,
  },
  subtitle: {
    fontSize: getScaledFontSize(14, theme.userFontSize),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: getSpacing(0.25),
    fontFamily: theme.typography.fontFamily.regular,
    fontStyle: 'italic',
  },
});