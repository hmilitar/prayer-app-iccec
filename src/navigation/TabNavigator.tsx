// Bottom Tab Navigator - Main navigation tabs
// Uses useTheme() to react to user-selected theme (dark/light/system) in real-time

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DailyDevotionsScreen from '../screens/DailyDevotionsScreen';
import PrayersScreen from '../screens/PrayersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from '../types/Navigation';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';
import { getTabBarHeight, getIconSize, getSpacing, DEVICE_TYPE } from '../utils/responsive';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { t } = useLocalization();
  // useTheme() resolves dark/light/system from user settings (via useSettings event emitter)
  // and updates instantly when the theme is changed from the SettingsScreen
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = getTabBarHeight();
  const iconSize = getIconSize('medium');
  const paddingHorizontal = getSpacing(1);
  const paddingVertical = getSpacing(0.5);

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