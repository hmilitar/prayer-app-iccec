// TileCard component - Reusable card component for navigation tiles
// Includes hover state support for web platforms

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';
import { isWebPlatform } from '../../utils/responsive';

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
  const isWeb = isWebPlatform();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getContainerStyle = () => {
    const baseStyles = [styles.container];
    
    if (variant === 'primary') {
      baseStyles.push(styles.primaryContainer);
    } else if (variant === 'secondary') {
      baseStyles.push(styles.secondaryContainer);
    }
    
    // Add hover state style for web
    if (isWeb && isHovered && !isPressed) {
      baseStyles.push(styles.hoverContainer);
    }
    
    // Add pressed state
    if (isPressed) {
      baseStyles.push(styles.pressedContainer);
    }
    
    return baseStyles;
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
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
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

const createStyles = (theme: Theme) => {
  const baseContainer = {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg as number,
    padding: theme.spacing.md as number,
    marginVertical: theme.spacing.sm as number,
    minHeight: 120,
    ...theme.shadows.md,
  };

  return StyleSheet.create({
    container: baseContainer,
    primaryContainer: {
      ...baseContainer,
      backgroundColor: theme.colors.primary[500],
    },
    secondaryContainer: {
      ...baseContainer,
      backgroundColor: theme.colors.background.secondary,
    },
    hoverContainer: {
      ...baseContainer,
      backgroundColor: theme.colors.background.secondary,
      transform: [{ translateY: -2 }] as any,
      ...theme.shadows.lg,
    },
    pressedContainer: {
      ...baseContainer,
      transform: [{ translateY: 1 }] as any,
      opacity: 0.9,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    } as ViewStyle,
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
};