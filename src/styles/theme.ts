// Theme configuration based on technical specification

import { ViewStyle } from 'react-native';
import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';

export interface Theme {
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    spiritual?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    serene?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    surface: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    border: {
      light: string;
      medium: string;
      strong: string;
    };
  };
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    sm: ViewStyle;
    md: ViewStyle;
    lg: ViewStyle;
  };
}

export const lightTheme: Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5
    }
  }
};

export const darkTheme: Theme = {
  colors: {
    primary: {
      50: '#1a0a0a',
      100: '#2d1515',
      200: '#3d2020',
      300: '#5c2b2b',
      400: '#7a3b3b',
      500: '#d94444', // Main brand color - rose-red
      600: '#ef4444',
      700: '#f87171',
      800: '#fca5a5',
      900: '#fecaca'
    },
    secondary: {
      50: '#1a1405',
      100: '#332909',
      200: '#4d3d0d',
      300: '#6b5212',
      400: '#8a6b17',
      500: '#f59e0b', // Accent brand color - golden amber
      600: '#fbbf24',
      700: '#fcd34d',
      800: '#fef3c7',
      900: '#fffbeb'
    },
    spiritual: {
      50: '#052e16',
      100: '#064e3b',
      200: '#065f46',
      300: '#047857',
      400: '#059669',
      500: '#10b981',
      600: '#34d399',
      700: '#6ee7b7',
      800: '#a7f3d0',
      900: '#d1fae5'
    },
    serene: {
      50: '#0c1929',
      100: '#1e3a5f',
      200: '#1e40af',
      300: '#2563eb',
      400: '#3b82f6',
      500: '#60a5fa',
      600: '#93c5fd',
      700: '#bfdbfe',
      800: '#dbeafe',
      900: '#eff6ff'
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      tertiary: '#9ca3af',
      inverse: '#1f2937'
    },
    background: {
      primary: '#0f1315',
      secondary: '#1a1d21',
      tertiary: '#252a30'
    },
    surface: {
      primary: '#1a1d21',
      secondary: '#23282e',
      tertiary: '#2d333b',
      elevated: '#23282e'
    },
    border: {
      light: '#374151',
      medium: '#4b5563',
      strong: '#6b7280'
    }
  },
  typography: Typography,
  spacing: Spacing,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5
    }
  }
};