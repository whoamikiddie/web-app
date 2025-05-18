import type { Place } from '@/store/familyStore';

export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };
  
  export const formatTimestamp = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  export const calculateRegion = (
    locations: Array<{ latitude: number; longitude: number }>,
    padding = 0.1
  ) => {
    if (locations.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
  
    let minLat = locations[0].latitude;
    let maxLat = locations[0].latitude;
    let minLng = locations[0].longitude;
    let maxLng = locations[0].longitude;
  
    locations.forEach(location => {
      minLat = Math.min(minLat, location.latitude);
      maxLat = Math.max(maxLat, location.latitude);
      minLng = Math.min(minLng, location.longitude);
      maxLng = Math.max(maxLng, location.longitude);
    });
  
    const latDelta = (maxLat - minLat) + padding;
    const lngDelta = (maxLng - minLng) + padding;
  
    return {
      latitude: (maxLat + minLat) / 2,
      longitude: (maxLng + minLng) / 2,
      latitudeDelta: latDelta || 0.0922,
      longitudeDelta: lngDelta || 0.0421,
    };
  };
  
  // Generate a 6-character invite code for family groups
  export const generateInviteCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
  
  // Calculate distance between two coordinates in meters
  export const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
  
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
    return R * c;
  };
  
  // Check if a location is within a place's radius
  export const isLocationWithinPlace = (
    latitude: number,
    longitude: number,
    place: Place
  ): boolean => {
    const distance = calculateDistance(
      latitude,
      longitude,
      place.latitude,
      place.longitude
    );
    
    return distance <= place.radius;
  };
  
  // Format phone number for display
  export const formatPhoneNumber = (phone: string): string => {
    // Basic formatting for US numbers, can be expanded for international
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if we can't format it
    return phone;
  };