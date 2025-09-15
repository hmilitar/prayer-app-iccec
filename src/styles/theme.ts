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
      50: '#fdf2f2',
      100: '#fde2e2',
      200: '#fbc9c9',
      300: '#f7a3a3',
      400: '#f26464',
      500: '#490107', // Main brand color
      600: '#3d0106',
      700: '#310105',
      800: '#250104',
      900: '#190103'
    },
    secondary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f48402', // Accent brand color
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12'
    },
    semantic: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb'
    },
    text: {
      primary: '#ffffff',
      secondary: '#e5e7eb',
      tertiary: '#9ca3af',
      inverse: '#1f2937'
    },
    background: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151'
    },
    surface: {
      primary: '#1f2937',
      secondary: '#374151',
      tertiary: '#4b5563',
      elevated: '#374151'
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