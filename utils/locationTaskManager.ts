import { useFamilyStore } from '@/store/familyStore';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Battery from 'expo-battery';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

// Define TaskManagerTaskBody interface
interface TaskManagerTaskBody {
  data?: any;
  error?: Error | null;
}

// Task names
export const LOCATION_BACKGROUND_TASK = 'LOCATION_BACKGROUND_TASK';
export const SIGNIFICANT_LOCATION_CHANGE_TASK = 'SIGNIFICANT_LOCATION_CHANGE_TASK';
export const BATTERY_MONITORING_TASK = 'BATTERY_MONITORING_TASK';

// Tracking configuration based on frequency
export const TRACKING_CONFIG = {
  'ultra-efficient': {
    distanceInterval: 100, // meters
    timeInterval: 30 * 60 * 1000, // 30 minutes
    deferredUpdatesInterval: 60 * 60 * 1000, // 1 hour
    deferredUpdatesDistance: 500, // 500 meters
    significantChangeOnly: true
  },
  'battery-saver': {
    distanceInterval: 50, // meters
    timeInterval: 15 * 60 * 1000, // 15 minutes
    deferredUpdatesInterval: 30 * 60 * 1000, // 30 minutes
    deferredUpdatesDistance: 250, // 250 meters
    significantChangeOnly: false
  },
  'low': {
    distanceInterval: 30, // meters
    timeInterval: 5 * 60 * 1000, // 5 minutes
    deferredUpdatesInterval: 15 * 60 * 1000, // 15 minutes
    deferredUpdatesDistance: 150, // 150 meters
    significantChangeOnly: false
  },
  'medium': {
    distanceInterval: 20, // meters
    timeInterval: 60 * 1000, // 1 minute
    deferredUpdatesInterval: 5 * 60 * 1000, // 5 minutes
    deferredUpdatesDistance: 100, // 100 meters
    significantChangeOnly: false
  },
  'high': {
    distanceInterval: 10, // meters
    timeInterval: 30 * 1000, // 30 seconds
    deferredUpdatesInterval: 2 * 60 * 1000, // 2 minutes
    deferredUpdatesDistance: 50, // 50 meters
    significantChangeOnly: false
  }
};

// Define the task handler for regular background location
TaskManager.defineTask(LOCATION_BACKGROUND_TASK, async ({ data, error }: TaskManagerTaskBody) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (!data) {
    console.warn('No data received in background location task');
    return;
  }
  
  // Cast to expected location data structure
  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];
  
  if (!location) {
    return;
  }
  
  const store = useFamilyStore.getState();
  const batteryLevel = await Battery.getBatteryLevelAsync();
  
  // Check if paused when stationary
  if (store.pauseTrackingWhenStationary && !hasMovedSignificantly(location, store.lastReportedLocation)) {
    console.log('[LocationTask] Skipping update - device is stationary');
    return;
  }
  
  // Update location in the store
  if (store.currentUserId) {
    store.updateLocation({
      memberId: store.currentUserId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: Date.now(),
      accuracy: location.coords.accuracy,
      battery: typeof batteryLevel === 'number' ? batteryLevel * 100 : undefined
    });
    
    // Update last reported location
    store.setLastReportedLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
  }
  
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Define the task handler for significant location changes (used in ultra-efficient mode)
TaskManager.defineTask(SIGNIFICANT_LOCATION_CHANGE_TASK, async ({ data, error }: TaskManagerTaskBody) => {
  if (error) {
    console.error('Significant location change task error:', error);
    return;
  }
  
  if (!data) {
    console.warn('No data received in significant location change task');
    return;
  }
  
  // Cast to expected location data structure
  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];
  
  if (!location) {
    return;
  }
  
  const store = useFamilyStore.getState();
  const batteryLevel = await Battery.getBatteryLevelAsync();
  
  // Always update on significant location changes
  if (store.currentUserId) {
    store.updateLocation({
      memberId: store.currentUserId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: Date.now(),
      accuracy: location.coords.accuracy,
      battery: typeof batteryLevel === 'number' ? batteryLevel * 100 : undefined
    });
    
    // Update last reported location
    store.setLastReportedLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
  }
  
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Define the task handler for battery monitoring
TaskManager.defineTask(BATTERY_MONITORING_TASK, async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  const store = useFamilyStore.getState();
  
  if (store.currentUserId) {
    // Just update the battery level without changing location
    store.updateMember(store.currentUserId, {
      battery: batteryLevel * 100
    });
  }
  
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Helper function to determine if the device has moved significantly
export function hasMovedSignificantly(
  newLocation: Location.LocationObject,
  lastLocation: { latitude: number; longitude: number } | null
): boolean {
  if (!lastLocation) return true;
  
  // Calculate distance between points using Haversine formula
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lastLocation.latitude * Math.PI) / 180;
  const φ2 = (newLocation.coords.latitude * Math.PI) / 180;
  const Δφ = ((newLocation.coords.latitude - lastLocation.latitude) * Math.PI) / 180;
  const Δλ = ((newLocation.coords.longitude - lastLocation.longitude) * Math.PI) / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Consider movement significant if more than 20 meters
  return distance > 20;
}

// Mock implementation for registerLocationTasks
export async function registerLocationTasks(): Promise<boolean> {
  console.log('MOCK: Registering location tasks');
  
  try {
    // Request permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('Foreground location permission denied');
      return false;
    }
    
    if (Location.requestBackgroundPermissionsAsync) {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission denied - some features may not work');
      }
    }
    
    // In a real implementation, we would register background tasks here
    console.log('MOCK: Tasks registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering location tasks:', error);
    return false;
  }
}

// Mock implementation for unregisterLocationTasks
export async function unregisterLocationTasks(): Promise<void> {
  console.log('MOCK: Unregistering location tasks');
  // In a real implementation, we would unregister background tasks here
}

// Mock implementation for updateLocationTasks
export async function updateLocationTasks(): Promise<boolean> {
  console.log('MOCK: Updating location tasks');
  return registerLocationTasks();
} 