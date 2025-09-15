// Bottom Tab Navigator - Main navigation tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import DailyReadingsScreen from '../screens/DailyReadingsScreen';
import PrayersScreen from '../screens/PrayersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from '../types/Navigation';
import { useLocalization } from '../hooks/useLocalization';
import { lightTheme, darkTheme } from '../styles/theme';
import { getTabBarHeight, getIconSize, getSpacing, DEVICE_TYPE } from '../utils/responsive';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { t } = useLocalization();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
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
        component={DailyReadingsScreen}
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