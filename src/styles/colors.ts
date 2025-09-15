// Design system colors based on modern brand identity

export const Colors = {
  primary: {
    50: '#fdf2f2',
    100: '#fde2e2',
    200: '#fbc9c9',
    300: '#f7a3a3',
    400: '#f26464',
    500: '#490107', // Main brand color - deep burgundy
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
    500: '#f48402', // Accent brand color - vibrant orange
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
    primary: '#1f2937',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    inverse: '#ffffff'
  },
  background: {
    primary: '#ffffff',
    secondary: '#fefefe',
    tertiary: '#f9fafb'
  },
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff'
  },
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    strong: '#9ca3af'
  }
} as const;