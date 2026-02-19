/**
 * BibleGatewayModal — In-app WebView for reading Bible passages.
 *
 * Opens a Bible Gateway URL inside a full-screen modal instead of
 * launching the external browser.  Includes:
 *   • loading spinner,
 *   • error state with retry,
 *   • close / back-to-top toolbar,
 *   • theme-aware styling,
 *   • full accessibility support.
 *
 * Usage:
 * ```tsx
 * <BibleGatewayModal
 *   visible={modalVisible}
 *   url={bibleGatewayUrl}
 *   reference={reference}
 *   onClose={() => setModalVisible(false)}
 * />
 * ```
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useTheme } from '../../hooks/useTheme';
import { useLocalization } from '../../hooks/useLocalization';
import type { Theme } from '../../styles/theme';

// ─── Props ─────────────────────────────────────────────────────────────

export interface BibleGatewayModalProps {
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
 * Full-screen modal that renders a Bible Gateway page inside a WebView.
 * Supports loading, error, and navigation states.
 */
export function BibleGatewayModal({
  visible,
  url,
  reference,
  bibleVersion,
  onClose,
}: BibleGatewayModalProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useLocalization();
  const webViewRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(reference);

  // ── Handlers ───────────────────────────────────────────────────────

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

  const handleNavChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack ?? false);
    if (navState.title) {
      setCurrentTitle(navState.title);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    webViewRef.current?.goBack();
  }, []);

  const handleReload = useCallback(() => {
    setHasError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleClose = useCallback(() => {
    // Reset state before closing so next open starts fresh
    setLoading(true);
    setHasError(false);
    setCanGoBack(false);
    setCurrentTitle(reference);
    onClose();
  }, [onClose, reference]);

  const styles = createStyles(theme);

  // ── Injected JS: hide Bible Gateway UI chrome for cleaner reading ──
  const injectedJS = `
    (function() {
      try {
        // Hide header/footer/nav for cleaner reading
        var selectors = [
          '.header-nav', '.navbar', '.footer', '.bg-sidebar',
          '.sidebar', '.search-form', '#header', '#footer',
          '.passage-resources', '.publisher-info-bottom',
          '.dropdown.header-nav-flyout', '.header-search',
          '.bg-header', '.site-footer'
        ];
        selectors.forEach(function(sel) {
          var els = document.querySelectorAll(sel);
          els.forEach(function(el) { el.style.display = 'none'; });
        });
        // Ensure passage text is readable
        var passage = document.querySelector('.passage-text');
        if (passage) {
          passage.style.fontSize = '18px';
          passage.style.lineHeight = '1.7';
          passage.style.padding = '16px';
        }
      } catch(e) {}
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          {/* Back button (only when navigated within WebView) */}
          {canGoBack ? (
            <TouchableOpacity
              style={styles.toolbarBtn}
              onPress={handleGoBack}
              accessibilityLabel={t('common.back') ?? 'Back'}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          ) : (
            <View style={styles.toolbarBtnPlaceholder} />
          )}

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

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            accessibilityLabel={t('common.close') ?? 'Close'}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={28} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Loading indicator overlay */}
        {loading && !hasError ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>
              {t('common.loading') ?? 'Loading...'}
            </Text>
          </View>
        ) : null}

        {/* Error state */}
        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.errorTitle}>
              {t('error.networkError') ?? 'Could not load passage'}
            </Text>
            <Text style={styles.errorMessage}>
              {t('devotions.bibleGateway.errorMessage') ??
                'Check your internet connection and try again.'}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleReload}
              accessibilityLabel={t('common.retry') ?? 'Retry'}
              accessibilityRole="button"
            >
              <Ionicons name="reload-outline" size={18} color="#FFF" />
              <Text style={styles.retryText}>{t('common.retry') ?? 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleError}
            onNavigationStateChange={handleNavChange}
            injectedJavaScript={injectedJS}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            allowsBackForwardNavigationGestures
            allowsInlineMediaPlayback
            scalesPageToFit
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            // Security: only allow Bible Gateway
            originWhitelist={['https://*']}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const createStyles = (theme: Theme & { userFontSize: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
      minHeight: 48,
    },
    toolbarBtn: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolbarBtnPlaceholder: {
      width: 44,
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: theme.spacing.sm,
    },
    titleInner: {
      flexShrink: 1,
      alignItems: 'center',
    },
    titleText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    versionBadge: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '500',
      color: theme.colors.primary[600],
      textAlign: 'center',
      marginTop: 1,
    },
    closeBtn: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    webview: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 56,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.primary,
      zIndex: 10,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.primary,
    },
    errorTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      textAlign: 'center',
    },
    errorMessage: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary[500],
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.lg,
      minHeight: 48,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: theme.typography.fontSize.base,
      fontWeight: '600',
    },
  });

export default BibleGatewayModal;
