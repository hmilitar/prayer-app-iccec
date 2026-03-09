// Responsive utilities for consistent cross-device UI/UX

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Check if running on web platform
export const isWebPlatform = (): boolean => {
  return Platform.OS === 'web';
};

// Web-specific breakpoints (in pixels)
export const WEB_BREAKPOINTS = {
  small: 640,    // Mobile landscape
  medium: 768,  // Tablet portrait
  large: 1024,  // Tablet landscape / small desktop
  xlarge: 1280, // Desktop
  xxlarge: 1536, // Large desktop
} as const;

// Determine if we're on a web device with a large screen
export const getWebDeviceType = (): 'web-mobile' | 'web-tablet' | 'web-desktop' | 'web-large' => {
  if (!isWebPlatform()) return 'web-mobile';
  
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.xlarge) return 'web-large';
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.large) return 'web-desktop';
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.medium) return 'web-tablet';
  return 'web-mobile';
};

export const WEB_DEVICE_TYPE = getWebDeviceType();

// Device types based on screen dimensions
export const getDeviceType = () => {
  if (Platform.OS === 'ios') {
    // iPhone SE (1st gen): 320x568
    // iPhone SE (2nd/3rd gen): 375x667
    // iPhone 8: 375x667
    // iPhone 8 Plus: 414x736
    // iPhone X/XS: 375x812
    // iPhone XR/11: 414x896
    // iPhone 12/13/14 mini: 375x812
    // iPhone 12/13/14: 390x844
    // iPhone 12/13/14 Plus: 428x926
    // iPhone 14 Pro: 393x852
    // iPhone 14 Pro Max: 430x932
    // iPad Mini: 768x1024
    // iPad: 768x1024 / 820x1180 (newer)
    // iPad Pro 11": 834x1194
    // iPad Pro 12.9": 1024x1366
    
    if (SCREEN_WIDTH >= 1024) return 'tablet-large'; // iPad Pro 12.9"
    if (SCREEN_WIDTH >= 768) return 'tablet'; // iPad
    if (SCREEN_WIDTH >= 428) return 'phone-large'; // iPhone Plus/Pro Max
    if (SCREEN_WIDTH >= 390) return 'phone-medium'; // iPhone 12/13/14
    if (SCREEN_WIDTH >= 375) return 'phone-regular'; // iPhone X/11/12 mini
    return 'phone-small'; // iPhone SE
  } else {
    // Android devices vary widely, use general categories
    if (SCREEN_WIDTH >= 900) return 'tablet-large';
    if (SCREEN_WIDTH >= 600) return 'tablet';
    if (SCREEN_WIDTH >= 412) return 'phone-large';
    if (SCREEN_WIDTH >= 360) return 'phone-medium';
    return 'phone-small';
  }
};

export const DEVICE_TYPE = getDeviceType();

// Base spacing unit
const BASE_SPACING = 8;

// Responsive spacing based on device type
export const getSpacing = (multiplier: number = 1): number => {
  const deviceMultipliers = {
    'phone-small': 0.8,
    'phone-regular': 1.0,
    'phone-medium': 1.1,
    'phone-large': 1.2,
    'tablet': 1.4,
    'tablet-large': 1.6,
  };
  
  return BASE_SPACING * multiplier * deviceMultipliers[DEVICE_TYPE];
};

// Responsive font size
export const getFontSize = (baseSize: number): number => {
  const deviceMultipliers = {
    'phone-small': 0.9,
    'phone-regular': 1.0,
    'phone-medium': 1.0,
    'phone-large': 1.0,
    'tablet': 1.1,
    'tablet-large': 1.2,
  };
  
  const scaledSize = baseSize * deviceMultipliers[DEVICE_TYPE];
  
  // Apply pixel ratio scaling for better text rendering
  const pixelRatio = PixelRatio.get();
  if (pixelRatio >= 3) {
    return Math.round(scaledSize * 1.02); // Slight increase for high-density screens
  } else if (pixelRatio < 2) {
    return Math.round(scaledSize * 0.98); // Slight decrease for low-density screens
  }
  
  return Math.round(scaledSize);
};

// Responsive dimensions
export const getResponsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const getResponsiveHeight = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Minimum touch target size (44pt for iOS, 48dp for Android)
export const getMinTouchTarget = (): number => {
  return Platform.OS === 'ios' ? 44 : 48;
};

// Tab bar height calculations
export const getTabBarHeight = (): number => {
  const baseHeight = Platform.OS === 'ios' ? 80 : 60;
  
  const deviceAdjustments = {
    'phone-small': -8,
    'phone-regular': 0,
    'phone-medium': 0,
    'phone-large': 4,
    'tablet': 12,
    'tablet-large': 16,
  };
  
  return baseHeight + deviceAdjustments[DEVICE_TYPE];
};

// Safe area padding for screens
export const getSafeAreaPadding = () => {
  return {
    horizontal: getSpacing(2), // 16pt base
    vertical: getSpacing(1), // 8pt base
    bottom: getSpacing(1), // Additional bottom padding
  };
};

// Header height
export const getHeaderHeight = (): number => {
  if (DEVICE_TYPE.includes('tablet')) {
    return Platform.OS === 'ios' ? 64 : 60;
  }
  return Platform.OS === 'ios' ? 56 : 52;
};

// Content padding that accounts for tab bar
export const getContentPadding = () => {
  const tabBarHeight = getTabBarHeight();
  const safeArea = getSafeAreaPadding();
  
  return {
    ...safeArea,
    // Add extra bottom padding to prevent content from being hidden behind tab bar
    bottom: safeArea.bottom + (Platform.OS === 'ios' ? 4 : 8),
  };
};

// Responsive border radius
export const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium'): number => {
  const baseSizes = {
    small: 4,
    medium: 8,
    large: 12,
  };
  
  const deviceMultipliers = {
    'phone-small': 0.8,
    'phone-regular': 1.0,
    'phone-medium': 1.0,
    'phone-large': 1.0,
    'tablet': 1.2,
    'tablet-large': 1.4,
  };
  
  return Math.round(baseSizes[size] * deviceMultipliers[DEVICE_TYPE]);
};

// Check if device has notch or dynamic island
export const hasNotch = (): boolean => {
  if (Platform.OS === 'android') return false;
  
  // iPhone X and newer have notch or dynamic island
  return SCREEN_HEIGHT >= 812 || (SCREEN_WIDTH >= 375 && SCREEN_HEIGHT >= 812);
};

// Get appropriate icon size for device
export const getIconSize = (size: 'small' | 'medium' | 'large' = 'medium'): number => {
  const baseSizes = {
    small: 16,
    medium: 24,
    large: 32,
  };
  
  const deviceMultipliers = {
    'phone-small': 0.9,
    'phone-regular': 1.0,
    'phone-medium': 1.0,
    'phone-large': 1.0,
    'tablet': 1.3,
    'tablet-large': 1.5,
  };
  
  return Math.round(baseSizes[size] * deviceMultipliers[DEVICE_TYPE]);
};

// Screen dimensions helper
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: DEVICE_TYPE === 'phone-small',
  isTablet: DEVICE_TYPE.includes('tablet'),
  hasNotch: hasNotch(),
  isWeb: isWebPlatform(),
  isWebLarge: WEB_DEVICE_TYPE === 'web-desktop' || WEB_DEVICE_TYPE === 'web-large',
};

// Maximum content width for readability on larger screens
export const getContentMaxWidth = (): number | '100%' => {
  // On mobile platforms, use full width
  if (!isWebPlatform()) {
    return '100%';
  }
  
  // On web, limit content width for readability
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.xlarge) return 900;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.large) return 800;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.medium) return 720;
  return '100%';
};

// Sidebar width for web navigation
export const getSidebarWidth = (): number => {
  if (!isWebPlatform()) return 0;
  
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.xlarge) return 280;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.large) return 260;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.medium) return 240;
  return 0;
};

// Check if we should show sidebar navigation
export const shouldShowSidebar = (): boolean => {
  if (!isWebPlatform()) return false;
  return SCREEN_WIDTH >= WEB_BREAKPOINTS.medium;
};

// Get web-specific spacing multiplier
export const getWebSpacingMultiplier = (): number => {
  if (!isWebPlatform()) return 1;
  
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.xlarge) return 1.4;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.large) return 1.2;
  if (SCREEN_WIDTH >= WEB_BREAKPOINTS.medium) return 1.1;
  return 1;
};

export default {
  getDeviceType,
  getSpacing,
  getFontSize,
  getResponsiveWidth,
  getResponsiveHeight,
  getMinTouchTarget,
  getTabBarHeight,
  getSafeAreaPadding,
  getHeaderHeight,
  getContentPadding,
  getBorderRadius,
  hasNotch,
  getIconSize,
  screen,
  DEVICE_TYPE,
  isWebPlatform,
  getWebDeviceType,
  WEB_DEVICE_TYPE,
  WEB_BREAKPOINTS,
  getContentMaxWidth,
  getSidebarWidth,
  shouldShowSidebar,
  getWebSpacingMultiplier,
};
