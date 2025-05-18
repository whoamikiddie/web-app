import type { Place } from '@/store/familyStore';
import { useFamilyStore } from '@/store/familyStore';
import { isLocationWithinPlace } from '@/utils/helpers';
import {
  registerLocationTasks,
  TRACKING_CONFIG,
  unregisterLocationTasks,
  updateLocationTasks
} from '@/utils/locationTaskManager';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

interface BatteryLevelEventData {
  batteryLevel: number;
}

export default function useLocationTracking() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(80); // Mock battery level
  const [isMoving, setIsMoving] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  
  const { 
    currentUserId, 
    updateLocation, 
    places, 
    trackingFrequency,
    privacyMode,
    setLastReportedLocation,
    lastReportedLocation,
    pauseTrackingWhenStationary,
    reducedAccuracyWhenBackground
  } = useFamilyStore();
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const tasksConfigured = useRef(false);
  
  // Mock battery monitoring
  useEffect(() => {
    // Simulate battery updates
    const interval = setInterval(() => {
      const mockBatteryLevel = Math.max(75, Math.floor(Math.random() * 100));
      setBatteryLevel(mockBatteryLevel);
      
      if (currentUserId) {
        useFamilyStore.getState().updateMember(currentUserId, {
          battery: mockBatteryLevel
        });
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [currentUserId]);
  
  // App state change monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // App coming to foreground from background or inactive state
      if (
        (appStateRef.current === 'background' || appStateRef.current === 'inactive') &&
        nextAppState === 'active'
      ) {
        // Get a fresh location update when app comes to foreground
        if (isTracking && currentUserId && !privacyMode) {
          getOneTimeLocation();
        }
      }
      
      // App going to background
      if (appStateRef.current === 'active' && nextAppState === 'background') {
        // Could add logic for when app goes to background
      }
      
      appStateRef.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, [isTracking, currentUserId, privacyMode]);
  
  // Request permissions for location tracking
  const requestPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return false;
      }
      
      // Only request background permissions on mobile platforms
      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission not granted');
          // We can still continue with foreground tracking
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setErrorMsg('Failed to request location permissions');
      return false;
    }
  };
  
  // Start location tracking
  const startTracking = async () => {
    if (!currentUserId) {
      setErrorMsg('No current user set');
      return;
    }

    // Don't track if privacy mode is enabled
    if (privacyMode) {
      console.log('Location tracking paused due to privacy mode');
      stopTracking();
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Stop any existing subscription
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      
      // Configure accuracy based on battery level
      const accuracy = getAccuracyBasedOnBattery();
      
      // Start foreground location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval: TRACKING_CONFIG[trackingFrequency].distanceInterval,
          timeInterval: TRACKING_CONFIG[trackingFrequency].timeInterval,
          // Prevent the device from sleeping while getting location updates
          ...(Platform.OS === 'android' ? {
            foregroundService: {
              notificationTitle: "Location tracking active",
              notificationBody: "Your location is being shared with family members",
              notificationColor: "#4A80F0",
            }
          } : {})
        },
        (location) => {
          if (currentUserId) {
            // Skip updates if we're stationary and have that setting enabled
            if (pauseTrackingWhenStationary && !isMoving && lastUpdatedAt) {
              const timeSinceLastUpdate = Date.now() - lastUpdatedAt;
              // But still update at least every 10 minutes even when stationary
              if (timeSinceLastUpdate < 10 * 60 * 1000) {
                return;
              }
            }
            
            // Detect if the user is moving
            detectMovement(location);
            
            // Check if this is a significant location change
            const isSignificantChange = isSignificantLocationChange(
              location.coords.latitude,
              location.coords.longitude
            );
            
            if (isSignificantChange) {
              updateLocation({
                memberId: currentUserId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: location.timestamp,
                accuracy: location.coords.accuracy ?? undefined,
                battery: batteryLevel ?? undefined,
              });
              
              // Update last reported location
              setLastReportedLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              });
              
              // Update timestamp
              setLastUpdatedAt(Date.now());
              
              // Check if user entered or exited any saved places
              checkPlaceBoundaries(
                location.coords.latitude,
                location.coords.longitude
              );
            }
          }
        }
      );
      
      // Register background tracking
      const success = await registerLocationTasks();
      if (success) {
        tasksConfigured.current = true;
      }
      
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Failed to start location tracking');
    }
  };
  
  // Get appropriate accuracy level based on battery and tracking frequency
  const getAccuracyBasedOnBattery = () => {
    if (batteryLevel !== null) {
      if (batteryLevel < 15) {
        return Location.Accuracy.Lowest;
      } else if (batteryLevel < 30) {
        return Location.Accuracy.Low;
      }
    }
    
    if (trackingFrequency === 'high') {
      return batteryLevel && batteryLevel < 50 
        ? Location.Accuracy.Balanced 
        : Location.Accuracy.High;
    } else if (trackingFrequency === 'medium') {
      return Location.Accuracy.Balanced;
    } else if (trackingFrequency === 'low') {
      return Location.Accuracy.Low;
    } else {
      return Location.Accuracy.Lowest;
    }
  };
  
  // Detect if the user is moving based on location updates
  const detectMovement = (location: Location.LocationObject) => {
    if (!lastReportedLocation) {
      return;
    }
    
    if (location.coords.speed !== null && location.coords.speed !== undefined) {
      // Speed is in meters/second
      setIsMoving(location.coords.speed > 0.5); // Moving faster than 0.5 m/s (1.8 km/h)
    } else {
      // If speed isn't available, use distance over time
      const timeSinceLastUpdate = lastUpdatedAt ? Date.now() - lastUpdatedAt : 0;
      
      if (timeSinceLastUpdate > 0) {
        const { latitude: lastLat, longitude: lastLng } = lastReportedLocation;
        
        // Calculate distance between points
        const distance = Math.sqrt(
          Math.pow(location.coords.latitude - lastLat, 2) + 
          Math.pow(location.coords.longitude - lastLng, 2)
        ) * 111000; // Rough conversion to meters
        
        // Calculate speed in meters/second
        const speed = distance / (timeSinceLastUpdate / 1000);
        
        // Update moving state
        setIsMoving(speed > 0.5); // Moving faster than 0.5 m/s (1.8 km/h)
      }
    }
  };

  // Stop location tracking
  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    // Stop background location updates
    await unregisterLocationTasks();
    tasksConfigured.current = false;
    
    setIsTracking(false);
  };

  // Get a single location update (for manual check-ins)
  const getOneTimeLocation = async () => {
    if (!currentUserId) {
      setErrorMsg('No current user set');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Use lowest accuracy possible for one-time location to save battery
      const accuracy = batteryLevel !== null && batteryLevel < 30 
        ? Location.Accuracy.Lowest 
        : Location.Accuracy.Balanced;
        
      const location = await Location.getCurrentPositionAsync({
        accuracy,
      });
      
      updateLocation({
        memberId: currentUserId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy ?? undefined,
        battery: batteryLevel ?? undefined,
      });
      
      // Update last reported location
      setLastReportedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      // Check if user entered or exited any saved places
      checkPlaceBoundaries(
        location.coords.latitude,
        location.coords.longitude
      );
      
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Failed to get current location');
      return null;
    }
  };

  // Check if the location change is significant enough to report
  const isSignificantLocationChange = (latitude: number, longitude: number): boolean => {
    if (!lastReportedLocation) return true;
    
    const { latitude: lastLat, longitude: lastLng } = lastReportedLocation;
    
    // Calculate distance between points
    const distance = Math.sqrt(
      Math.pow(latitude - lastLat, 2) + 
      Math.pow(longitude - lastLng, 2)
    ) * 111000; // Rough conversion to meters
    
    // Get the appropriate threshold based on tracking frequency
    let threshold = TRACKING_CONFIG[trackingFrequency].distanceInterval;
    
    // Adjust threshold based on battery level and movement state
    if (batteryLevel !== null && batteryLevel < 30) {
      threshold *= 2; // More lenient when battery is low
    }
    
    if (!isMoving && pauseTrackingWhenStationary) {
      threshold *= 3; // Much more lenient when stationary
    }
    
    return distance >= threshold;
  };

  // Check if user has entered or exited any saved places
  const checkPlaceBoundaries = (latitude: number, longitude: number) => {
    // This would trigger notifications in a real app
    places.forEach((place: Place) => {
      const isInside = isLocationWithinPlace(latitude, longitude, place);
      console.log(`User is ${isInside ? 'inside' : 'outside'} ${place.name}`);
      
      // Here you would trigger notifications or update state
      // For example: notifyPlaceEntry(place.id, isInside);
    });
  };

  // Effect to restart tracking when frequency or battery settings change
  useEffect(() => {
    if (isTracking) {
      // Instead of completely restarting tracking, just update the configuration
      if (tasksConfigured.current) {
        updateLocationTasks().catch(e => console.error('Error updating location tasks:', e));
      }
    }
  }, [trackingFrequency, pauseTrackingWhenStationary, reducedAccuracyWhenBackground]);

  // Effect to handle privacy mode changes
  useEffect(() => {
    if (privacyMode) {
      stopTracking();
    } else if (currentUserId && !isTracking) {
      startTracking();
    }
  }, [privacyMode]);

  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    isTracking,
    startTracking,
    stopTracking,
    getOneTimeLocation,
    errorMsg,
    batteryLevel,
    isMoving
  };
} 