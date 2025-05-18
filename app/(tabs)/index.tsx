import EmergencySOS from '@/components/EmergencySOS';
import MapView from '@/components/MapView';
import useLocationTracking from '@/hooks/useLocationTracking';
import { useFamilyStore } from '@/store/familyStore';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function MapScreen() {
  const { startTracking, stopTracking, isTracking, errorMsg } = useLocationTracking();
  const { currentUserId } = useFamilyStore();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    // Start location tracking when component mounts
    if (currentUserId && !isTracking) {
      startTracking();
    }

    // Simulate battery level updates
    // In a real app, you would use a native module to get actual battery level
    const batteryInterval = setInterval(() => {
      if (Platform.OS !== 'web' && currentUserId) {
        // Simulate battery drain (in a real app, use Battery API)
        const randomBattery = Math.floor(Math.random() * 100);
        setBatteryLevel(randomBattery);
        
        // Update the battery level in the store
        if (randomBattery !== null) {
          useFamilyStore.getState().updateMember(currentUserId, {
            battery: randomBattery
          });
        }
      }
    }, 60000); // Update every minute

    return () => {
      stopTracking();
      clearInterval(batteryInterval);
    };
  }, [currentUserId, isTracking]);

  return (
    <View style={styles.container}>
      <MapView />
      <View style={styles.sosContainer}>
        <EmergencySOS />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  sosContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});