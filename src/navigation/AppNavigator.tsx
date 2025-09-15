// Main App Navigator - Root navigation configuration

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import PrayerDetailScreen from '../screens/PrayerDetailScreen';

// Create a simple type for the root stack
type RootStackParamList = {
  Main: undefined;
  PrayerDetail: { prayerId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Main"
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="PrayerDetail" 
          component={PrayerDetailScreen}
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}