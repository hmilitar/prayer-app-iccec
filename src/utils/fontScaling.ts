// Font scaling utilities for user font size settings
// This integrates user font size preferences with the responsive design system

import { FontSize } from '../types/Settings';
import { getFontSize as getBaseFontSize } from './responsive';

// Font size multipliers based on user preference
const FONT_SIZE_MULTIPLIERS = {
  [FontSize.SMALL]: 0.875,   // 87.5% of base size
  [FontSize.MEDIUM]: 1.0,    // 100% - default
  [FontSize.LARGE]: 1.125,   // 112.5% of base size
  [FontSize.EXTRA_LARGE]: 1.25, // 125% of base size
} as const;

/**
 * Get font size that incorporates both device responsiveness and user preference
 * @param baseSize - The base font size in pixels
 * @param userFontSize - User's font size preference from settings (string or enum)
 * @returns Calculated font size with user preference applied
 */
export const getScaledFontSize = (baseSize: number, userFontSize: FontSize | string = FontSize.MEDIUM): number => {
  // First apply responsive scaling based on device
  const responsiveSize = getBaseFontSize(baseSize);
  
  // Convert string to FontSize enum if needed
  const fontSizeEnum = typeof userFontSize === 'string' ? userFontSize as FontSize : userFontSize;
  
  // Then apply user preference multiplier
  const userMultiplier = FONT_SIZE_MULTIPLIERS[fontSizeEnum] || FONT_SIZE_MULTIPLIERS[FontSize.MEDIUM];
  
  return Math.round(responsiveSize * userMultiplier);
};

/**
 * Get line height that scales with font size preference
 * @param baseLineHeight - Base line height multiplier
 * @param userFontSize - User's font size preference (string or enum)
 * @returns Adjusted line height
 */
export const getScaledLineHeight = (baseLineHeight: number, userFontSize: FontSize | string = FontSize.MEDIUM): number => {
  // Convert string to FontSize enum if needed
  const fontSizeEnum = typeof userFontSize === 'string' ? userFontSize as FontSize : userFontSize;
  const userMultiplier = FONT_SIZE_MULTIPLIERS[fontSizeEnum] || FONT_SIZE_MULTIPLIERS[FontSize.MEDIUM];
  return baseLineHeight * userMultiplier;
};

/**
 * Create a font style object with user font size applied
 * @param fontSize - Base font size
 * @param userFontSize - User's font size preference (string or enum)
 * @returns Style object with scaled font size
 */
export const createFontStyle = (fontSize: number, userFontSize: FontSize | string = FontSize.MEDIUM) => ({
  fontSize: getScaledFontSize(fontSize, userFontSize),
});

/**
 * Create typography style with user preference scaling
 * @param fontSize - Base font size
 * @param lineHeight - Base line height multiplier
 * @param userFontSize - User's font size preference (string or enum)
 * @returns Typography style object
 */
export const createTypographyStyle = (
  fontSize: number, 
  lineHeight: number, 
  userFontSize: FontSize | string = FontSize.MEDIUM
) => ({
  fontSize: getScaledFontSize(fontSize, userFontSize),
  lineHeight: getScaledLineHeight(fontSize * lineHeight, userFontSize),
});

export default {
  getScaledFontSize,
  getScaledLineHeight,
  createFontStyle,
  createTypographyStyle,
  FONT_SIZE_MULTIPLIERS,
};
