// WebContentContainer - Enhanced wrapper for web content with Christian ambiance
// Provides comfortable reading width, elegant spacing, and serene atmosphere

import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { getContentMaxWidth, isWebPlatform, getSpacing, screen } from '../../utils/responsive';

export interface WebContentContainerProps {
  children: React.ReactNode;
  style?: object;
  /**
   * Custom max width override. If not provided, uses responsive defaults.
   * Pass a number for pixel value, or '100%' for full width.
   */
  maxWidth?: number | '100%';
  /**
   * Enable horizontal padding for comfortable edge spacing
   * @default true
   */
  withPadding?: boolean;
  /**
   * Enable card-like styling with shadow for web
   * @default false
   */
  withCard?: boolean;
}

/**
 * An enhanced container that provides:
 * - Readable content widths on larger screens
 * - Comfortable whitespace and breathing room
 * - Optional card styling for a more elegant appearance
 * - Mobile-first responsive design
 */
export default function WebContentContainer({
  children,
  style,
  maxWidth: customMaxWidth,
  withPadding = true,
  withCard = false,
}: WebContentContainerProps): React.ReactElement {
  const { width: screenWidth } = useWindowDimensions();
  
  // Determine if we're on web platform
  const isWeb = isWebPlatform();
  
  // Get the max width - use custom value or responsive default
  const maxWidth = customMaxWidth !== undefined 
    ? customMaxWidth 
    : getContentMaxWidth();
  
  // Calculate padding for comfortable edge spacing on larger screens
  const horizontalPadding = withPadding && isWeb
    ? Math.max(getSpacing(2), screenWidth * 0.04) // At least 16px or 4% of screen
    : 0;

  // If max width is 100% or we're not on web, render without width constraints
  if (maxWidth === '100%' || !isWeb) {
    return (
      <View 
        style={[
          styles.container, 
          withPadding && styles.padding,
          withCard && isWeb && styles.cardWeb,
          style
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View 
      style={[
        styles.container,
        withPadding && styles.padding,
        withCard && isWeb && styles.cardWeb,
        style
      ]}
    >
      <View 
        style={[
          styles.contentWrapper,
          { 
            maxWidth: maxWidth,
            width: '100%',
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  padding: {
    paddingHorizontal: 16,
  },
  contentWrapper: {
    alignSelf: 'center',
  },
  cardWeb: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
});
