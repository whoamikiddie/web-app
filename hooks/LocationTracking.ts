import { useFamilyStore } from '@/store/familyStore';
import { isLocationWithinPlace } from '@/utils/helpers';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Define tracking intervals based on frequency settings
const TRACKING_INTERVALS = {
  high: 30000, // 30 seconds
  medium: 60000, // 1 minute
  low: 300000, // 5 minutes
  'battery-saver': 900000, // 15 minutes
};

// Distance thresholds for significant location changes
const DISTANCE_THRESHOLDS = {
  high: 10, // 10 meters
  medium: 50, // 50 meters
  low: 100, // 100 meters
  'battery-saver': 500, // 500 meters
};

export default function useLocationTracking() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { 
    currentUserId, 
    updateLocation, 
    places, 
    trackingFrequency,
    privacyMode
  } = useFamilyStore();
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastReportedLocation = useRef<{latitude: number, longitude: number} | null>(null);

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
      
      // Configure accuracy based on platform and frequency
      let accuracy;
      if (Platform.OS === 'android') {
        accuracy = trackingFrequency === 'high' 
          ? Location.Accuracy.High 
          : trackingFrequency === 'battery-saver'
            ? Location.Accuracy.Lowest
            : Location.Accuracy.Balanced;
      } else {
        accuracy = trackingFrequency === 'high'
          ? Location.Accuracy.BestForNavigation
          : trackingFrequency === 'battery-saver'
            ? Location.Accuracy.Lowest
            : Location.Accuracy.Balanced;
      }
      
      // Start location updates with battery-saving settings
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval: DISTANCE_THRESHOLDS[trackingFrequency],
          timeInterval: TRACKING_INTERVALS[trackingFrequency],
        },
        (location) => {
          if (currentUserId) {
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
              });
              
              // Update last reported location
              lastReportedLocation.current = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              };
              
              // Check if user entered or exited any saved places
              checkPlaceBoundaries(
                location.coords.latitude,
                location.coords.longitude
              );
            }
          }
        }
      );
      
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setErrorMsg('Failed to start location tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
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
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      updateLocation({
        memberId: currentUserId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy ?? undefined,
      });
      
      // Update last reported location
      lastReportedLocation.current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
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
    if (!lastReportedLocation.current) return true;
    
    const { latitude: lastLat, longitude: lastLng } = lastReportedLocation.current;
    
    // Calculate distance between points
    const distance = Math.sqrt(
      Math.pow(latitude - lastLat, 2) + 
      Math.pow(longitude - lastLng, 2)
    ) * 111000; // Rough conversion to meters
    
    return distance >= DISTANCE_THRESHOLDS[trackingFrequency];
  };

  // Check if user has entered or exited any saved places
  const checkPlaceBoundaries = (latitude: number, longitude: number) => {
    // This would trigger notifications in a real app
    places.forEach(place => {
      const isInside = isLocationWithinPlace(latitude, longitude, place);
      console.log(`User is ${isInside ? 'inside' : 'outside'} ${place.name}`);
      
      // Here you would trigger notifications or update state
      // For example: notifyPlaceEntry(place.id, isInside);
    });
  };

  // Effect to restart tracking when frequency changes
  useEffect(() => {
    if (isTracking) {
      stopTracking();
      startTracking();
    }
  }, [trackingFrequency]);

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
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  return {
    startTracking,
    stopTracking,
    getOneTimeLocation,
    isTracking,
    errorMsg,
  };
}