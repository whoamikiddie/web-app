import Colors from '@/constants/colors';
import TrackingSettingsScreen from '@/screens/TrackingSettingsScreen';
import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';

export default function TrackingSettingsRoute() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <Stack.Screen 
        options={{
          title: 'Battery & Location Settings',
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.light.background,
          }
        }} 
      />
      <TrackingSettingsScreen />
    </>
  );
} 