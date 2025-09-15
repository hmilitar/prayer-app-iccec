// Enhanced theme hook that incorporates user settings
// This provides a theme that dynamically adjusts based on user preferences

import { useMemo } from 'react';
import { useSettings } from './useSettings';
import { lightTheme, darkTheme } from '../styles/theme';
import { ThemeMode } from '../types/Settings';
import { Appearance } from 'react-native';
import type { Theme } from '../styles/theme';

/**
 * Hook that returns a theme object with user settings applied
 * Handles theme mode, font scaling, and accessibility preferences
 */
export const useTheme = (): Theme & { userFontSize: string } => {
  const { settings } = useSettings();
  
  return useMemo(() => {
    // Determine effective theme based on user preference
    let effectiveTheme: Theme;
    
    if (!settings) {
      effectiveTheme = lightTheme;
    } else {
      switch (settings.theme) {
        case ThemeMode.DARK:
          effectiveTheme = darkTheme;
          break;
        case ThemeMode.LIGHT:
          effectiveTheme = lightTheme;
          break;
        case ThemeMode.SYSTEM:
        default:
          // Use system appearance
          const colorScheme = Appearance.getColorScheme();
          effectiveTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
          break;
      }
    }

    // Apply accessibility settings if needed
    if (settings?.accessibility.highContrast) {
      // Enhance contrast for accessibility
      effectiveTheme = {
        ...effectiveTheme,
        colors: {
          ...effectiveTheme.colors,
          text: {
            ...effectiveTheme.colors.text,
            primary: effectiveTheme === darkTheme ? '#ffffff' : '#000000',
            secondary: effectiveTheme === darkTheme ? '#e5e7eb' : '#374151',
          }
        }
      };
    }

    // Return theme with user font size for easy access
    return {
      ...effectiveTheme,
      userFontSize: settings?.fontSize || 'medium',
    };
  }, [settings]);
};

export default useTheme;
