// Bottom Tab Navigator - Main navigation tabs
// Uses useTheme() to react to user-selected theme (dark/light/system) in real-time
// On larger web/tablet screens, this shows a sidebar navigation instead

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DailyDevotionsScreen from '../screens/DailyDevotionsScreen';
import PrayersScreen from '../screens/PrayersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from '../types/Navigation';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
import { getTabBarHeight, getIconSize, getSpacing, DEVICE_TYPE, isWebPlatform, shouldShowSidebar, getSidebarWidth, WEB_BREAKPOINTS } from '../utils/responsive';
import WebSidebar from '../components/common/WebSidebar';

const Tab = createBottomTabNavigator<TabParamList>();

// Type for navigation prop that includes both bottom tab and the ability to switch
type TabNavigationProp = BottomTabNavigationProp<TabParamList>;

export default function TabNavigator() {
  const { t } = useLocalization();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  
  const [activeRoute, setActiveRoute] = useState<string>('Home');
  
  const tabBarHeight = getTabBarHeight();
  const iconSize = getIconSize('medium');
  const paddingHorizontal = getSpacing(1);
  const paddingVertical = getSpacing(0.5);

  // Check if we should show sidebar navigation
  const showSidebar = shouldShowSidebar();
  const sidebarWidth = getSidebarWidth();

  // Handle navigation from sidebar
  const handleNavigate = useCallback((routeName: string) => {
    setActiveRoute(routeName);
    navigation.navigate(routeName as keyof TabParamList);
  }, [navigation]);

  // Update active route when tab changes
  const handleTabPress = (routeName: string) => {
    setActiveRoute(routeName);
  };

  // Render the appropriate navigation based on screen size
  if (showSidebar) {
    return (
      <View style={styles.container}>
        <WebSidebar 
          currentRoute={activeRoute} 
          onNavigate={handleNavigate}
          style={{ width: sidebarWidth }}
        />
        <View style={styles.contentContainer}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: true,
              headerStyle: {
                backgroundColor: theme.colors.background.primary,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border.light,
              },
              headerTitleStyle: {
                color: theme.colors.text.primary,
                fontWeight: '600',
              },
              tabBarStyle: {
                display: 'none', // Hide tab bar on web sidebar mode
              },
              tabBarActiveTintColor: theme.colors.secondary[500],
              tabBarInactiveTintColor: theme.colors.text.tertiary,
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'DailyReadings') {
                  iconName = focused ? 'book' : 'book-outline';
                } else if (route.name === 'Prayers') {
                  iconName = focused ? 'heart' : 'heart-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={iconSize} color={color} />;
              },
            })}
            screenListeners={({ route }) => ({
              tabPress: (e) => {
                handleTabPress(route.name);
              },
            })}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{ 
                tabBarLabel: t('navigation.home'),
                headerTitle: t('navigation.home'),
              }}
            />
            <Tab.Screen
              name="DailyReadings"
              component={DailyDevotionsScreen}
              options={{ 
                tabBarLabel: t('navigation.dailyReadings'),
                headerTitle: t('navigation.dailyReadings'),
              }}
            />
            <Tab.Screen
              name="Prayers"
              component={PrayersScreen}
              options={{ 
                tabBarLabel: t('navigation.prayers'),
                headerTitle: t('navigation.prayers'),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ 
                tabBarLabel: t('navigation.settings'),
                headerTitle: t('navigation.settings'),
              }}
            />
          </Tab.Navigator>
        </View>
      </View>
    );
  }

  // Original bottom tab navigation for mobile
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DailyReadings') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Prayers') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          borderTopWidth: 1,
          paddingTop: paddingVertical,
          paddingBottom: Math.max(paddingVertical, insets.bottom),
          paddingHorizontal: paddingHorizontal,
          height: tabBarHeight + insets.bottom,
          elevation: 8, // Android shadow
          shadowColor: theme.colors.text.secondary, // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: getSpacing(0.25),
        },
        tabBarLabelStyle: {
          fontSize: DEVICE_TYPE.includes('tablet') ? 12 : 11,
          fontWeight: '500',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t('navigation.home') }}
      />
      <Tab.Screen
        name="DailyReadings"
        component={DailyDevotionsScreen}
        options={{ tabBarLabel: t('navigation.dailyReadings') }}
      />
      <Tab.Screen
        name="Prayers"
        component={PrayersScreen}
        options={{ tabBarLabel: t('navigation.prayers') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('navigation.settings') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
});