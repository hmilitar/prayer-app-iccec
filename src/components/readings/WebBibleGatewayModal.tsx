/**
 * WebBibleGatewayModal — Web-compatible modal for reading Bible passages.
 *
 * Uses an iframe to embed Bible Gateway on web platform, providing:
 *   • Full-screen modal overlay
 *   • Loading state with spinner
 *   • Close button in header
 *   • Responsive design
 *
 * This component is a web-specific alternative to the mobile BibleGatewayModal
 * which uses react-native-webview (not compatible with web browsers).
 *
 * Usage:
 * ```tsx
 * <WebBibleGatewayModal
 *   visible={modalVisible}
 *   url={bibleGatewayUrl}
 *   reference={reference}
 *   onClose={() => setModalVisible(false)}
 * />
 * ```
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import type { Theme } from '../../styles/theme';

// ─── Props ─────────────────────────────────────────────────────────────

export interface WebBibleGatewayModalProps {
  /** Whether the modal is visible */
  readonly visible: boolean;
  /** Full Bible Gateway URL to load */
  readonly url: string;
  /** Human-readable scripture reference (e.g. "John 3:16-21") */
  readonly reference: string;
  /** BibleGateway version code displayed as a badge (e.g. "NKJV", "MBBTAG") */
  readonly bibleVersion?: string;
  /** Callback to close the modal */
  readonly onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────

/**
 * Web-compatible modal that renders a Bible Gateway page inside an iframe.
 * Provides a clean reading experience similar to the mobile WebView version.
 */
export function WebBibleGatewayModal({
  visible,
  url,
  reference,
  bibleVersion,
  onClose,
}: WebBibleGatewayModalProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useLocalization();

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when modal opens with new content
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setHasError(false);
    }
  }, [visible, url]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setHasError(false);
    // Force iframe reload by toggling key
  }, []);

  const styles = createStyles(theme);

  // On non-web platforms, render nothing (mobile uses BibleGatewayModal)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return <></>;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityLabel={t('common.close') ?? 'Close'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={28} color={theme.colors.text.secondary} />
          </TouchableOpacity>

          {/* Title & version badge */}
          <View style={styles.titleContainer}>
            <Ionicons name="book-outline" size={16} color={theme.colors.primary[500]} />
            <View style={styles.titleInner}>
              <Text
                style={styles.titleText}
                numberOfLines={1}
                accessibilityRole="header"
              >
                {reference}
              </Text>
              {bibleVersion ? (
                <Text
                  style={styles.versionBadge}
                  numberOfLines={1}
                  accessibilityLabel={`${t('readings.version') || 'Version'}: ${bibleVersion}`}
                >
                  {bibleVersion}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Placeholder for symmetry */}
          <View style={styles.placeholder} />
        </View>

        {/* Loading indicator overlay */}
        {loading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>
              {t('common.loading') ?? 'Loading...'}
            </Text>
          </View>
        )}

        {/* Error state */}
        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={64}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.errorTitle}>
              {t('error.networkError') ?? 'Could not load passage'}
            </Text>
            <Text style={styles.errorMessage}>
              {t('devotions.bibleGateway.errorMessage') ??
                'Check your internet connection and try again.'}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRetry}
              accessibilityLabel={t('common.retry') ?? 'Retry'}
              accessibilityRole="button"
            >
              <Ionicons name="reload-outline" size={18} color="#FFF" />
              <Text style={styles.retryText}>{t('common.retry') ?? 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 
           * Web-only: Use iframe for Bible Gateway embedding.
           * The iframe creates a browsing context for the external website.
           */
          <View style={styles.iframeContainer}>
            {visible && url && (
              <iframe
                key={url} // Force reload on URL change
                src={url}
                style={styles.iframe}
                title={`Bible Gateway - ${reference}`}
                onLoad={handleLoadEnd}
                onError={handleError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.background.tertiary,
      minHeight: 56,
    },
    closeBtn: {
      padding: theme.spacing.xs,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    titleInner: {
      alignItems: 'center',
    },
    titleText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    versionBadge: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    placeholder: {
      minWidth: 44,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 10,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    errorTitle: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    errorMessage: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary[500],
      borderRadius: theme.borderRadius.md,
    },
    retryText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    iframeContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    iframe: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderWidth: 0,
    } as any,
  });
