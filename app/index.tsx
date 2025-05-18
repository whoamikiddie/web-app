import OnboardingScreen from '@/components/OnboardingScreen';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { members, currentUserId } = useFamilyStore();
  const router = useRouter();

  useEffect(() => {
    // If user is already set up, redirect to main app
    if (members.length > 0 && currentUserId) {
      router.replace('/(tabs)');
    }
  }, [members, currentUserId, router]);

  return (
    <View style={styles.container}>
      <OnboardingScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});