// PrimaryButton component - Reusable button component

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../styles/theme';
import { useTheme } from '../../hooks/useTheme';
import { getScaledFontSize } from '../../utils/fontScaling';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
  testID,
  style
}: Readonly<PrimaryButtonProps>) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const styles = createStyles(theme);

  const getButtonStyle = () => {
    const buttonStyles: any[] = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      buttonStyles.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      buttonStyles.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      buttonStyles.push(styles.outlineButton);
    } else if (variant === 'ghost') {
      buttonStyles.push(styles.ghostButton);
    }
    
    if (isDisabled) {
      buttonStyles.push(styles.disabledButton);
    }
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    return buttonStyles;
  };

  const getTextStyle = () => {
    const textStyles: any[] = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (variant === 'primary') {
      textStyles.push(styles.primaryText);
    } else if (variant === 'secondary') {
      textStyles.push(styles.secondaryText);
    } else if (variant === 'outline') {
      textStyles.push(styles.outlineText);
    } else if (variant === 'ghost') {
      textStyles.push(styles.ghostText);
    }
    
    if (isDisabled) {
      textStyles.push(styles.disabledText);
    }
    
    return textStyles;
  };

  const getIconColor = () => {
    if (isDisabled) return theme.colors.text.tertiary;
    if (variant === 'primary') return theme.colors.text.inverse;
    if (variant === 'secondary') return theme.colors.text.primary;
    if (variant === 'outline' || variant === 'ghost') return theme.colors.primary[500];
    return theme.colors.text.primary;
  };

  const getLoadingColor = () => {
    if (variant === 'primary') return theme.colors.text.inverse;
    return theme.colors.primary[500];
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getLoadingColor()} />;
    }

    if (icon) {
      const iconSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;
      const iconElement = (
        <Ionicons
          name={icon}
          size={iconSize}
          color={getIconColor()}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );

      return (
        <>
          {iconPosition === 'left' && iconElement}
          <Text style={getTextStyle()}>{title}</Text>
          {iconPosition === 'right' && iconElement}
        </>
      );
    }

    return <Text style={getTextStyle()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: theme.spacing.sm + theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: theme.spacing.lg - theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.tertiary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderColor: theme.colors.background.tertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.sm),
  },
  mediumText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.base),
  },
  largeText: {
    fontSize: getScaledFontSize(theme.typography.fontSize.lg),
  },
  primaryText: {
    color: theme.colors.text.inverse,
  },
  secondaryText: {
    color: theme.colors.text.primary,
  },
  outlineText: {
    color: theme.colors.primary[500],
  },
  ghostText: {
    color: theme.colors.primary[500],
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
});