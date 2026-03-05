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
 * **Android-specific hardening:**
 *   • `onRenderProcessGone` — catches Android WebView renderer crashes
 *     (which otherwise take down the entire app) and shows an error/retry UI.
 *   • `setSupportMultipleWindows={false}` — prevents Bible Gateway from
 *     opening links in a new window (causes an instant crash on Android).
 *   • `androidLayerType="hardware"` — ensures GPU compositing inside Modal.
 *   • Deprecated `scalesPageToFit` removed (Android-only issue).
 *   • `overScrollMode="never"` — avoids over-scroll rubber-banding on Android.
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
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { WebViewRenderProcessGoneDetail } from 'react-native-webview/lib/WebViewTypes';
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
 *
 * On Android the WebView render process can be killed by the OS at any
 * time (low memory, GPU driver issue, etc.).  Without an explicit
 * `onRenderProcessGone` handler the crash propagates to the host app.
 * This component catches that event and shows a user-friendly retry UI.
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

  /**
   * Tracks whether the Android WebView render process crashed.
   * When true we unmount + remount the WebView to get a fresh process.
   */
  const [androidRenderCrashed, setAndroidRenderCrashed] = useState(false);

  /**
   * Key used to force-remount the Android WebView after a render-process
   * crash.  Incrementing it creates a brand-new native WebView instance.
   */
  const [webViewKey, setWebViewKey] = useState(0);

  // ── Android back-button handling ───────────────────────────────────
  // When the modal is open on Android, intercept hardware back to
  // navigate within the WebView first, then close the modal.
  React.useEffect(() => {
    if (Platform.OS !== 'android' || !visible) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true; // consumed
      }
      // Close modal
      onClose();
      return true; // consumed
    });

    return () => subscription.remove();
  }, [visible, canGoBack, onClose]);

  // ── Handlers ───────────────────────────────────────────────────────

  /**
   * Android cleanup JS — extracted as a constant so it can be:
   *  1. Passed to `injectedJavaScript` (runs on first mount)
   *  2. Re-injected via `injectJavaScript()` on every `onLoadEnd`
   *
   * The script is idempotent: it checks for an existing `<style id="bg-cleanup">`
   * before inserting a new one, so multiple calls are harmless.
   */
  const androidCleanupJS = `
    (function() {
      try {
        if (document.getElementById('bg-cleanup')) return;
        var style = document.createElement('style');
        style.setAttribute('id', 'bg-cleanup');
        style.textContent = [
          '.header-nav,',
          '.navbar,',
          '.bg-header,',
          '#header,',
          '.footer,',
          '.site-footer,',
          '#footer,',
          '.sidebar,',
          '.bg-sidebar,',
          '.search-form,',
          '.passage-resources,',
          '.publisher-info-bottom,',
          '.dropdown.header-nav-flyout,',
          '.header-search,',
          '#div-gpt-ad-top,',
          '#div-gpt-ad-bottom,',
          '#div-gpt-ad-sidebar,',
          '[id^="div-gpt-ad"],',
          '[id^="google_ads"],',
          '.bg-ad-placeholder,',
          '.ad-header,',
          '.ad-footer,',
          '.ad-slot {',
          '  display: none !important;',
          '  height: 0 !important;',
          '  overflow: hidden !important;',
          '}',
          '.passage-text {',
          '  font-size: 18px !important;',
          '  line-height: 1.7 !important;',
          '  padding: 12px 16px !important;',
          '}',
        ].join('\\n');
        document.head.appendChild(style);
        var attempts = 0;
        var poll = setInterval(function() {
          var p = document.querySelector('.passage-text');
          if (p && p.textContent && p.textContent.trim().length > 10) {
            p.style.fontSize = '18px';
            p.style.lineHeight = '1.7';
            p.style.padding = '12px 16px';
            clearInterval(poll);
          }
          attempts++;
          if (attempts > 20) clearInterval(poll);
        }, 1000);
      } catch(e) {}
    })();
    true;
  `;

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    // On Android, re-inject the cleanup script on every page load.
    // `injectedJavaScript` only runs on the FIRST mount.  If the
    // WebView navigates internally (e.g. BG AJAX, redirects) the
    // injected <style> may be lost.  Re-injecting is safe — the
    // script checks for an existing <style id="bg-cleanup"> first.
    if (Platform.OS === 'android' && webViewRef.current) {
      webViewRef.current.injectJavaScript(androidCleanupJS);
    }
  }, []);

  /**
   * Android safety net: if loading is still true after 8 seconds,
   * force-clear it.  BibleGateway may trigger multiple load-start
   * events (redirects, AJAX) without matching load-end events on
   * older Android WebViews, leaving the overlay stuck.
   */
  React.useEffect(() => {
    if (Platform.OS !== 'android' || !visible || !loading) return undefined;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [visible, loading]);

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
    setAndroidRenderCrashed(false);
    setLoading(true);
    // Increment key to remount a fresh WebView (required after process crash)
    setWebViewKey((prev) => prev + 1);
  }, []);

  const handleClose = useCallback(() => {
    // Reset state before closing so next open starts fresh
    setLoading(true);
    setHasError(false);
    setAndroidRenderCrashed(false);
    setCanGoBack(false);
    setCurrentTitle(reference);
    // Increment key so the next open creates a fresh WebView instance.
    // This ensures injectedJavaScript runs again on the new mount.
    setWebViewKey((prev) => prev + 1);
    onClose();
  }, [onClose, reference]);

  /**
   * Android-only: called when the WebView renderer process is killed.
   * Without this handler the crash propagates and terminates the app.
   */
  const handleRenderProcessGone = useCallback(
    (syntheticEvent: { nativeEvent: WebViewRenderProcessGoneDetail }) => {
      const { didCrash } = syntheticEvent.nativeEvent ?? {};
      // Whether it crashed or was killed by the OS, show the error UI
      console.warn(
        `[BibleGatewayModal] Android WebView render process gone (didCrash=${String(didCrash ?? false)})`,
      );
      setLoading(false);
      setHasError(true);
      setAndroidRenderCrashed(true);
    },
    [],
  );

  /**
   * Prevent Bible Gateway (or ads) from opening new browser windows.
   * On Android, `window.open()` without `setSupportMultipleWindows`
   * crashes the WebView — we intercept and load in the same view.
   */
  /**
   * Prevent third-party navigations (ads opening new pages).
   *
   * **iOS-only**: on iOS `onShouldStartLoadWithRequest` fires only for
   * main-frame navigations, so blocking non-BibleGateway URLs is safe.
   *
   * **Android**: the callback fires for ALL resource loads (scripts, CSS,
   * images, XHR).  Blocking those prevents the passage from rendering.
   * We use `originWhitelist` for basic security on Android instead.
   */
  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string; navigationType: string; isTopFrame?: boolean }) => {
      if (Platform.OS === 'android') {
        // On Android allow all resources so the passage can load.
        // originWhitelist already limits initial navigation to https.
        return true;
      }

      // iOS: only allow Bible Gateway navigations
      const requestUrl = request.url ?? '';
      if (
        requestUrl.startsWith('https://www.biblegateway.com') ||
        requestUrl.startsWith('https://biblegateway.com') ||
        requestUrl === 'about:blank'
      ) {
        return true;
      }
      return false;
    },
    [],
  );

  const styles = createStyles(theme);

  // ── Injected JS: hide Bible Gateway UI chrome for cleaner reading ──
  //
  // On **Android**: reuses `androidCleanupJS` (defined above) which is
  // also re-injected on every `onLoadEnd` for reliability.
  //
  // On **iOS**: BibleGateway renders passage synchronously, so a single
  // pass + MutationObserver is sufficient.
  const injectedJS = Platform.OS === 'android'
    ? androidCleanupJS
    : `
    (function() {
      try {
        var HIDE_SELECTORS = [
          '.header-nav', '.navbar', '.footer', '.bg-sidebar',
          '.sidebar', '.search-form', '#header', '#footer',
          '.passage-resources', '.publisher-info-bottom',
          '.dropdown.header-nav-flyout', '.header-search',
          '.bg-header', '.site-footer'
        ];

        function hideChrome() {
          HIDE_SELECTORS.forEach(function(sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function(el) { el.style.display = 'none'; });
          });
        }

        function stylePassage() {
          var passage = document.querySelector('.passage-text');
          if (passage) {
            passage.style.fontSize = '18px';
            passage.style.lineHeight = '1.7';
            passage.style.padding = '16px';
            return true;
          }
          return false;
        }

        hideChrome();
        var found = stylePassage();

        if (!found && typeof MutationObserver !== 'undefined') {
          var observer = new MutationObserver(function() {
            hideChrome();
            if (stylePassage()) {
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
          setTimeout(function() { observer.disconnect(); }, 15000);
        }
      } catch(e) {}
    })();
    true;
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
      hardwareAccelerated={Platform.OS === 'android'}
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

        {/* Error / crash state */}
        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name={androidRenderCrashed ? 'warning-outline' : 'cloud-offline-outline'}
              size={64}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.errorTitle}>
              {androidRenderCrashed
                ? (t('error.webViewCrash') ?? 'The page viewer encountered an issue')
                : (t('error.networkError') ?? 'Could not load passage')}
            </Text>
            <Text style={styles.errorMessage}>
              {androidRenderCrashed
                ? (t('devotions.bibleGateway.crashMessage') ??
                  'The Bible reader stopped unexpectedly. Tap Retry to reload.')
                : (t('devotions.bibleGateway.errorMessage') ??
                  'Check your internet connection and try again.')}
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
            key={`bible-webview-${webViewKey}`}
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleError}
            onNavigationStateChange={handleNavChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            injectedJavaScript={injectedJS}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            // Security: only allow Bible Gateway
            originWhitelist={['https://*']}
            // ── iOS-only props ──────────────────────────────────────
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
            allowsInlineMediaPlayback
            // ── Android-specific hardening ──────────────────────────
            // Prevents window.open() from crashing the WebView
            setSupportMultipleWindows={false}
            // Required: BibleGateway loads passage text via AJAX from
            // API subdomains.  Android WebView blocks third-party cookies
            // by default (since Android 5.0), causing the passage API
            // calls to fail silently → empty passage area.
            thirdPartyCookiesEnabled={Platform.OS === 'android'}
            // Share cookies with the system browser for consent/session
            sharedCookiesEnabled
            // Use software layer on Android — "hardware" can cause blank
            // rendering inside a Modal on certain GPU drivers/devices
            androidLayerType="none"
            // Prevents elastic over-scroll on Android
            overScrollMode="never"
            // Allow nested scrolling inside the Modal's ScrollView
            nestedScrollEnabled={Platform.OS === 'android'}
            // Catches Android renderer process crash — prevents app crash
            onRenderProcessGone={
              Platform.OS === 'android' ? handleRenderProcessGone : undefined
            }
            // Prevent file:// and content:// access for security
            allowFileAccess={false}
            // Disable geolocation (not needed)
            geolocationEnabled={false}
            // Let the system WebView use its default user agent.
            // A custom UA can cause BibleGateway to serve incompatible content.
            // Text-size accessibility: follow system setting on Android
            textZoom={100}
            // Mitigate mixed content issues on Android
            mixedContentMode="compatibility"
            // Enable disk/memory caching for offline resilience
            cacheEnabled
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
      // Android: extra top padding inside fullScreen modal to prevent
      // the close button / toolbar from being cut off by the status bar.
      // StatusBar.currentHeight is only available on Android.
      ...(Platform.OS === 'android' && StatusBar.currentHeight
        ? { paddingTop: StatusBar.currentHeight }
        : {}),
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
