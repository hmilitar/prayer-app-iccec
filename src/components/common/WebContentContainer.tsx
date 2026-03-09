// WebContentContainer - Wrapper component for limiting content width on larger screens
// This component ensures readable line lengths on desktop/tablet while
// maintaining full-width layout on mobile

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
}

/**
 * A container that limits content width on larger screens for better readability.
 * On mobile, it renders as a full-width container.
 * On web/tablet, it centers content with a maximum width.
 */
export default function WebContentContainer({
  children,
  style,
  maxWidth: customMaxWidth,
  withPadding = true,
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
    ? Math.max(getSpacing(2), screenWidth * 0.03) // At least 16px or 3% of screen
    : 0;

  // If max width is 100% or we're not on web, render without width constraints
  if (maxWidth === '100%' || !isWeb) {
    return (
      <View 
        style={[
          styles.container, 
          withPadding && styles.padding,
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
});
