import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useLocalization } from './src/hooks/useLocalization';
import { useSettings } from './src/hooks/useSettings';
import { lightTheme, darkTheme } from './src/styles/theme';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

function AppContent() {
  const { loading: localizationLoading, error: localizationError, t } = useLocalization();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();
  const colorScheme = useColorScheme();
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for both localization and settings to load
    if (!localizationLoading && !settingsLoading) {
      setIsInitialized(true);
    }
  }, [localizationLoading, settingsLoading]);

  // Determine theme based on settings or system preference
  const isDarkMode = 
    settings?.theme === 'dark' || 
    (settings?.theme === 'system' && colorScheme === 'dark');

  const getTheme = () => {
    // Note: This local theme logic is for the loading screen only.
    // The main app uses the useTheme hook which includes Liturgical updates.
    return isDarkMode ? darkTheme : lightTheme;
  };

  const theme = getTheme();

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          {t('common.loading')}
        </Text>
        {(localizationError || settingsError) && (
          <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
            {localizationError || settingsError}
          </Text>
        )}
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});