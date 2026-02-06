// Enhanced theme hook that incorporates user settings
// This provides a theme that dynamically adjusts based on user preferences

import { useMemo } from 'react';
import { useSettings } from './useSettings';
import { lightTheme, darkTheme } from '../styles/theme';
import { ThemeMode } from '../types/Settings';
import { Appearance } from 'react-native';
import type { Theme } from '../styles/theme';
import { getLiturgicalSeason } from '../utils/liturgicalSeason';
import { LiturgicalColors } from '../styles/liturgicalColors';

/**
 * Hook that returns a theme object with user settings applied
 * Handles theme mode, font scaling, accessibility preferences, and LITURGICAL SEASON COLORS
 */
export const useTheme = (): Theme & { userFontSize: string, season: string } => {
  const { settings } = useSettings();
  
  // Calculate liturgical season once (could be optimized to update on midnight, but fine for now)
  const liturgicalInfo = useMemo(() => {
    try {
      return getLiturgicalSeason(new Date());
    } catch (e) {
      console.warn('Error calculating liturgical season', e);
      return { season: 'ordinary', color: 'green' }; // Fallback
    }
  }, []); // Empty dependency array means evaluated once per mount/session - effectively static for the session

  return useMemo(() => {
    // Determine effective theme based on user preference
    let effectiveTheme: Theme;
    
    if (!settings) {
      effectiveTheme = { ...lightTheme };
    } else {
      switch (settings.theme) {
        case ThemeMode.DARK:
          effectiveTheme = { ...darkTheme };
          break;
        case ThemeMode.LIGHT:
          effectiveTheme = { ...lightTheme };
          break;
        case ThemeMode.SYSTEM:
        default:
          // Use system appearance
          const colorScheme = Appearance.getColorScheme();
          effectiveTheme = colorScheme === 'dark' ? { ...darkTheme } : { ...lightTheme };
          break;
      }
    }

    // --- LITURGICAL SEASON DYNAMIC THEMING ---
    // Override primary color based on the liturgical day
    // This allows the app to "breathe" with the church calendar
    try {
      const seasonColor = liturgicalInfo.color;
      let newPrimaryPalette;
      
      switch (seasonColor) {
        case 'green':
          newPrimaryPalette = LiturgicalColors.green;
          break;
        case 'purple':
          newPrimaryPalette = LiturgicalColors.purple;
          break;
        case 'gold':
        case 'white': 
          newPrimaryPalette = LiturgicalColors.gold;
          break;
        case 'red':
          newPrimaryPalette = LiturgicalColors.red;
          break;
        default:
          // In case of unknown color, do NOT override. 
          // Keep the effectiveTheme's primary (which is already dark-mode safe)
          newPrimaryPalette = null;
      }

      // Apply the override safely using immutable update pattern
      // Only if we have a valid specific liturgical palette to apply
      if (newPrimaryPalette) {
        
        // Dark Mode Optimization Check
        // If we are in dark mode, we might want to ensure the applied palette is accessible.
        // The LiturgicalColors (Green, Purple, Gold, Red) 500-tokens are generally bright enough 
        // to work on dark backgrounds with dark text. 
        // However, if we wanted to be 100% strictly Material, we would shift indices here.
        // For now, these specific palettes are validated as legible.

        effectiveTheme = {
          ...effectiveTheme,
          colors: {
            ...effectiveTheme.colors,
            primary: newPrimaryPalette
          }
        };
      }
      
    } catch (error) {
       console.error('Failed to apply liturgical theme:', error);
       // Fail silently and keep default theme (which is dark-mode safe) to ensure robustness
    }
    // -----------------------------------------

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
      season: liturgicalInfo.season // Expose season name for UI usage
    };
  }, [settings, liturgicalInfo]);
};


export default useTheme;
