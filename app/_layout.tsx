import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="member-detail" 
        options={{ 
          title: "Family Member",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="add-member" 
        options={{ 
          title: "Add Family Member",
          presentation: "modal",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="add-place" 
        options={{ 
          title: "Add Place",
          presentation: "modal",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="family-groups" 
        options={{ 
          title: "Family Groups",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="create-group" 
        options={{ 
          title: "Create Family Group",
          presentation: "modal",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="join-group" 
        options={{ 
          title: "Join Family Group",
          presentation: "modal",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="emergency-contacts" 
        options={{ 
          title: "Emergency Contacts",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="emergency-messages" 
        options={{ 
          title: "Emergency Messages",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
      <Stack.Screen 
        name="tracking-frequency" 
        options={{ 
          title: "Location Tracking",
          headerTitleStyle: {
            fontWeight: '600',
          }
        }} 
      />
    </Stack>
  );
}