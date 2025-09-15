// TileCard component - Reusable card component for navigation tiles

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';

export interface TileCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'secondary';
}

export default function TileCard({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  accessibilityLabel,
  testID,
  style,
  variant = 'default'
}: Readonly<TileCardProps>) {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  const getContainerStyle = () => {
    if (variant === 'primary') {
      return [styles.container, styles.primaryContainer];
    } else if (variant === 'secondary') {
      return [styles.container, styles.secondaryContainer];
    }
    
    return [styles.container];
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (variant === 'primary') return theme.colors.text.inverse;
    return theme.colors.primary[500];
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityHint={subtitle ? `${title}. ${subtitle}` : title}
      testID={testID}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={32}
              color={getIconColor()}
            />
          </View>
        )}
        <Text style={[
          styles.title,
          variant === 'primary' && styles.primaryTitle
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            styles.subtitle,
            variant === 'primary' && styles.primarySubtitle
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    minHeight: 120,
    ...theme.shadows.md,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary[500],
  },
  secondaryContainer: {
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  primaryTitle: {
    color: theme.colors.text.inverse,
  },
  subtitle: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  primarySubtitle: {
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
});