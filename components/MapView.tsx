import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyMember, Place } from '@/types/family';
import { calculateRegion } from '@/utils/helpers';
import { MapPin, Navigation, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Web fallback component since we can't use react-native-maps on web
const WebMapFallback = ({ members }: { members: FamilyMember[] }) => {
  return (
    <View style={styles.webFallback}>
      <Text style={styles.webFallbackTitle}>Family Map</Text>
      <Text style={styles.webFallbackText}>
        Map view is available on mobile devices.
      </Text>
      <View style={styles.webFallbackList}>
        {members.map((member: FamilyMember) => (
          member.lastLocation ? (
            <View key={member.id} style={styles.webFallbackItem}>
              <MapPin size={16} color={Colors.light.primary} />
              <Text style={styles.webFallbackItemText}>
                {member.name}: {member.lastLocation.latitude.toFixed(6)}, {member.lastLocation.longitude.toFixed(6)}
              </Text>
            </View>
          ) : null
        ))}
      </View>
    </View>
  );
};

export default function MapViewComponent() {
  const { members, places, currentGroupId, familyGroups } = useFamilyStore();
  const [region, setRegion] = useState<any>(null);
  const [showAllMembers, setShowAllMembers] = useState(true);
  
  // We need to dynamically import react-native-maps to avoid web issues
  const [MapViewComponent, setMapViewComponent] = useState<any>(null);
  const [MarkerComponent, setMarkerComponent] = useState<any>(null);
  const [CircleComponent, setCircleComponent] = useState<any>(null);
  
  const mapRef = useRef<any>(null);

  // Filter members based on current group
  const filteredMembers = showAllMembers 
    ? members 
    : currentGroupId 
      ? members.filter(member => {
          const currentGroup = familyGroups.find(g => g.id === currentGroupId);
          return currentGroup?.members.includes(member.id);
        })
      : members;

  useEffect(() => {
    // Only import react-native-maps on native platforms
    if (Platform.OS !== 'web') {
      import('react-native-maps').then((module) => {
        setMapViewComponent(() => module.default);
        setMarkerComponent(() => module.Marker);
        setCircleComponent(() => module.Circle);
      }).catch(err => {
        console.error('Error loading react-native-maps:', err);
      });
    }
  }, []);

  useEffect(() => {
    // Calculate map region based on all family members with location data
    const locations = filteredMembers
      .filter(member => member.lastLocation)
      .map(member => ({
        latitude: member.lastLocation?.latitude || 0,
        longitude: member.lastLocation?.longitude || 0
      }));
    
    if (locations.length > 0) {
      const calculatedRegion = calculateRegion(locations);
      setRegion(calculatedRegion);
    }
  }, [filteredMembers]);

  const handleCenterMap = () => {
    if (mapRef.current && region) {
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const toggleMemberFilter = () => {
    setShowAllMembers(!showAllMembers);
  };

  // Web fallback
  if (Platform.OS === 'web') {
    return <WebMapFallback members={filteredMembers} />;
  }

  // Wait for dynamic imports
  if (!MapViewComponent || !MarkerComponent || !CircleComponent) {
    return (
      <View style={styles.loading}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        initialRegion={region || {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={region}
      >
        {filteredMembers.map(member => (
          member.lastLocation ? (
            <MarkerComponent
              key={member.id}
              coordinate={{
                latitude: member.lastLocation.latitude,
                longitude: member.lastLocation.longitude,
              }}
              title={member.name}
              description={member.status === 'sos' ? 'SOS! Emergency!' : undefined}
              pinColor={member.status === 'sos' ? '#F44336' : '#4A80F0'}
            />
          ) : null
        ))}
        
        {places.map((place: Place) => (
          <React.Fragment key={place.id}>
            <MarkerComponent
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              pinColor="#9C27B0"
            />
            <CircleComponent
              center={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              radius={place.radius}
              strokeColor="rgba(156, 39, 176, 0.3)"
              fillColor="rgba(156, 39, 176, 0.1)"
            />
          </React.Fragment>
        ))}
      </MapViewComponent>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleMemberFilter}
        >
          <Users size={20} color={Colors.light.primary} />
          <Text style={styles.filterButtonText}>
            {showAllMembers ? 'All Members' : 'Group Only'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.centerButton}
          onPress={handleCenterMap}
        >
          <Navigation size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'column',
    gap: 10,
  },
  centerButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    margin: 16,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.text,
  },
  webFallbackText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  webFallbackList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  webFallbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  webFallbackItemText: {
    fontSize: 14,
    color: Colors.light.text,
  },
});