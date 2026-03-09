// Web-specific theme enhancements for Christian ambiance
// These styles are only applied on web platform to create a more elegant, spiritual feel

import { ViewStyle, TextStyle } from 'react-native';
import { isWebPlatform, getWebSpacingMultiplier } from '../utils/responsive';

// Get web-specific spacing multiplier
const getSpacingMultiplier = (): number => {
  if (!isWebPlatform()) return 1;
  return getWebSpacingMultiplier();
};

// Web-only styles that create a more desktop-app-like feel
export const webStyles = {
  // Container styles for web layout
  container: {
    backgroundColor: '#fafaf9', // Warm off-white
  } as ViewStyle,
  
  // Content area with subtle warmth
  contentArea: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 24,
    padding: 32,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  } as ViewStyle,
  
  // Card styles with subtle elevation
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  } as ViewStyle,
  
  // Primary card with accent color
  primaryCard: {
    backgroundColor: '#fef6f6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  } as ViewStyle,
  
  // Text styles for headings
  heading: {
    fontSize: 28 * getSpacingMultiplier(),
    fontWeight: '700' as const,
    color: '#1f2937',
    letterSpacing: -0.5,
    marginBottom: 16,
  } as TextStyle,
  
  // Subheading with secondary color
  subheading: {
    fontSize: 20 * getSpacingMultiplier(),
    fontWeight: '600' as const,
    color: '#4b5563',
    marginBottom: 12,
  } as TextStyle,
  
  // Body text with comfortable reading
  body: {
    fontSize: 16 * getSpacingMultiplier(),
    color: '#4b5563',
    lineHeight: 28,
  } as TextStyle,
  
  // Caption text
  caption: {
    fontSize: 14 * getSpacingMultiplier(),
    color: '#6b7280',
  } as TextStyle,
  
  // Section divider
  sectionDivider: {
    height: 1,
    backgroundColor: '#e7e5e4',
    marginVertical: 24,
  } as ViewStyle,
  
  // Grid layout for cards
  gridContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginHorizontal: -10,
  } as ViewStyle,
  
  // Navigation item
  navItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    cursor: 'pointer' as const,
    transition: 'all 0.2s ease',
  } as ViewStyle,
  
  // Nav item hover state
  navItemHover: {
    backgroundColor: '#f5f5f4',
  } as ViewStyle,
  
  // Button styles
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#d94444',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as ViewStyle,
  
  // Button text
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600' as const,
  } as TextStyle,
  
  // Input field
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  } as ViewStyle,
};

// Helper function to conditionally apply web styles
export const getWebStyle = <T extends object>(webStyle: T, mobileStyle: T): T => {
  return isWebPlatform() ? webStyle : mobileStyle;
};

// Get responsive font size based on platform
export const getResponsiveFontSize = (baseSize: number): number => {
  const multiplier = getSpacingMultiplier();
  return Math.round(baseSize * multiplier);
};

// Get responsive padding
export const getResponsivePadding = (baseSize: number): number => {
  const multiplier = getSpacingMultiplier();
  return Math.round(baseSize * multiplier);
};

export default webStyles;
